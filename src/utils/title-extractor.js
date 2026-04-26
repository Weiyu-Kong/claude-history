import { stripMarkdown } from './markdown.js';

/**
 * Extract title from text (typically the first user message)
 * - Strips markdown formatting
 * - Truncates to 50 characters
 * - Trims trailing punctuation
 * @param {string} text - The text to extract title from
 * @returns {string} - The extracted title
 */
export function extractTitle(text) {
  if (!text) return 'Conversation ' + new Date().toISOString().slice(0, 10);
  const stripped = stripMarkdown(text);
  const normalized = stripped.replace(/\s+/g, ' ').trim();
  let title = normalized.slice(0, 50);
  title = title.replace(/[,.:;!?\s]+$/, '');
  if (!title) return 'Conversation ' + new Date().toISOString().slice(0, 10);
  return title;
}
