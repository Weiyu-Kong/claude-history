<template>
  <div class="message-thread">
    <div v-if="loading" class="thread-loading">
      <SkeletonLoader :count="4" height="80px" />
    </div>

    <div v-else-if="!conversation" class="thread-empty">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
      <p>选择一个对话查看历史记录</p>
    </div>

    <div v-else class="thread-container">
      <div class="thread-header">
        <div class="thread-title-row">
          <h2 class="thread-title">{{ cleanTitle(conversation.title) || '未命名对话' }}</h2>
          <span class="message-count">{{ messageCount }} 条消息</span>
        </div>
        <div class="header-actions">
          <span v-if="skippedCount > 0" class="skipped-indicator" title="部分消息已跳过">
            {{ skippedCount }} 条已跳过
          </span>
          <button class="action-btn" @click="expandAll" :disabled="allExpanded">
            {{ allExpanded ? '已全部展开' : '展开全部' }}
          </button>
        </div>
      </div>
      <div class="thread-messages" ref="messagesContainer" @scroll="handleScroll">
        <div class="messages-inner">
          <template v-for="(message, index) in messages" :key="index">
            <!-- Chat bubbles for user/assistant messages -->
            <ChatBubble
              v-if="message.role === 'user' || message.role === 'assistant' || message.type === 'tool_result'"
              :blocks="message.blocks || [message]"
              :role="message.role === 'tool_result' ? 'assistant' : message.role"
              :ref="el => setBubbleRef(index, el)"
            />

            <!-- Permission badge -->
            <PermissionBadge
              v-else-if="message.type === 'permission-mode'"
              :mode="message.permissionMode"
              :granted="message.granted"
            />

            <!-- File snapshot -->
            <div v-else-if="message.type === 'file-history-snapshot'" class="snapshot-wrapper">
              <FileSnapshot :blocks="message" />
            </div>

            <!-- Attachments -->
            <div v-else-if="message.type === 'attachment'" class="attachment-wrapper">
              <AttachmentList :blocks="message" />
            </div>

            <!-- Last prompt (user message) -->
            <ChatBubble
              v-else-if="message.type === 'last-prompt'"
              :blocks="normalizeContent(message.message?.content)"
              role="user"
              :ref="el => setBubbleRef(index, el)"
            />
          </template>
        </div>
      </div>

      <!-- Back to top button -->
      <transition name="fade">
        <button v-if="showBackToTop" class="back-to-top-btn" @click="scrollToTop" title="Back to top">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 15l-6-6-6 6"/>
          </svg>
        </button>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
import { cleanTitle } from '../utils/title-extractor.js';
import SkeletonLoader from './SkeletonLoader.vue';
import ChatBubble from './ChatBubble.vue';
import PermissionBadge from './PermissionBadge.vue';
import FileSnapshot from './FileSnapshot.vue';
import AttachmentList from './AttachmentList.vue';

const props = defineProps({
  conversation: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  skippedCount: {
    type: Number,
    default: 0
  }
});

const messagesContainer = ref(null);
const showBackToTop = ref(false);
const allExpanded = ref(false);
const bubbleRefs = ref({});

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

// Set ref for ChatBubble components to control expand state
function setBubbleRef(index, el) {
  if (el) {
    bubbleRefs.value[index] = el;
  }
}

// Expand all collapsible blocks
function expandAll() {
  // Trigger expansion on all ToolCall and ToolResult components
  Object.values(bubbleRefs.value).forEach(bubble => {
    if (bubble && bubble.expandAll) {
      bubble.expandAll();
    }
  });
  allExpanded.value = true;
}

// Handle scroll to show/hide back to top button
function handleScroll() {
  if (!messagesContainer.value) return;
  showBackToTop.value = messagesContainer.value.scrollTop > 300;
}

// Scroll to top
function scrollToTop() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}

// Normalize content to blocks format
function normalizeContent(content) {
  if (typeof content === 'string') return [{ type: 'text', text: content }];
  if (Array.isArray(content)) return content;
  return [];
}

// Auto-scroll to bottom when new messages arrive
watch(messages, async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
  // Reset expand state when conversation changes
  allExpanded.value = false;
}, { deep: true });
</script>

<style scoped>
.message-thread {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-primary);
  position: relative;
}

.thread-loading {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
}

.thread-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-muted);
  text-align: center;
  padding: 24px;
}

.empty-icon {
  margin-bottom: 16px;
  opacity: 0.5;
}

.thread-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  position: relative;
}

.thread-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  border-bottom: 1px solid var(--border-light);
  background-color: var(--bg-secondary);
  flex-shrink: 0;
}

.thread-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  overflow: hidden;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.thread-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.message-count {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  background-color: var(--bg-tertiary);
  padding: 4px 8px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.skipped-indicator {
  font-size: var(--font-size-xs);
  color: var(--color-warning);
  background-color: rgba(202, 138, 4, 0.1);
  padding: 4px 8px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.action-btn {
  padding: 6px 12px;
  font-size: var(--font-size-xs);
  color: var(--primary);
  background-color: transparent;
  border: 1px solid var(--primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.action-btn:hover:not(:disabled) {
  background-color: var(--primary);
  color: white;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.thread-messages {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
}

.messages-inner {
  margin: 0 auto;
  display: flex;
  flex-direction: column;
}

.snapshot-wrapper,
.attachment-wrapper {
  margin-bottom: 16px;
}

/* Back to top button */
.back-to-top-btn {
  position: absolute;
  bottom: 24px;
  right: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: all 0.15s ease;
  color: var(--text-primary);
}

.back-to-top-btn:hover {
  background-color: var(--primary);
  color: white;
  border-color: var(--primary);
}

/* Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
