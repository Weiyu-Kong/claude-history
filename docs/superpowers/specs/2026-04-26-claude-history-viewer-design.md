# Claude History Viewer — Design Specification

## Overview

A desktop application for browsing and reading Claude Code conversation history. Provides a polished, human-readable view of local `.jsonl` conversation files with elegant message formatting.

## Data Source

- **Location**: All `.jsonl` files under `~/.claude/projects/`
- **Coverage**: 16 projects, ~140 conversation files across all projects
- **Format**: JSONL with message types: `user`, `assistant`, `attachment`, `permission-mode`, `file-history-snapshot`, `last-prompt`

### Message Structure

**User messages:**
```json
{
  "type": "user",
  "message": {
    "role": "user",
    "content": [  // can be array or raw string
      {"type": "text", "text": "..."},
      {"type": "tool_result", "content": "...", "is_error": true, "tool_use_id": "..."}
    ]
  },
  "uuid": "...",
  "timestamp": "ISO8601",
  "sessionId": "..."
}
```

**Assistant messages:**
```json
{
  "type": "assistant",
  "message": {
    "role": "assistant",
    "content": [
      {"type": "text", "text": "..."},
      {"type": "tool_use", "id": "...", "name": "Bash|Read|Write|Agent|...", "input": {...}},
      {"type": "thinking", "thinking": "..."}  // may be present
    ]
  }
}
```

## Layout

**Three-panel layout (Option A):**

```
┌──────────────┬─────────────────┬─────────────────────────────────┐
│  Projects    │  Conversations  │  Conversation Detail             │
│  (240px)     │  (280px)        │  (flex: 1)                      │
│              │                 │                                 │
│  - Project A │  - Title 1      │  ┌─────────────────────────┐   │
│  - Project B │  - Title 2      │  │ User bubble             │   │
│  - Project C │  - Title 3      │  └─────────────────────────┘   │
│              │                 │  ┌─────────────────────────┐   │
│              │                 │  │ Claude bubble           │   │
│              │                 │  │ [code blocks]          │   │
│              │                 │  └─────────────────────────┘   │
└──────────────┴─────────────────┴─────────────────────────────────┘
```

- **Left panel** (240px, resizable): Project list, collapsible
- **Middle panel** (280px, resizable): Conversation list for selected project
- **Right panel** (flex): Message thread view

## Visual Design

**System-adaptive theme (Option C):**
- Light mode: White/light gray background, blue primary accent (#0066cc)
- Dark mode: Dark gray/black background, soft text colors, follows system preference
- Implemented via CSS custom properties + `prefers-color-scheme` media query

## Message Formatting

**Chat bubble style (Option A):**
- User messages: Right-aligned, primary accent color background
- Claude messages: Left-aligned, distinct background with subtle border
- Rounded corners with directional tails
- Avatar/initials indicator
- Timestamp on each message (optional, collapsible)

**Content types:**
- `text`: Plain text, rendered as-is
- `tool_use`: Collapsed by default, expanded on click
  - Shows tool name and truncated input preview
  - Collapsed: `▼ Tool: Bash (14 lines)` indicator
  - Expanded: Full input with syntax highlighting
- `tool_result`: Collapsed by default in mixed mode
  - Error results highlighted in red
- `thinking`: Collapsible section, shown separately from main text

## Title Generation

**AI-generated titles (Option B):**
- First message in conversation used as context
- Prompt to generate 1-line descriptive title (< 50 chars)
- Title stored in local SQLite database after generation
- Fallback: "Conversation" + date if generation fails

## Data Loading Strategy

**Hybrid approach (Option 3):**
1. **Startup scan**: Background async scan of `~/.claude/projects/` for file metadata
   - Project name, file path, modification time, file size
   - Display loading progress indicator during first scan
2. **On-demand parsing**: Parse full `.jsonl` only when conversation selected
3. **LRU cache**: Cache recently viewed conversations (configurable size, default 20)
4. **SQLite index**: Store metadata and generated titles locally
   - Tables: `projects`, `conversations`, `titles`
   - Located in app data directory

## Key Features

1. **Project list**: Expandable/collapsible, shows project name
2. **Conversation list**: Sorted by date descending, shows AI-generated title + date
3. **Search**: Full-text search across conversations (searches title + first user message)
4. **Message thread view**: Scrollable, preserves conversation flow
5. **Expand/collapse**: Tool calls, tool results, thinking sections
6. **Copy**: One-click copy for code blocks
7. **Loading states**: Skeleton placeholders during loading

## Technical Stack

- **Framework**: Electron + Vue 3
- **Build**: electron-builder
- **Storage**: better-sqlite3
- **Styling**: CSS custom properties + scoped styles
- **Code highlighting**: highlight.js or Prism

## File Structure

High-level structure (detailed breakdown in implementation plan):

```
claude-history/
├── package.json
├── electron/              # Main process
├── src/                   # Vue app
├── preload.js
└── electron-builder.yml
```
