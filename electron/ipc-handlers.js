'use strict';

const { ipcMain, shell } = require('electron');
const fs = require('fs');
const path = require('path');

const { Store } = require('./store');
const { scanProjects } = require('./file-scanner');
const { parseStream } = require('./jsonl-parser');
const { parseMessage } = require('./message-parser');

// Lazy-initialize store to allow data directory creation
let _store = null;
function getStore() {
  if (!_store) {
    const dbPath = path.join(process.env.HOME || '/home/user', '.claude', 'history-viewer.db');
    const dbDir = path.dirname(dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    _store = new Store(dbPath);
  }
  return _store;
}

// LRU cache for loaded conversations (max 20 entries)
const conversationCache = new Map();
const MAX_CACHE_SIZE = 20;

// Track in-flight requests to prevent duplicate parsing
const pendingRequests = new Map();

function addToCache(filePath, messages) {
  // Evict oldest entry if at capacity
  if (conversationCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = conversationCache.keys().next().value;
    conversationCache.delete(oldestKey);
  }
  conversationCache.set(filePath, messages);
}

function getFromCache(filePath) {
  return conversationCache.get(filePath) || null;
}

/**
 * Register all IPC handlers
 */
function registerIpcHandlers() {
  // 1. scan-projects — Scan projects dir, upsert to SQLite, return enriched project list
  ipcMain.handle('scan-projects', async () => {
    try {
      const store = getStore();
      const projects = scanProjects();

      for (const project of projects) {
        // Upsert project to SQLite
        store.upsertProject(project.name, project.path);

        // Get the project ID
        const dbProject = store.getProjectByPath(project.path);
        if (!dbProject) continue;

        // Upsert conversations
        for (const conv of project.conversations) {
          store.upsertConversation(
            dbProject.id,
            conv.filePath,
            conv.fileSize,
            conv.updatedAt
          );
        }

        // Fetch enriched conversations from DB and convert to camelCase
        const dbConvs = store.getConversationsByProject(dbProject.id);
        project.conversations = dbConvs.map(conv => ({
          id: conv.id,
          filePath: conv.file_path,
          fileSize: conv.file_size,
          updatedAt: conv.updated_at,
          title: conv.title
        }));
      }

      return { success: true, projects };
    } catch (err) {
      console.error('[ipc-handlers] scan-projects error:', err);
      return { success: false, error: err.message };
    }
  });

  // 2. get-conversations — Get conversations for a project from SQLite
  ipcMain.handle('get-conversations', async (_, projectId) => {
    try {
      const store = getStore();
      const dbConvs = store.getConversationsByProject(projectId);
      const conversations = dbConvs.map(conv => ({
        id: conv.id,
        filePath: conv.file_path,
        fileSize: conv.file_size,
        updatedAt: conv.updated_at,
        title: conv.title
      }));
      return { success: true, conversations };
    } catch (err) {
      console.error('[ipc-handlers] get-conversations error:', err);
      return { success: false, error: err.message };
    }
  });

  // 3. load-conversation — Stream-parse .jsonl file, LRU cache, return messages
  ipcMain.handle('load-conversation', async (_, filePath) => {
    try {
      // Check cache first
      const cached = getFromCache(filePath);
      if (cached) {
        return { success: true, messages: cached, fromCache: true };
      }

      // If there's already a pending request for this file, await it
      if (pendingRequests.has(filePath)) {
        return pendingRequests.get(filePath);
      }

      // Create the parsing promise
      const parsePromise = (async () => {
        const messages = [];
        await parseStream(filePath, (raw) => {
          const parsed = parseMessage(raw);
          messages.push(parsed);
        });
        addToCache(filePath, messages);
        return { success: true, messages, fromCache: false };
      })();

      pendingRequests.set(filePath, parsePromise);
      try {
        return await parsePromise;
      } finally {
        pendingRequests.delete(filePath);
      }
    } catch (err) {
      console.error('[ipc-handlers] load-conversation error:', err);
      return { success: false, error: err.message };
    }
  });

  // 4. update-title — Update conversation title in SQLite
  ipcMain.handle('update-title', async (_, convId, title) => {
    try {
      const store = getStore();
      store.updateTitle(convId, title);
      return { success: true };
    } catch (err) {
      console.error('[ipc-handlers] update-title error:', err);
      return { success: false, error: err.message };
    }
  });

  // 5. search-conversations — Basic title search
  ipcMain.handle('search-conversations', async (_, projectId, query) => {
    try {
      const store = getStore();
      const conversations = store.getConversationsByProject(projectId);

      if (!query || !query.trim()) {
        return { success: true, conversations };
      }

      const searchTerm = query.toLowerCase().trim();
      const filtered = conversations.filter((conv) => {
        const title = (conv.title || '').toLowerCase();
        return title.includes(searchTerm);
      });

      return { success: true, conversations: filtered };
    } catch (err) {
      console.error('[ipc-handlers] search-conversations error:', err);
      return { success: false, error: err.message };
    }
  });

  // 6. open-external — Open file path externally via shell
  ipcMain.handle('open-external', async (_, filePath) => {
    try {
      await shell.openPath(filePath);
      return { success: true };
    } catch (err) {
      console.error('[ipc-handlers] open-external error:', err);
      return { success: false, error: err.message };
    }
  });

  console.log('[ipc-handlers] All handlers registered');
}

module.exports = { registerIpcHandlers };
