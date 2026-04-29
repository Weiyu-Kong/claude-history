<template>
  <div v-if="hasVisibleContent" :class="['chat-bubble', role]">
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
        <div v-if="block.type === 'text'" class="text-block">
          <div v-if="block.command" class="command-wrapper">
            <CommandBlock
              :command="block.command"
              :body="block.body"
            />
            <div v-if="block.body && block.body.trim()" v-html="block.renderedHtml" class="markdown-content command-body"></div>
          </div>
          <div v-else class="text-content">
            <div v-html="block.renderedHtml" class="markdown-content"></div>
          </div>
        </div>
        <div v-else-if="block.type === 'image'" class="image-block">
          <img v-if="block.imageUrl" :src="block.imageUrl" class="attached-image" />
          <span v-else class="image-placeholder">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            图片
          </span>
        </div>
        <TaskCreateBlock v-if="block.type === 'tool_use' && block.name === 'TaskCreate'" :block="block" />
        <AgentToolBlock v-else-if="block.type === 'tool_use' && (block.name === 'Agent' || block.toolName === 'Agent')" :block="block" :ref="el => setChildRef('agent_' + i, el)" />
        <TodoWriteBlock v-else-if="block.type === 'tool_use' && (block.name === 'TodoWrite' || block.toolName === 'TodoWrite')" :block="block" />
        <WriteToolBlock v-else-if="block.type === 'tool_use' && block.name === 'Write'" :block="block" />
        <EditToolBlock v-else-if="block.type === 'tool_use' && block.name === 'Edit'" :block="block" />
        <ReadToolBlock v-else-if="block.type === 'tool_use' && block.name === 'Read'" :block="block" />
        <ToolCall v-else-if="block.type === 'tool_use'" :block="block" :ref="el => setChildRef('tool_' + i, el)" />
        <ToolResult v-else-if="block.type === 'tool_result'" :block="block" :ref="el => setChildRef('result_' + i, el)" />
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
import AgentToolBlock from './AgentToolBlock.vue';
import TodoWriteBlock from './TodoWriteBlock.vue';

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
      return null;
    }
    if (block.type === 'tool_use' && block.toolName) {
      return { ...block, name: block.toolName };
    }
    if (block.type === 'image') {
      const source = block.source || {};
      return {
        ...block,
        imageUrl: source.url || (source.data ? `data:${source.media_type || 'image/png'};base64,${source.data}` : null)
      };
    }
    return block;
  }).filter(Boolean);
});

const hasVisibleContent = computed(() => normalizedBlocks.value.length > 0);

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

function collapseAll() {
  Object.values(childRefs.value).forEach(child => {
    if (child && child.collapseAll) {
      child.collapseAll();
    }
  });
}

defineExpose({ expandAll, collapseAll });
</script>

<style scoped>
.chat-bubble {
  display: flex;
  flex-direction: column;
  max-width: 80%;
  margin-bottom: 12px;
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
  margin-bottom: 6px;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.chat-bubble.user .avatar {
  background: var(--bubble-user-bg);
  color: var(--bubble-user-text);
}

.chat-bubble.assistant .avatar {
  background: var(--primary);
  color: white;
}

.role-label {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.bubble-content {
  padding: 12px 16px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.chat-bubble.user .bubble-content {
  background: var(--bubble-user-bg);
  color: var(--bubble-user-text);
  border-radius: var(--radius-lg) var(--radius-sm) var(--radius-lg) var(--radius-lg);
}

.chat-bubble.assistant .bubble-content {
  background: var(--bubble-claude-bg);
  color: var(--bubble-claude-text);
  border-radius: var(--radius-sm) var(--radius-lg) var(--radius-lg) var(--radius-lg);
}

.text-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
}

.command-wrapper {
  margin-bottom: 8px;
}

.command-body {
  margin-top: 10px;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--primary);
}

.markdown-content {
  overflow-x: auto;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
  margin: 0.8em 0 0.4em;
}

.markdown-content :deep(p) {
  margin: 0.5em 0;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

.markdown-content :deep(code) {
  background-color: rgba(0, 0, 0, 0.08);
  padding: 0.15em 0.4em;
  border-radius: 3px;
  font-family: var(--font-mono);
  font-size: 0.9em;
}

.chat-bubble.user .markdown-content :deep(code) {
  background-color: rgba(255, 255, 255, 0.2);
}

.markdown-content :deep(pre) {
  background-color: rgba(0, 0, 0, 0.06);
  padding: 12px;
  border-radius: var(--radius-sm);
  overflow-x: auto;
  margin: 0.8em 0;
}

.chat-bubble.user .markdown-content :deep(pre) {
  background-color: rgba(255, 255, 255, 0.1);
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

.image-block {
  margin-top: 8px;
}

.attached-image {
  max-width: 100%;
  max-height: 400px;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.image-placeholder {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  background: var(--bg-tertiary);
  padding: 6px 12px;
  border-radius: var(--radius-sm);
}
</style>
