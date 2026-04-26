<template>
  <div class="message-thread">
    <div v-if="loading" class="thread-loading">
      <SkeletonLoader :count="4" height="100px" />
    </div>

    <div v-else-if="!conversation" class="thread-empty">
      <p>选择一个对话查看历史记录</p>
    </div>

    <div v-else class="thread-container">
      <div class="thread-header">
        <div class="thread-title-row">
          <h2>{{ cleanTitle(conversation.title) || '未命名对话' }}</h2>
          <span class="message-count">{{ messageCount }} 条消息</span>
        </div>
        <button class="expand-btn" @click="expandAll" :disabled="allExpanded">
          {{ allExpanded ? '已展开' : '展开全部' }}
        </button>
      </div>

      <div class="thread-messages" ref="messagesContainer">
        <div class="messages-inner">
          <template v-for="(message, index) in messages" :key="index">
            <ChatBubble
              v-if="message.role === 'user' || message.role === 'assistant' || message.type === 'tool_result'"
              :blocks="message.blocks || [message]"
              :role="message.role === 'tool_result' ? 'assistant' : message.role"
            />
            <PermissionBadge
              v-else-if="message.type === 'permission-mode'"
              :mode="message.permissionMode"
              :granted="message.granted"
            />
            <FileSnapshot
              v-else-if="message.type === 'file-history-snapshot'"
              :blocks="message"
            />
            <ChatBubble
              v-else-if="message.type === 'last-prompt'"
              :blocks="normalizeContent(message.message?.content)"
              role="user"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { cleanTitle } from '../utils/title-extractor.js';
import SkeletonLoader from './SkeletonLoader.vue';
import ChatBubble from './ChatBubble.vue';
import PermissionBadge from './PermissionBadge.vue';
import FileSnapshot from './FileSnapshot.vue';

const props = defineProps({
  conversation: Object,
  loading: Boolean,
  skippedCount: {
    type: Number,
    default: 0
  }
});

const messagesContainer = ref(null);
const allExpanded = ref(false);

const messages = computed(() => {
  if (!props.conversation || !props.conversation.messages) {
    return [];
  }
  return props.conversation.messages;
});

const messageCount = computed(() => {
  return messages.value.filter(m =>
    m.role === 'user' || m.role === 'assistant' || m.type === 'tool_result'
  ).length;
});

function expandAll() {
  allExpanded.value = true;
}

function normalizeContent(content) {
  if (typeof content === 'string') return [{ type: 'text', text: content }];
  if (Array.isArray(content)) return content;
  return [];
}
</script>

<style scoped>
.message-thread {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary);
}

.thread-loading {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
}

.thread-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.thread-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.thread-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-secondary);
}

.thread-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  overflow: hidden;
}

.thread-title-row h2 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.message-count {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  background: var(--bg-tertiary);
  padding: 4px 8px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.expand-btn {
  padding: 6px 12px;
  font-size: var(--font-size-xs);
  color: var(--primary);
  background: transparent;
  border: 1px solid var(--primary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  flex-shrink: 0;
}

.expand-btn:hover:not(:disabled) {
  background: var(--primary);
  color: white;
}

.expand-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.thread-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.messages-inner {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}
</style>
