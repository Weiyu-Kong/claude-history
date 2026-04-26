const fs = require('fs');
const readline = require('readline');

/**
 * Stream-parse a JSONL file, calling onObject for each valid JSON object found.
 * @param {string} filePath - Path to the .jsonl file
 * @param {function} onObject - Callback function(obj) called for each parsed object
 */
function parseStream(filePath, onObject) {
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
}

module.exports = { parseStream };
