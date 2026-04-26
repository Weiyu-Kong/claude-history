<template>
  <div :class="['chat-bubble', role]">
    <div class="bubble-header">
      <span class="avatar">{{ role === 'user' ? 'U' : 'C' }}</span>
      <span class="role-label">{{ roleLabel }}</span>
    </div>
    <div class="bubble-content">
      <template v-for="(block, i) in normalizedBlocks" :key="i">
        <!-- Text blocks - handle command and regular content -->
        <div v-if="block.type === 'text'" class="text-block">
          <!-- Command block if has command content -->
          <div v-if="block.command" class="command-wrapper">
            <CommandBlock
              :command="block.command"
              :body="block.body"
            />
            <!-- Additional body content after command -->
            <div v-if="block.body && block.body.trim()" v-html="block.renderedHtml" class="markdown-content command-body"></div>
          </div>
          <!-- Regular text/markdown without command -->
          <div v-else class="text-content">
            <div v-html="block.renderedHtml" class="markdown-content"></div>
          </div>
        </div>

        <!-- Tool blocks with special formatting (checked before generic ToolCall) -->
        <TaskCreateBlock v-if="block.type === 'tool_use' && block.name === 'TaskCreate'" :block="block" />
        <WriteToolBlock v-else-if="block.type === 'tool_use' && block.name === 'Write'" :block="block" />
        <EditToolBlock v-else-if="block.type === 'tool_use' && block.name === 'Edit'" :block="block" />
        <ReadToolBlock v-else-if="block.type === 'tool_use' && block.name === 'Read'" :block="block" />

        <!-- Generic tool call blocks -->
        <ToolCall v-else-if="block.type === 'tool_use'" :block="block" :ref="el => setChildRef('tool_' + i, el)" />

        <!-- Tool result blocks -->
        <ToolResult v-else-if="block.type === 'tool_result'" :block="block" :ref="el => setChildRef('result_' + i, el)" />

        <!-- Thinking blocks -->
        <ThinkingBlock v-else-if="block.type === 'thinking'" :block="block" :ref="el => setChildRef('thinking_' + i, el)" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, defineExpose } from 'vue';
import { renderMarkdown, parseCommandContent } from '../utils/markdown.js';
import ToolCall from './ToolCall.vue';
import ToolResult from './ToolResult.vue';
import ThinkingBlock from './ThinkingBlock.vue';
import TaskCreateBlock from './TaskCreateBlock.vue';
import CommandBlock from './CommandBlock.vue';
import WriteToolBlock from './WriteToolBlock.vue';
import EditToolBlock from './EditToolBlock.vue';
import ReadToolBlock from './ReadToolBlock.vue';

const props = defineProps({
  blocks: {
    type: Array,
    required: true
  },
  role: {
    type: String,
    required: true,
    validator: (value) => ['user', 'assistant'].includes(value)
  }
});

// Refs for child components
const childRefs = ref({});

// Normalize blocks and process text content
const normalizedBlocks = computed(() => {
  return props.blocks.map((block, index) => {
    // Handle text blocks - check both 'text' and 'content' fields
    if (block.type === 'text') {
      const text = block.text || block.content || '';
      if (typeof text === 'string' && text.trim()) {
        // Parse command content and extract metadata
        const { command, body } = parseCommandContent(text);

        return {
          ...block,
          command,
          body,
          renderedHtml: renderMarkdown(body)
        };
      }
    }

    // For tool_use blocks, also store the name for easier template access
    if (block.type === 'tool_use' && block.toolName) {
      return { ...block, name: block.toolName };
    }

    return block;
  });
});

// Role label based on role
const roleLabel = computed(() => {
  return props.role === 'user' ? '用户' : 'Claude';
});

// Set ref for child components
function setChildRef(index, el) {
  if (el) {
    childRefs.value[index] = el;
  }
}

// Expand all collapsible blocks
function expandAll() {
  Object.values(childRefs.value).forEach(child => {
    if (child && child.expandAll) {
      child.expandAll();
    }
  });
}

defineExpose({ expandAll });
</script>

<style scoped>
.chat-bubble {
  display: flex;
  flex-direction: column;
  max-width: 50%;
  margin-bottom: 16px;
}

.chat-bubble.user {
  align-self: flex-end;
}

.chat-bubble.assistant {
  align-self: flex-start;
}

.bubble-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.chat-bubble.user .avatar {
  background-color: var(--bubble-user-bg);
  color: var(--bubble-user-text);
}

.chat-bubble.assistant .avatar {
  background-color: var(--bubble-claude-bg);
  color: var(--bubble-claude-text);
}

.role-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-secondary);
}

.bubble-content {
  padding: 12px 16px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.chat-bubble.user .bubble-content {
  background-color: var(--bubble-user-bg);
  color: var(--bubble-user-text);
}

.chat-bubble.assistant .bubble-content {
  background-color: var(--bubble-claude-bg);
  color: var(--bubble-claude-text);
}

.text-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
}

/* Command wrapper styling */
.command-wrapper {
  margin-bottom: 8px;
}

.command-body {
  margin-top: 12px;
  padding: 12px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-md);
}

/* Command info styling */
.command-info {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.command-badge {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-family: var(--font-mono);
}

.command-name,
.command-message {
  font-weight: 500;
}

.toggle-btn {
  background: transparent;
  border: 1px solid currentColor;
  color: inherit;
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  cursor: pointer;
  opacity: 0.7;
}

.toggle-btn:hover {
  opacity: 1;
}

/* Markdown content styling */
.markdown-content {
  overflow-x: auto;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3),
.markdown-content :deep(h4),
.markdown-content :deep(h5),
.markdown-content :deep(h6) {
  margin-top: 1em;
  margin-bottom: 0.5em;
  font-weight: 600;
}

.markdown-content :deep(h1) { font-size: 1.5em; }
.markdown-content :deep(h2) { font-size: 1.25em; }
.markdown-content :deep(h3) { font-size: 1.1em; }

.markdown-content :deep(p) {
  margin: 0.5em 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.markdown-content :deep(li) {
  margin: 0.25em 0;
}

.markdown-content :deep(code) {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 0.2em 0.4em;
  border-radius: 3px;
  font-family: var(--font-mono);
  font-size: 0.9em;
}

.markdown-content :deep(pre) {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 1em;
  border-radius: var(--radius-sm);
  overflow-x: auto;
  margin: 0.5em 0;
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
}

.markdown-content :deep(blockquote) {
  border-left: 3px solid currentColor;
  margin: 0.5em 0;
  padding-left: 1em;
  opacity: 0.8;
}

.markdown-content :deep(a) {
  color: inherit;
  text-decoration: underline;
}

.markdown-content :deep(strong) {
  font-weight: 600;
}

.markdown-content :deep(em) {
  font-style: italic;
}

.markdown-content :deep(hr) {
  border: none;
  border-top: 1px solid currentColor;
  margin: 1em 0;
  opacity: 0.3;
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  margin: 0.5em 0;
  width: 100%;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid currentColor;
  padding: 0.25em 0.5em;
}
</style>
