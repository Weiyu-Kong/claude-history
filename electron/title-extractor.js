'use strict';

const { stripMarkdown } = require('./markdown');

/**
 * Extract title from text (typically the first user message)
 * - Strips markdown formatting
 * - Truncates to 50 characters
 * - Trims trailing punctuation
 * @param {string} text - The text to extract title from
 * @returns {string} - The extracted title
 */
function extractTitle(text) {
  if (!text) return '';
  const stripped = stripMarkdown(text);
  const normalized = stripped.replace(/\s+/g, ' ').trim();
  let title = normalized.slice(0, 50);
  title = title.replace(/[,.:;!?\s]+$/, '');
  return title;
}

module.exports = { extractTitle };
