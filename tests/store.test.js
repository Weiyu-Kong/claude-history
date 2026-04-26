'use strict';

const fs = require('fs');
const path = require('path');
const { Store } = require('../electron/store');

describe('Store', () => {
  const dbPath = path.join(__dirname, 'test-store.db');
  let store;

  beforeAll(() => {
    // Remove existing test database if present
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    if (fs.existsSync(dbPath + '-wal')) {
      fs.unlinkSync(dbPath + '-wal');
    }
    if (fs.existsSync(dbPath + '-shm')) {
      fs.unlinkSync(dbPath + '-shm');
    }
    store = new Store(dbPath);
  });

  afterAll(() => {
    store.close();
    // Clean up test database
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
    }
    if (fs.existsSync(dbPath + '-wal')) {
      fs.unlinkSync(dbPath + '-wal');
    }
    if (fs.existsSync(dbPath + '-shm')) {
      fs.unlinkSync(dbPath + '-shm');
    }
  });

  describe('projects', () => {
    test('upsertProject inserts a new project', () => {
      const id = store.upsertProject('test-project', '/path/to/test-project');
      expect(id).toBeGreaterThan(0);

      const project = store.getProjectByPath('/path/to/test-project');
      expect(project).not.toBeNull();
      expect(project.name).toBe('test-project');
      expect(project.path).toBe('/path/to/test-project');
      expect(project.updated_at).toBeGreaterThan(0);
    });

    test('upsertProject updates existing project', () => {
      const originalId = store.upsertProject('test-project', '/path/to/test-project');
      const updatedId = store.upsertProject('updated-name', '/path/to/test-project');

      expect(updatedId).toBe(originalId);

      const project = store.getProjectByPath('/path/to/test-project');
      expect(project.name).toBe('updated-name');
    });

    test('getAllProjects returns all projects ordered by name', () => {
      store.upsertProject('zulu-project', '/path/to/zulu');
      store.upsertProject('alpha-project', '/path/to/alpha');

      const projects = store.getAllProjects();
      expect(projects.length).toBeGreaterThanOrEqual(3);

      // Check ordering
      const names = projects.map((p) => p.name);
      const sortedNames = [...names].sort((a, b) => a.localeCompare(b));
      expect(names).toEqual(sortedNames);
    });

    test('getProjectByPath returns null for non-existent project', () => {
      const project = store.getProjectByPath('/non/existent/path');
      expect(project).toBeNull();
    });
  });

  describe('conversations', () => {
    let projectId;

    beforeAll(() => {
      projectId = store.upsertProject('conv-test-project', '/path/to/conv-test');
    });

    test('upsertConversation inserts a new conversation', () => {
      const id = store.upsertConversation(
        projectId,
        '/path/to/conv-test/conversation.jsonl',
        1024,
        Date.now()
      );
      expect(id).toBeGreaterThan(0);

      const conv = store.getConversationByFilePath('/path/to/conv-test/conversation.jsonl');
      expect(conv).not.toBeNull();
      expect(conv.project_id).toBe(projectId);
      expect(conv.file_path).toBe('/path/to/conv-test/conversation.jsonl');
      expect(conv.file_size).toBe(1024);
      expect(conv.title).toBeNull();
    });

    test('upsertConversation updates existing conversation', () => {
      const originalId = store.upsertConversation(
        projectId,
        '/path/to/conv-test/conversation.jsonl',
        2048,
        Date.now()
      );

      const conv = store.getConversationByFilePath('/path/to/conv-test/conversation.jsonl');
      expect(conv.file_size).toBe(2048);
    });

    test('getConversationsByProject returns conversations ordered by updated_at DESC', () => {
      // Add multiple conversations with different timestamps
      const now = Date.now();
      store.upsertConversation(
        projectId,
        '/path/to/conv-test/older.jsonl',
        500,
        now - 1000
      );
      store.upsertConversation(
        projectId,
        '/path/to/conv-test/newer.jsonl',
        600,
        now
      );

      const convs = store.getConversationsByProject(projectId);
      expect(convs.length).toBeGreaterThanOrEqual(3);

      // Verify ordering (newest first)
      for (let i = 0; i < convs.length - 1; i++) {
        expect(convs[i].updated_at).toBeGreaterThanOrEqual(convs[i + 1].updated_at);
      }
    });

    test('getConversationById returns correct conversation', () => {
      const conv = store.getConversationByFilePath('/path/to/conv-test/conversation.jsonl');
      const byId = store.getConversationById(conv.id);
      expect(byId).not.toBeNull();
      expect(byId.id).toBe(conv.id);
      expect(byId.file_path).toBe(conv.file_path);
    });

    test('updateTitle updates conversation title', () => {
      const conv = store.getConversationByFilePath('/path/to/conv-test/conversation.jsonl');
      store.updateTitle(conv.id, 'My Test Conversation');

      const updated = store.getConversationById(conv.id);
      expect(updated.title).toBe('My Test Conversation');
    });

    test('deleteConversation removes conversation', () => {
      store.upsertConversation(
        projectId,
        '/path/to/conv-test/to-delete.jsonl',
        100,
        Date.now()
      );

      let conv = store.getConversationByFilePath('/path/to/conv-test/to-delete.jsonl');
      expect(conv).not.toBeNull();

      store.deleteConversation('/path/to/conv-test/to-delete.jsonl');
      conv = store.getConversationByFilePath('/path/to/conv-test/to-delete.jsonl');
      expect(conv).toBeNull();
    });

    test('conversation belongs to project (foreign key)', () => {
      // Insert a conversation in a different project
      const otherProjectId = store.upsertProject('other-project', '/path/to/other');
      store.upsertConversation(
        otherProjectId,
        '/path/to/other/conv.jsonl',
        200,
        Date.now()
      );

      const convs = store.getConversationsByProject(otherProjectId);
      expect(convs.length).toBe(1);
      expect(convs[0].project_id).toBe(otherProjectId);
    });
  });
});
