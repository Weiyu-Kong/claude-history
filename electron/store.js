'use strict';

const Database = require('better-sqlite3');
const path = require('path');

class Store {
  constructor(dbPath) {
    this.db = new Database(dbPath);
    this.db.pragma('journal_mode = WAL');
    this._init();
  }

  _init() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        name       TEXT NOT NULL,
        path       TEXT NOT NULL UNIQUE,
        updated_at INTEGER NOT NULL
      );

      CREATE TABLE IF NOT EXISTS conversations (
        id         INTEGER PRIMARY KEY AUTOINCREMENT,
        project_id INTEGER NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        file_path  TEXT NOT NULL UNIQUE,
        file_size  INTEGER NOT NULL,
        updated_at INTEGER NOT NULL,
        title      TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_conversations_project_id ON conversations(project_id);
      CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);
    `);
  }

  upsertProject(name, projectPath) {
    const now = Date.now();
    const stmt = this.db.prepare(`
      INSERT INTO projects (name, path, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(path) DO UPDATE SET
        name = excluded.name,
        updated_at = excluded.updated_at
    `);
    const result = stmt.run(name, projectPath, now);
    return result.lastInsertRowid;
  }

  getProjectByPath(projectPath) {
    const stmt = this.db.prepare('SELECT * FROM projects WHERE path = ?');
    return stmt.get(projectPath) || null;
  }

  getAllProjects() {
    const stmt = this.db.prepare('SELECT * FROM projects ORDER BY name ASC');
    return stmt.all();
  }

  upsertConversation(projectId, filePath, fileSize, updatedAt) {
    const stmt = this.db.prepare(`
      INSERT INTO conversations (project_id, file_path, file_size, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(file_path) DO UPDATE SET
        project_id = excluded.project_id,
        file_size = excluded.file_size,
        updated_at = excluded.updated_at
    `);
    const result = stmt.run(projectId, filePath, fileSize, updatedAt);
    return result.lastInsertRowid;
  }

  getConversationsByProject(projectId) {
    const stmt = this.db.prepare(
      'SELECT * FROM conversations WHERE project_id = ? ORDER BY updated_at DESC'
    );
    return stmt.all(projectId);
  }

  getConversationById(id) {
    const stmt = this.db.prepare('SELECT * FROM conversations WHERE id = ?');
    return stmt.get(id) || null;
  }

  getConversationByFilePath(filePath) {
    const stmt = this.db.prepare('SELECT * FROM conversations WHERE file_path = ?');
    return stmt.get(filePath) || null;
  }

  updateTitle(convId, title) {
    const stmt = this.db.prepare('UPDATE conversations SET title = ? WHERE id = ?');
    return stmt.run(title, convId);
  }

  deleteConversation(filePath) {
    const stmt = this.db.prepare('DELETE FROM conversations WHERE file_path = ?');
    return stmt.run(filePath);
  }

  deleteProject(projectId) {
    // Delete associated conversations first (due to foreign key)
    const deleteConvs = this.db.prepare('DELETE FROM conversations WHERE project_id = ?');
    deleteConvs.run(projectId);
    // Then delete the project
    const deleteProj = this.db.prepare('DELETE FROM projects WHERE id = ?');
    return deleteProj.run(projectId);
  }

  close() {
    this.db.close();
  }
}

module.exports = { Store };
