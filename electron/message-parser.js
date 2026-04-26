/**
 * Normalize message content to array format.
 * - If content is a string, wrap as {type: 'text', text: content}
 * - If content is already an array, return as-is
 * - Otherwise, return empty array
 * @param {string|Array} content - Raw content from message
 * @returns {Array} Array of content blocks
 */
function normalizeContent(content) {
  if (typeof content === 'string') {
    return [{ type: 'text', text: content }];
  }
  if (Array.isArray(content)) {
    return content;
  }
  return [];
}

/**
 * Parse and normalize a raw message object from JSONL.
 * @param {Object} raw - Raw message object from JSONL
 * @returns {Object} Normalized message with enriched blocks
 */
function parseMessage(raw) {
  const blocks = normalizeContent(raw.content || []);

  // Enrich tool_use blocks
  const enrichedBlocks = blocks.map((block) => {
    if (block.type === 'tool_use') {
      const enriched = { ...block };
      if (block.name) {
        enriched.toolName = block.name;
      }
      if (block.input) {
        if (typeof block.input === 'string') {
          enriched.inputLines = block.input.split('\n').length;
        } else {
          // Count newlines in string values within the object
          let count = 0;
          const countNewlines = (obj) => {
            for (const key in obj) {
              if (typeof obj[key] === 'string') {
                count += (obj[key].match(/\n/g) || []).length;
              } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                countNewlines(obj[key]);
              }
            }
          };
          countNewlines(block.input);
          enriched.inputLines = count > 0 ? count + 1 : 1;
        }
      }
      return enriched;
    }

    if (block.type === 'tool_result') {
      const enriched = { ...block };
      enriched.isError = Boolean(block.is_error || block.isError);
      return enriched;
    }

    return block;
  });

  return {
    id: raw.id || null,
    role: raw.type || null,
    type: raw.type || null,
    blocks: enrichedBlocks,
    timestamp: raw.timestamp || null,
    sessionId: raw.session_id || null,
  };
}

module.exports = { normalizeContent, parseMessage };
