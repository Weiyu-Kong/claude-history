<template>
  <div :class="['chat-bubble', role]">
    <div class="bubble-header">
      <span class="avatar">
        <svg v-if="role === 'user'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
        <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
          <path d="M2 17l10 5 10-5"></path>
          <path d="M2 12l10 5 10-5"></path>
        </svg>
      </span>
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

        <!-- Tool blocks with special formatting -->
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

const childRefs = ref({});

const normalizedBlocks = computed(() => {
  return props.blocks.map((block, index) => {
    if (block.type === 'text') {
      const text = block.text || block.content || '';
      if (typeof text === 'string' && text.trim()) {
        const { command, body } = parseCommandContent(text);
        return {
          ...block,
          command,
          body,
          renderedHtml: renderMarkdown(body)
        };
      }
    }
    if (block.type === 'tool_use' && block.toolName) {
      return { ...block, name: block.toolName };
    }
    return block;
  });
});

const roleLabel = computed(() => {
  return props.role === 'user' ? '用户' : 'Claude';
});

function setChildRef(index, el) {
  if (el) {
    childRefs.value[index] = el;
  }
}

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
  max-width: 65%;
  margin-bottom: 20px;
  animation: slideUp 0.4s ease-out;
  animation-fill-mode: both;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.chat-bubble.user {
  align-self: flex-end;
  animation-delay: 0.05s;
}

.chat-bubble.assistant {
  align-self: flex-start;
  animation-delay: 0.05s;
}

.bubble-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: 600;
  transition: transform var(--transition-fast);
}

.chat-bubble:hover .avatar {
  transform: scale(1.05);
}

.chat-bubble.user .avatar {
  background: linear-gradient(135deg, var(--bubble-user-bg), #4F46E5);
  color: var(--bubble-user-text);
  box-shadow: var(--shadow-sm);
}

.chat-bubble.assistant .avatar {
  background: linear-gradient(135deg, #F59E0B, #D97706);
  color: white;
  box-shadow: var(--shadow-sm);
}

.role-label {
  font-family: var(--font-display);
  font-size: var(--font-size-sm);
  font-weight: 500;
  font-style: italic;
  color: var(--text-secondary);
  letter-spacing: 0.02em;
}

.bubble-content {
  padding: 16px 20px;
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-bubble);
  position: relative;
  transition: box-shadow var(--transition-fast), transform var(--transition-fast);
}

.chat-bubble:hover .bubble-content {
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
}

.chat-bubble.user .bubble-content {
  background: linear-gradient(135deg, var(--bubble-user-bg) 0%, #4338CA 100%);
  color: var(--bubble-user-text);
  border-bottom-right-radius: var(--radius-sm);
}

.chat-bubble.assistant .bubble-content {
  background: var(--bubble-claude-bg);
  color: var(--bubble-claude-text);
  border-bottom-left-radius: var(--radius-sm);
}

/* Decorative corner */
.bubble-content::before {
  content: '';
  position: absolute;
  width: 12px;
  height: 12px;
  border-radius: 2px;
  opacity: 0.3;
}

.chat-bubble.user .bubble-content::before {
  bottom: -1px;
  right: -1px;
  background: var(--bubble-user-bg);
  border-top-left-radius: 8px;
}

.chat-bubble.assistant .bubble-content::before {
  bottom: -1px;
  left: -1px;
  background: #D97706;
  border-top-right-radius: 8px;
}

.text-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: var(--leading-relaxed);
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
  border-left: 3px solid var(--primary);
}

@media (prefers-color-scheme: dark) {
  .command-body {
    background-color: rgba(255, 255, 255, 0.05);
  }
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
  font-family: var(--font-display);
  line-height: var(--leading-tight);
}

.markdown-content :deep(h1) { font-size: 1.4em; }
.markdown-content :deep(h2) { font-size: 1.2em; }
.markdown-content :deep(h3) { font-size: 1.1em; }

.markdown-content :deep(p) {
  margin: 0.6em 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 0.6em 0;
  padding-left: 1.5em;
}

.markdown-content :deep(li) {
  margin: 0.3em 0;
}

.markdown-content :deep(code) {
  background-color: rgba(0, 0, 0, 0.08);
  padding: 0.2em 0.5em;
  border-radius: 4px;
  font-family: var(--font-mono);
  font-size: 0.88em;
}

.chat-bubble.user .markdown-content :deep(code) {
  background-color: rgba(255, 255, 255, 0.15);
}

.markdown-content :deep(pre) {
  background-color: rgba(0, 0, 0, 0.06);
  padding: 14px;
  border-radius: var(--radius-md);
  overflow-x: auto;
  margin: 0.8em 0;
  border-left: 3px solid var(--primary);
  position: relative;
}

.chat-bubble.user .markdown-content :deep(pre) {
  background-color: rgba(255, 255, 255, 0.1);
}

.markdown-content :deep(pre code) {
  background: none;
  padding: 0;
  font-size: 0.85em;
  line-height: 1.6;
}

.markdown-content :deep(blockquote) {
  border-left: 3px solid currentColor;
  margin: 0.6em 0;
  padding-left: 1em;
  opacity: 0.85;
  font-style: italic;
}

.markdown-content :deep(a) {
  color: inherit;
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-thickness: 1px;
}

.chat-bubble.user .markdown-content :deep(a) {
  color: #E0E7FF;
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
  margin: 1.2em 0;
  opacity: 0.25;
}

.markdown-content :deep(table) {
  border-collapse: collapse;
  margin: 0.8em 0;
  width: 100%;
  font-size: 0.9em;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
  border: 1px solid currentColor;
  padding: 0.4em 0.6em;
  opacity: 0.8;
}

.markdown-content :deep(th) {
  font-weight: 600;
  background-color: rgba(0, 0, 0, 0.05);
}

.chat-bubble.user .markdown-content :deep(th) {
  background-color: rgba(255, 255, 255, 0.1);
}
</style>
