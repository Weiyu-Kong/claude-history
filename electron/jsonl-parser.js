const fs = require('fs');
const readline = require('readline');

/**
 * Stream-parse a JSONL file, calling onObject for each valid JSON object found.
 * @param {string} filePath - Path to the .jsonl file
 * @param {function} onObject - Callback function(obj) called for each parsed object
 * @returns {Promise<void>} Resolves when all lines have been processed
 */
function parseStream(filePath, onObject) {
  return new Promise((resolve, reject) => {
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath, { encoding: 'utf8', highWaterMark: 64 * 1024 }),
      crlfDelay: Infinity
    });

    rl.on('line', (line) => {
      if (!line.trim()) return;
      try {
        const obj = JSON.parse(line);
        onObject(obj);
      } catch (e) {
        console.warn(`[jsonl-parser] Skipped malformed line: ${e.message}`);
      }
    });

    rl.on('close', resolve);
    rl.on('error', reject);
  });
}

module.exports = { parseStream };
