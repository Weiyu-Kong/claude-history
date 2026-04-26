import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Configure marked for GitHub-flavored markdown
marked.setOptions({
  breaks: true,
  gfm: true
});

/**
 * Render markdown text to sanitized HTML
 * @param {string} text - Markdown text
 * @returns {string} Sanitized HTML string
 */
export function renderMarkdown(text) {
  if (!text) return '';
  try {
    const html = marked.parse(text);
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'br', 'hr',
        'ul', 'ol', 'li', 'blockquote', 'pre', 'code', 'strong', 'em', 'del',
        'a', 'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div'],
      ALLOWED_ATTR: ['href', 'class', 'title']
    });
  } catch (e) {
    console.error('[markdown] Render error:', e);
    return text;
  }
}

/**
 * Check if content looks like command metadata (contains <command-*>, <HARD-GATE> tags)
 * @param {string} text - Text content
 * @returns {boolean}
 */
export function isCommandContent(text) {
  if (!text || typeof text !== 'string') return false;
  return /<(command-(message|name|args)|HARD-GATE|SUBAGENT-STOP|EXTREMELY-IMPORTANT)>/i.test(text);
}

/**
 * Extract command metadata from content and return structured parts
 * @param {string} text - Raw text content
 * @returns {{ command: object|null, body: string }}
 */
export function parseCommandContent(text) {
  if (!text || typeof text !== 'string') return { command: null, body: text };

  const command = {};

  // Extract <command-message>
  const msgMatch = text.match(/<command-message>([\s\S]*?)<\/command-message>/i);
  if (msgMatch) command.message = msgMatch[1].trim();

  // Extract <command-name>
  const nameMatch = text.match(/<command-name>([\s\S]*?)<\/command-name>/i);
  if (nameMatch) command.name = nameMatch[1].trim();

  // Extract <command-args>
  const argsMatch = text.match(/<command-args>([\s\S]*?)<\/command-args>/i);
  if (argsMatch) command.args = argsMatch[1].trim();

  // Check if this is command content
  if (command.message || command.name) {
    // Remove all command tags from body
    const body = text
      .replace(/<command-message>[\s\S]*?<\/command-message>/gi, '')
      .replace(/<command-name>[\s\S]*?<\/command-name>/gi, '')
      .replace(/<command-args>[\s\S]*?<\/command-args>/gi, '')
      .replace(/<(?:HARD-GATE|SUBAGENT-STOP|EXTREMELY-IMPORTANT)>[\s\S]*?<\/(?:HARD-GATE|SUBAGENT-STOP|EXTREMELY-IMPORTANT)>/gi, '')
      .replace(/<[^>]+>[\s\S]*?<\/[^>]+>/gi, '') // Remove other XML tags
      .trim();

    return { command, body };
  }

  return { command: null, body: text };
}
