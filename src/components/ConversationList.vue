<template>
  <div class="conversation-list">
    <div class="conversation-list-header">
      <div class="header-label">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>对话</span>
      </div>
      <SearchBar :query="searchQuery" @search="handleSearch" />
    </div>

    <div class="conversation-list-content">
      <SkeletonLoader v-if="loading" :count="5" height="72px" />

      <div v-else-if="!filteredConversations || filteredConversations.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"></circle>
            <path d="M8 15s1.5-2 4-2 4 2 4 2"></path>
            <line x1="9" y1="9" x2="9.01" y2="9"></line>
            <line x1="15" y1="9" x2="15.01" y2="9"></line>
          </svg>
        </div>
        <p>{{ searchQuery ? '没有匹配的对话' : '暂无对话' }}</p>
      </div>

      <ul v-else class="conversation-items">
        <li
          v-for="(conv, index) in filteredConversations"
          :key="conv.filePath"
          :class="['conversation-item', { active: conv.filePath === selectedId }]"
          @click="onSelect(conv)"
          :style="{ animationDelay: Math.min(index, 10) * 0.03 + 's' }"
        >
          <div class="conv-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div class="conv-content">
            <div class="conv-main">
              <span class="conv-title">{{ cleanTitle(conv.title) || 'click to show title' }}</span>
              <span v-if="conv.fileSize > 50 * 1024 * 1024" class="large-file-warning">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                  <line x1="12" y1="9" x2="12" y2="13"></line>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
                大文件
              </span>
            </div>
            <div class="conv-footer">
              <span class="conv-date">{{ formatDate(conv.updatedAt) }}</span>
              <button class="delete-btn" @click.stop="confirmDelete(conv)" title="删除对话">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
              </button>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <ConfirmDialog
      :show="showDeleteConfirm"
      title="删除对话"
      :message="`确定要删除对话 &quot;${pendingDelete?.displayName}&quot; 吗？此操作无法撤销。`"
      type="danger"
      @confirm="handleDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { cleanTitle } from '../utils/title-extractor.js';
import SearchBar from './SearchBar.vue';
import SkeletonLoader from './SkeletonLoader.vue';
import ConfirmDialog from './ConfirmDialog.vue';

const props = defineProps({
  conversations: {
    type: Array,
    default: () => []
  },
  selectedId: {
    type: String,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['select', 'search', 'delete']);

const searchQuery = ref('');
const showDeleteConfirm = ref(false);
const pendingDelete = ref(null);

function confirmDelete(conv) {
  pendingDelete.value = {
    filePath: conv.filePath,
    displayName: cleanTitle(conv.title) || 'Untitled'
  };
  showDeleteConfirm.value = true;
}

function handleDelete() {
  if (pendingDelete.value) {
    emit('delete', pendingDelete.value.filePath);
  }
  showDeleteConfirm.value = false;
  pendingDelete.value = null;
}

function handleSearch(query) {
  searchQuery.value = query;
}

function onSelect(conv) {
  emit('select', conv);
}

const filteredConversations = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.conversations || [];
  }
  const query = searchQuery.value.toLowerCase();
  return (props.conversations || []).filter(conv =>
    (conv.title || '').toLowerCase().includes(query)
  );
});

function formatDate(timestamp) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now - date;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } else if (days === 1) {
    return '昨天';
  } else if (days < 7) {
    return date.toLocaleDateString([], { weekday: 'short' });
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }
}
</script>

<style scoped>
.conversation-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-secondary);
}

.conversation-list-header {
  padding: 16px;
  border-bottom: 1px solid var(--border-light);
}

.header-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: var(--font-display);
  font-size: var(--font-size-sm);
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.conversation-list-content {
  flex: 1;
  overflow-y: auto;
}

.conversation-items {
  list-style: none;
  padding: 8px 0;
}

.conversation-item {
  position: relative;
  display: flex;
  align-items: stretch;
  cursor: pointer;
  transition: background-color var(--transition-fast);
  animation: slideIn 0.3s ease-out;
  animation-fill-mode: both;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.conversation-item:hover {
  background-color: var(--bg-tertiary);
}

.conversation-item:hover .delete-btn,
.conversation-item:hover .project-meta {
  opacity: 1;
}

.conversation-item.active {
  background: linear-gradient(135deg, var(--primary) 0%, #6366F1 100%);
  color: white;
  box-shadow: var(--shadow-sm);
}

.conversation-item.active .conv-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.conversation-item.active .conv-count {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.conversation-item.active .delete-btn {
  color: rgba(255, 255, 255, 0.7);
}

.conversation-item.active .delete-btn:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.15);
}

.conv-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.conv-content {
  flex: 1;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-light);
}

.conv-main {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.conv-title {
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.large-file-warning {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: var(--font-size-xs);
  color: var(--color-warning);
  background-color: rgba(180, 83, 9, 0.1);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.conv-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.conv-date {
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  cursor: pointer;
  opacity: 0;
  transition: all var(--transition-fast);
}

.conversation-item.active .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: var(--color-error);
  background-color: rgba(185, 28, 28, 0.1);
}

.delete-btn:focus-visible {
  opacity: 1;
  outline: 2px solid var(--primary);
  outline-offset: 2px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-icon {
  color: var(--text-muted);
  margin-bottom: 16px;
  opacity: 0.5;
}

.empty-state p {
  font-family: var(--font-display);
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin: 0;
}
</style>
