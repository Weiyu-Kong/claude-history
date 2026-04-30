'use strict';

const fs = require('fs');
const readline = require('readline');

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

function cleanTitle(title) {
  if (!title) return '';
  let cleaned = title;

  // Remove local-command-caveat tags
  cleaned = cleaned.replace(/<local-command-caveat>[\s\S]*?(<\/local-command-caveat>)?/gi, '');

  // Remove command XML tags and their content
  cleaned = cleaned.replace(/<command[-\w]*>[\s\S]*?<\/command[-\w]*>/gi, '');

  // Remove any remaining XML-like tags with content
  cleaned = cleaned.replace(/<[\w-]+>[\s\S]*?<\/[\w-]+>/gi, '');

  // Remove incomplete/truncated XML tags at end of string
  cleaned = cleaned.replace(/<[^>]*$/g, '');

  // Remove any remaining self-standing or broken tags
  cleaned = cleaned.replace(/<\/?[\w-]*>?/g, '');

  // Strip markdown
  cleaned = stripMarkdown(cleaned);

  // Normalize whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned || '';
}

/**
 * Parse command content from text with XML tags
 * Extracts command name, args, message and returns cleaned body
 */
function parseCommandContent(text) {
  if (!text || typeof text !== 'string') return { command: null, body: text };

  const command = {};

  const msgMatch = text.match(/<command-message>([\s\S]*?)<\/command-message>/i);
  if (msgMatch) command.message = msgMatch[1].trim();

  const nameMatch = text.match(/<command-name>([\s\S]*?)<\/command-name>/i);
  if (nameMatch) command.name = nameMatch[1].trim();

  const argsMatch = text.match(/<command-args>([\s\S]*?)<\/command-args>/i);
  if (argsMatch) command.args = argsMatch[1].trim();

  if (command.message || command.name) {
    const body = text
      .replace(/<command-message>[\s\S]*?<\/command-message>/gi, '')
      .replace(/<command-name>[\s\S]*?<\/command-name>/gi, '')
      .replace(/<command-args>[\s\S]*?<\/command-args>/gi, '')
      .replace(/<(?:HARD-GATE|SUBAGENT-STOP|EXTREMELY-IMPORTANT)>[\s\S]*?<\/(?:HARD-GATE|SUBAGENT-STOP|EXTREMELY-IMPORTANT)>/gi, '')
      .replace(/<[^>]+>[\s\S]*?<\/[^>]+>/gi, '')
      .trim();

    return { command, body };
  }

  return { command: null, body: text };
}

/**
 * Extract a title from text (first user message content)
 * Priority: command.args > body > command.name
 */
function extractTitle(text) {
  if (!text) return 'Conversation ' + new Date().toISOString().slice(0, 10);

  const { command, body } = parseCommandContent(text);

  let titleSource = '';
  if (command && command.args && command.args.trim()) {
    titleSource = command.args.trim();
  } else {
    const trimmedBody = body.trim();
    if (trimmedBody) {
      titleSource = trimmedBody;
    } else if (command?.name || command?.message) {
      titleSource = (command.name || command.message).replace(/^\//, '');
    }
  }

  if (!titleSource) {
    return 'Conversation ' + new Date().toISOString().slice(0, 10);
  }

  const stripped = stripMarkdown(titleSource);
  const normalized = stripped.replace(/\s+/g, ' ').trim();
  const cleaned = cleanTitle(normalized);

  let title = cleaned.slice(0, 50);
  title = title.replace(/[,.:;!?\s]+$/, '');
  if (!title) {
    const cmdName = command?.name || command?.message;
    if (cmdName) return cmdName.replace(/^\//, '');
    return 'Conversation ' + new Date().toISOString().slice(0, 10);
  }
  return title;
}

/**
 * Extract title from a JSONL conversation file.
 * Reads only until the first user message with text content is found.
 * @param {string} filePath - Path to the .jsonl file
 * @returns {Promise<string>} Extracted title
 */
function extractTitleFromJsonl(filePath) {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath, { encoding: 'utf8', highWaterMark: 64 * 1024 }),
      crlfDelay: Infinity
    });

    let found = false;

    rl.on('line', (line) => {
      if (found || !line.trim()) return;
      try {
        const obj = JSON.parse(line);
        if (obj.type === 'user' && obj.message?.content) {
          const content = obj.message.content;
          let text = '';

          if (typeof content === 'string') {
            text = content;
          } else if (Array.isArray(content)) {
            const textBlock = content.find(b => b.type === 'text' && b.text);
            if (textBlock) text = textBlock.text;
          }

          if (text.trim()) {
            found = true;
            rl.close();
            resolve(extractTitle(text));
          }
        }
      } catch (e) {
        // Skip malformed lines
      }
    });

    rl.on('close', () => {
      if (!found) resolve('Conversation ' + new Date().toISOString().slice(0, 10));
    });
    rl.on('error', reject);
  });
}

module.exports = { extractTitle, cleanTitle, extractTitleFromJsonl };
