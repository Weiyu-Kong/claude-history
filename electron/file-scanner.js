'use strict';

const fs = require('fs');
const path = require('path');

const PROJECTS_DIR = path.join(process.env.HOME || '/home/user', '.claude', 'projects');

/**
 * Scan a projects directory for subdirectories (projects) and .jsonl files (conversations)
 * @param {string} projectsDir - Path to the projects directory (defaults to ~/.claude/projects)
 * @returns {Array} Array of project objects with conversations
 */
function scanProjects(projectsDir = PROJECTS_DIR) {
  const projects = [];

  if (!fs.existsSync(projectsDir)) {
    return projects;
  }

  const entries = fs.readdirSync(projectsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isDirectory()) {
      const projectPath = path.join(projectsDir, entry.name);
      const conversations = scanConversations(projectPath);

      projects.push({
        id: entry.name,  // Use name as unique identifier
        name: entry.name,
        path: projectPath,
        conversations: conversations,
      });
    }
  }

  return projects;
}

/**
 * Scan a project directory for .jsonl files (conversations)
 * @param {string} projectPath - Path to the project directory
 * @returns {Array} Array of conversation objects
 */
function scanConversations(projectPath) {
  const conversations = [];

  if (!fs.existsSync(projectPath)) {
    return conversations;
  }

  const entries = fs.readdirSync(projectPath, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.jsonl')) {
      const filePath = path.join(projectPath, entry.name);

      try {
        const stats = fs.statSync(filePath);
        conversations.push({
          id: filePath,  // Use filePath as unique identifier
          filePath: filePath,
          fileSize: stats.size,
          updatedAt: stats.mtimeMs,
        });
      } catch (err) {
        // Skip files that cannot be accessed
        console.warn(`Failed to stat file ${filePath}: ${err.message}`);
      }
    }
  }

  conversations.sort((a, b) => b.updatedAt - a.updatedAt);

  return conversations;
}

module.exports = { scanProjects, scanConversations, PROJECTS_DIR };
