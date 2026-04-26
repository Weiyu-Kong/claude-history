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
      <p>Select a conversation to view messages</p>
    </div>

    <div v-else class="thread-container">
      <div class="thread-header">
        <h2 class="thread-title">{{ conversation.title || 'Untitled Conversation' }}</h2>
        <span v-if="skippedCount > 0" class="skipped-indicator" title="Some messages were skipped">
          {{ skippedCount }} skipped
        </span>
      </div>
      <div class="thread-messages">
        <!-- Messages will be rendered here in future iterations -->
        <div class="messages-placeholder">
          <p>Messages will appear here</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import SkeletonLoader from './SkeletonLoader.vue';

defineProps({
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

.messages-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-lg);
  color: var(--text-muted);
}
</style>
