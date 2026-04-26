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
      <p>Select a conversation to view its history</p>
    </div>

    <div v-else class="thread-container">
      <div class="thread-header">
        <h2 class="thread-title">{{ conversation.title || 'Untitled Conversation' }}</h2>
        <span v-if="skippedCount > 0" class="skipped-indicator" title="Some messages were skipped">
          {{ skippedCount }} skipped
        </span>
      </div>
      <div class="thread-messages" ref="messagesContainer">
        <div class="messages-inner">
          <template v-for="(message, index) in messages" :key="index">
            <!-- Chat bubbles for user/assistant messages -->
            <ChatBubble
              v-if="message.role === 'user' || message.role === 'assistant'"
              :blocks="message.blocks || [message]"
              :role="message.role"
            />

            <!-- Permission badge -->
            <PermissionBadge
              v-else-if="message.type === 'permission_mode'"
              :mode="message.mode"
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
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';
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

const messages = computed(() => {
  if (!props.conversation || !props.conversation.messages) {
    return [];
  }
  return props.conversation.messages;
});

// Auto-scroll to bottom when new messages arrive
watch(messages, async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
}, { deep: true });
</script>

<style scoped>
.message-thread {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-primary);
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
}

.thread-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid var(--border-light);
  background-color: var(--bg-secondary);
  flex-shrink: 0;
}

.thread-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.skipped-indicator {
  font-size: var(--font-size-xs);
  color: var(--color-warning);
  background-color: rgba(202, 138, 4, 0.1);
  padding: 4px 8px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
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

.snapshot-wrapper,
.attachment-wrapper {
  margin-bottom: 16px;
}
</style>
