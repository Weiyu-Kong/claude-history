import { parseCommandContent } from './markdown.js';

/**
 * Strip common markdown formatting from text
 * @param {string} text - Text with markdown
 * @returns {string} - Plain text
 */
function stripMarkdown(text) {
  if (!text) return '';
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

/**
 * Clean a title string by removing command tags, XML tags, and other noise
 * @param {string} title - The raw title
 * @returns {string} - Cleaned title
 */
export function cleanTitle(title) {
  if (!title) return '';
  let cleaned = title;

  // Remove local-command-caveat tags (handle missing closing tag)
  cleaned = cleaned.replace(/<local-command-caveat>[\s\S]*?(<\/local-command-caveat>)?/gi, '');

  // Remove other command XML tags and their content
  cleaned = cleaned.replace(/<command[-\w]*>[\s\S]*?<\/command[-\w]*>/gi, '');

  // Remove any remaining XML-like tags with content
  cleaned = cleaned.replace(/<[\w-]+>[\s\S]*?<\/[\w-]+>/gi, '');

  // Strip markdown
  cleaned = stripMarkdown(cleaned);

  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned || 'Untitled';
}

/**
 * Extract title from text (typically the first user message)
 * - Handles command content by extracting body only
 * - Strips markdown formatting
 * - Truncates to 50 characters
 * - Trims trailing punctuation
 * @param {string} text - The text to extract title from
 * @returns {string} - The extracted title
 */
export function extractTitle(text) {
  if (!text) return 'Conversation ' + new Date().toISOString().slice(0, 10);

  // Parse command content to get just the body
  const { body } = parseCommandContent(text);

  // If body is empty or just whitespace, use a fallback
  const trimmedBody = body.trim();
  if (!trimmedBody) {
    return 'Conversation ' + new Date().toISOString().slice(0, 10);
  }

  const stripped = stripMarkdown(trimmedBody);
  const normalized = stripped.replace(/\s+/g, ' ').trim();

  // Apply cleanTitle to remove any remaining tags
  const cleaned = cleanTitle(normalized);

  let title = cleaned.slice(0, 50);
  title = title.replace(/[,.:;!?\s]+$/, '');
  if (!title) return 'Conversation ' + new Date().toISOString().slice(0, 10);
  return title;
}
