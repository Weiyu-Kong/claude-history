<template>
  <div class="message-thread">
    <div v-if="loading" class="thread-loading">
      <SkeletonLoader :count="4" height="100px" />
    </div>

    <div v-else-if="!conversation" class="thread-empty">
      <div class="empty-illustration">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none">
          <circle cx="60" cy="60" r="50" stroke="currentColor" stroke-width="2" stroke-dasharray="4 4" opacity="0.3"/>
          <path d="M40 50C40 44.477 44.477 40 50 40H70C75.523 40 80 44.477 80 50V65C80 70.523 75.523 75 70 75H55L45 85V75H50C44.477 75 40 70.523 40 65V50Z" stroke="currentColor" stroke-width="2" opacity="0.5"/>
          <circle cx="48" cy="57" r="3" fill="currentColor" opacity="0.4"/>
          <circle cx="60" cy="57" r="3" fill="currentColor" opacity="0.4"/>
          <circle cx="72" cy="57" r="3" fill="currentColor" opacity="0.4"/>
        </svg>
      </div>
      <p class="empty-text">选择一个对话查看历史记录</p>
      <p class="empty-hint">从左侧选择一个项目及其对话</p>
    </div>

    <div v-else class="thread-container">
      <div class="thread-header">
        <div class="thread-title-row">
          <div class="title-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <h2 class="thread-title">{{ cleanTitle(conversation.title) || '未命名对话' }}</h2>
        </div>
        <div class="header-meta">
          <span class="skipped-indicator" v-if="skippedCount > 0">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            {{ skippedCount }} 条已跳过
          </span>
          <div class="message-stat">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>{{ messageCount }} 条消息</span>
          </div>
        </div>
        <button class="expand-btn" @click="expandAll" :disabled="allExpanded">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
          {{ allExpanded ? '已全部展开' : '展开全部' }}
        </button>
      </div>
      <div class="thread-messages" ref="messagesContainer" @scroll="handleScroll">
        <div class="messages-inner">
          <template v-for="(message, index) in messages" :key="index">
            <ChatBubble
              v-if="message.role === 'user' || message.role === 'assistant' || message.type === 'tool_result'"
              :blocks="message.blocks || [message]"
              :role="message.role === 'tool_result' ? 'assistant' : message.role"
              :ref="el => setBubbleRef(index, el)"
            />

            <PermissionBadge
              v-else-if="message.type === 'permission-mode'"
              :mode="message.permissionMode"
              :granted="message.granted"
            />

            <div v-else-if="message.type === 'file-history-snapshot'" class="snapshot-wrapper">
              <FileSnapshot :blocks="message" />
            </div>

            <div v-else-if="message.type === 'attachment'" class="attachment-wrapper">
              <AttachmentList :blocks="message" />
            </div>

            <ChatBubble
              v-else-if="message.type === 'last-prompt'"
              :blocks="normalizeContent(message.message?.content)"
              role="user"
              :ref="el => setBubbleRef(index, el)"
            />
          </template>
        </div>
      </div>

      <transition name="fade">
        <button v-if="showBackToTop" class="back-to-top-btn" @click="scrollToTop" title="回到顶部">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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

function setBubbleRef(index, el) {
  if (el) {
    bubbleRefs.value[index] = el;
  }
}

function expandAll() {
  Object.values(bubbleRefs.value).forEach(bubble => {
    if (bubble && bubble.expandAll) {
      bubble.expandAll();
    }
  });
  allExpanded.value = true;
}

function handleScroll() {
  if (!messagesContainer.value) return;
  showBackToTop.value = messagesContainer.value.scrollTop > 300;
}

function scrollToTop() {
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}

function normalizeContent(content) {
  if (typeof content === 'string') return [{ type: 'text', text: content }];
  if (Array.isArray(content)) return content;
  return [];
}

watch(messages, async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
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
  gap: 20px;
  padding: 32px;
}

.thread-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;
  padding: 48px;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.empty-illustration {
  color: var(--text-muted);
  margin-bottom: 24px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}

.empty-text {
  font-family: var(--font-display);
  font-size: var(--font-size-xl);
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.empty-hint {
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin: 0;
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
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-light);
  background: linear-gradient(to bottom, var(--bg-secondary), var(--bg-primary));
  flex-shrink: 0;
}

.thread-title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  overflow: hidden;
}

.title-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--primary), #F59E0B);
  border-radius: var(--radius-md);
  color: white;
  flex-shrink: 0;
}

.thread-title {
  font-family: var(--font-display);
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
}

.header-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.message-stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  background: var(--bg-tertiary);
  padding: 4px 10px;
  border-radius: var(--radius-full);
}

.skipped-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: var(--font-size-xs);
  color: var(--color-warning);
  background: rgba(180, 83, 9, 0.1);
  padding: 4px 10px;
  border-radius: var(--radius-full);
}

.expand-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  font-weight: 500;
  color: var(--primary);
  background: transparent;
  border: 1px solid var(--primary);
  border-radius: var(--radius-md);
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
  padding: 32px 24px;
  scroll-behavior: smooth;
}

.messages-inner {
  max-width: 900px;
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
  bottom: 28px;
  right: 28px;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-fast);
  color: var(--text-primary);
}

.back-to-top-btn:hover {
  background: var(--primary);
  color: white;
  border-color: var(--primary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
