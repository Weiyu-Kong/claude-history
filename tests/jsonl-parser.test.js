const fs = require('fs');
const path = require('path');
const { parseStream } = require('../electron/jsonl-parser');

describe('jsonl-parser', () => {
  const testFilePath = path.join(__dirname, 'test-data.jsonl');

  beforeAll(() => {
    // Create test JSONL file
    const validLines = [
      JSON.stringify({ id: 1, name: 'Alice' }),
      JSON.stringify({ id: 2, name: 'Bob' }),
      JSON.stringify({ id: 3, name: 'Charlie' }),
    ].join('\n');
    const linesWithMalformed = [
      JSON.stringify({ id: 4, name: 'Dave' }),
      'this is not valid json',
      JSON.stringify({ id: 5, name: 'Eve' }),
      '',
      '  \n  ',
      JSON.stringify({ id: 6, name: 'Frank' }),
    ].join('\n');
    fs.writeFileSync(testFilePath, validLines + '\n' + linesWithMalformed);
  });

  afterAll(() => {
    fs.unlinkSync(testFilePath);
  });

  test('parses valid JSONL lines', (done) => {
    const results = [];
    parseStream(testFilePath, (obj) => {
      results.push(obj);
    });

    // Wait for stream to finish
    setTimeout(() => {
      expect(results.length).toBeGreaterThanOrEqual(6);
      expect(results.find((r) => r.id === 1 && r.name === 'Alice')).toBeTruthy();
      expect(results.find((r) => r.id === 2 && r.name === 'Bob')).toBeTruthy();
      expect(results.find((r) => r.id === 3 && r.name === 'Charlie')).toBeTruthy();
      done();
    }, 100);
  });

  test('skips malformed lines', (done) => {
    const results = [];
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    parseStream(testFilePath, (obj) => {
      results.push(obj);
    });

    setTimeout(() => {
      // Should not include malformed line
      expect(results.find((r) => r === undefined || typeof r !== 'object')).toBeUndefined();
      // Should have called warn for malformed line
      expect(warnSpy).toHaveBeenCalled();
      expect(warnSpy.mock.calls[0][0]).toContain('Skipped malformed line');
      warnSpy.mockRestore();
      done();
    }, 100);
  });

  test('skips empty lines', (done) => {
    const results = [];
    parseStream(testFilePath, (obj) => {
      results.push(obj);
    });

    setTimeout(() => {
      // Empty lines should not produce results
      expect(results.every((r) => r !== null && r !== undefined)).toBe(true);
      done();
    }, 100);
  });
});
