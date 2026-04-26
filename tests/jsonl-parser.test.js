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

  test('parses valid JSONL lines', async () => {
    const results = [];
    await parseStream(testFilePath, (obj) => {
      results.push(obj);
    });

    expect(results.length).toBeGreaterThanOrEqual(6);
    expect(results.find((r) => r.id === 1 && r.name === 'Alice')).toBeTruthy();
    expect(results.find((r) => r.id === 2 && r.name === 'Bob')).toBeTruthy();
    expect(results.find((r) => r.id === 3 && r.name === 'Charlie')).toBeTruthy();
  });

  test('skips malformed lines', async () => {
    const results = [];
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

    await parseStream(testFilePath, (obj) => {
      results.push(obj);
    });

    // Should not include malformed line
    expect(results.find((r) => r === undefined || typeof r !== 'object')).toBeUndefined();
    // Should have called warn for malformed line
    expect(warnSpy).toHaveBeenCalled();
    expect(warnSpy.mock.calls[0][0]).toContain('Skipped malformed line');
    warnSpy.mockRestore();
  });

  test('skips empty lines', async () => {
    const results = [];
    await parseStream(testFilePath, (obj) => {
      results.push(obj);
    });

    // Empty lines should not produce results
    expect(results.every((r) => r !== null && r !== undefined)).toBe(true);
  });
});
