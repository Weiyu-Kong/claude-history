'use strict';

/**
 * Strip common markdown formatting from text
 * Handles: bold, italic, links, code blocks, inline code, headings, list markers
 * @param {string} text - The text with markdown formatting
 * @returns {string} - Plain text with markdown stripped
 */
function stripMarkdown(text) {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .replace(/`{3}[\s\S]*?`{3}/g, '')
    .replace(/`(.+?)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^[-*+]\s+/gm, '')
    .replace(/^(\d+)\.\s+/gm, '')
    .replace(/\n+/g, ' ')
    .trim();
}

module.exports = { stripMarkdown };
