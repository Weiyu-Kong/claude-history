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

  // Remove incomplete/truncated XML tags at end of string (e.g. " <command-na")
  cleaned = cleaned.replace(/<[^>]*$/g, '');

  // Remove any remaining self-standing or broken tags (e.g. "</command-m", "<tag>")
  cleaned = cleaned.replace(/<\/?[\w-]*>?/g, '');

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

  // Parse command content to get structured parts and body
  const { command, body } = parseCommandContent(text);

  // Determine the best title source: args > body > command name
  let titleSource = '';

  if (command && command.args && command.args.trim()) {
    // Prefer command args (user's actual input) as title
    titleSource = command.args.trim();
  } else {
    const trimmedBody = body.trim();
    if (trimmedBody) {
      titleSource = trimmedBody;
    } else if (command?.name || command?.message) {
      // Fallback to command name when no args or body
      titleSource = (command.name || command.message).replace(/^\//, '');
    }
  }

  if (!titleSource) {
    return 'Conversation ' + new Date().toISOString().slice(0, 10);
  }

  const stripped = stripMarkdown(titleSource);
  const normalized = stripped.replace(/\s+/g, ' ').trim();

  // Apply cleanTitle to remove any remaining tags
  const cleaned = cleanTitle(normalized);

  let title = cleaned.slice(0, 50);
  title = title.replace(/[,.:;!?\s]+$/, '');
  if (!title) {
    // If cleaned title is empty, fall back to command name
    const cmdName = command?.name || command?.message;
    if (cmdName) {
      return cmdName.replace(/^\//, '');
    }
    return 'Conversation ' + new Date().toISOString().slice(0, 10);
  }
  return title;
}
