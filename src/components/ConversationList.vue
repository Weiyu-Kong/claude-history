<template>
  <div class="conversation-list">
    <div class="conversation-list-header">
      <SearchBar :query="searchQuery" @search="$emit('search', $event)" />
    </div>

    <div class="conversation-list-content">
      <SkeletonLoader v-if="loading" :count="5" height="64px" />

      <div v-else-if="!filteredConversations || filteredConversations.length === 0" class="empty-state">
        <p>{{ searchQuery ? '没有匹配的对话' : '暂无对话' }}</p>
      </div>

      <ul v-else class="conversation-items">
        <li
          v-for="conv in filteredConversations"
          :key="conv.filePath"
          :class="['conversation-item', { active: conv.filePath === selectedId }]"
          @click="onSelect(conv)"
        >
          <div class="conv-main">
            <span class="conv-title">{{ cleanTitle(conv.title) || 'click to show title' }}</span>
            <span v-if="conv.fileSize > 50 * 1024 * 1024" class="large-file-warning" title="文件较大">
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
        </li>
      </ul>
    </div>

    <!-- Delete confirmation dialog -->
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

// Search query
const searchQuery = ref('');

// Delete confirmation state
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
  background-color: var(--bg-primary);
  border-right: 1px solid var(--border-color);
}

.conversation-list-header {
  padding: 12px;
  border-bottom: 1px solid var(--border-light);
}

.conversation-list-content {
  flex: 1;
  overflow-y: auto;
}

.conversation-items {
  list-style: none;
}

.conversation-item {
  padding: 12px 16px;
  cursor: pointer;
  border-bottom: 1px solid var(--border-light);
  transition: background-color 0.15s ease;
}

.conversation-item:hover {
  background-color: var(--bg-secondary);
}

.conversation-item:hover .delete-btn {
  opacity: 1;
}

.conversation-item.active {
  background-color: var(--bg-tertiary);
  border-left: 3px solid var(--primary);
  padding-left: 13px;
}

.conv-main {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.conv-title {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.large-file-warning {
  font-size: var(--font-size-xs);
  color: var(--color-warning);
  background-color: rgba(202, 138, 4, 0.1);
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
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.delete-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  cursor: pointer;
  opacity: 0;
  transition: all 0.15s ease;
}

.conversation-item.active .delete-btn {
  opacity: 1;
  color: var(--text-muted);
}

.delete-btn:hover {
  color: var(--color-error);
  background-color: rgba(220, 38, 38, 0.1);
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}
</style>