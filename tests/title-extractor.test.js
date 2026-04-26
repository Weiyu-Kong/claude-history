'use strict';

const { extractTitle } = require('../electron/title-extractor');

describe('title-extractor', () => {
  describe('strips markdown formatting', () => {
    test('strips bold formatting', () => {
      expect(extractTitle('**Hello World**')).toBe('Hello World');
    });

    test('strips italic formatting', () => {
      expect(extractTitle('*Hello World*')).toBe('Hello World');
    });

    test('strips inline code', () => {
      expect(extractTitle('`const x = 1`')).toBe('const x = 1');
    });

    test('strips code blocks', () => {
      // Code blocks are removed entirely, returns fallback
      const input = '```js\nconsole.log("hello")\n```';
      const fallback = 'Conversation ' + new Date().toISOString().slice(0, 10);
      expect(extractTitle(input)).toBe(fallback);
    });

    test('strips links', () => {
      expect(extractTitle('[Click here](https://example.com)')).toBe('Click here');
    });

    test('strips headings', () => {
      expect(extractTitle('# Main Title')).toBe('Main Title');
      expect(extractTitle('## Section Title')).toBe('Section Title');
      expect(extractTitle('### Subsection')).toBe('Subsection');
    });

    test('strips list markers', () => {
      expect(extractTitle('- item one')).toBe('item one');
      expect(extractTitle('* item two')).toBe('item two');
      expect(extractTitle('1. first item')).toBe('first item');
    });
  });

  describe('truncates to 50 characters', () => {
    test('truncates long text', () => {
      const longText = 'This is a very long text that exceeds fifty characters and should be truncated';
      expect(extractTitle(longText).length).toBeLessThanOrEqual(50);
    });

    test('keeps text under 50 characters unchanged', () => {
      const shortText = 'Short title';
      expect(extractTitle(shortText)).toBe('Short title');
    });

    test('handles exactly 50 character text', () => {
      const exact50 = 'a'.repeat(50);
      expect(extractTitle(exact50)).toBe(exact50);
    });

    test('handles text slightly over 50 characters', () => {
      const over50 = 'a'.repeat(55);
      expect(extractTitle(over50).length).toBe(50);
    });
  });

  describe('trims trailing punctuation', () => {
    test('trims trailing commas', () => {
      expect(extractTitle('Hello,')).toBe('Hello');
      expect(extractTitle('Hello, World,')).toBe('Hello, World');
    });

    test('trims trailing periods', () => {
      expect(extractTitle('Hello.')).toBe('Hello');
      expect(extractTitle('Hello World.')).toBe('Hello World');
    });

    test('trims trailing colons', () => {
      expect(extractTitle('Hello:')).toBe('Hello');
    });

    test('trims trailing semicolons', () => {
      expect(extractTitle('Hello;')).toBe('Hello');
    });

    test('trims trailing exclamation marks', () => {
      expect(extractTitle('Hello!')).toBe('Hello');
    });

    test('trims trailing question marks', () => {
      expect(extractTitle('Hello?')).toBe('Hello');
    });

    test('trims trailing whitespace and punctuation', () => {
      expect(extractTitle('Hello .')).toBe('Hello');
      expect(extractTitle('Hello!  ')).toBe('Hello');
    });
  });

  describe('handles empty input', () => {
    test('returns fallback title with date for null', () => {
      const fallback = 'Conversation ' + new Date().toISOString().slice(0, 10);
      expect(extractTitle(null)).toBe(fallback);
    });

    test('returns fallback title with date for undefined', () => {
      const fallback = 'Conversation ' + new Date().toISOString().slice(0, 10);
      expect(extractTitle(undefined)).toBe(fallback);
    });

    test('returns fallback title with date for empty string', () => {
      const fallback = 'Conversation ' + new Date().toISOString().slice(0, 10);
      expect(extractTitle('')).toBe(fallback);
    });

    test('returns fallback title with date for whitespace only', () => {
      const fallback = 'Conversation ' + new Date().toISOString().slice(0, 10);
      expect(extractTitle('   ')).toBe(fallback);
    });

    test('returns fallback title with date for newline only', () => {
      const fallback = 'Conversation ' + new Date().toISOString().slice(0, 10);
      expect(extractTitle('\n\n')).toBe(fallback);
    });
  });

  describe('normalizes whitespace', () => {
    test('collapses multiple spaces', () => {
      expect(extractTitle('Hello    World')).toBe('Hello World');
    });

    test('collapses tabs to spaces', () => {
      expect(extractTitle('Hello\t\tWorld')).toBe('Hello World');
    });

    test('collapses newlines to spaces', () => {
      expect(extractTitle('Hello\n\nWorld')).toBe('Hello World');
    });
  });

  describe('real-world examples', () => {
    test('extracts title from user query', () => {
      // "How do I implement a binary search tree in Python?" is 53 chars
      // After truncate to 50: "How do I implement a binary search tree in Python"
      // After trim trailing "?": "How do I implement a binary search tree in Python"
      const input = 'How do I implement a binary search tree in Python?';
      expect(extractTitle(input)).toBe('How do I implement a binary search tree in Python');
    });

    test('extracts title from markdown document', () => {
      // Heading is stripped, but other text remains
      const input = '# Fix Bug\n\nDescribe the bug here';
      expect(extractTitle(input)).toBe('Fix Bug Describe the bug here');
    });

    test('handles code snippet in markdown', () => {
      // Code blocks are removed entirely, returns fallback
      const input = '```python\ndef hello():\n    print("world")\n```';
      const fallback = 'Conversation ' + new Date().toISOString().slice(0, 10);
      expect(extractTitle(input)).toBe(fallback);
    });

    test('handles list of tasks', () => {
      // Numbered list markers are stripped, content is joined
      const input = '1. First task\n2. Second task\n3. Third task';
      expect(extractTitle(input)).toBe('First task Second task Third task');
    });
  });
});
