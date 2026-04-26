<template>
  <div class="conversation-list">
    <div class="conversation-list-header">
      <SearchBar :query="searchQuery" @search="handleSearch" />
    </div>

    <div class="conversation-list-content">
      <SkeletonLoader v-if="loading" :count="5" height="56px" />

      <div v-else-if="!filteredConversations || filteredConversations.length === 0" class="empty-state">
        <p>{{ searchQuery ? '无匹配结果' : '暂无对话' }}</p>
      </div>

      <ul v-else class="conversation-items">
        <li
          v-for="conv in filteredConversations"
          :key="conv.filePath"
          :class="['conversation-item', { active: conv.filePath === selectedId }]"
          @click="onSelect(conv)"
        >
          <div class="conv-main">
            <span class="conv-title">{{ cleanTitle(conv.title) || '未命名' }}</span>
            <span v-if="conv.fileSize > 50 * 1024 * 1024" class="large-file-badge">大文件</span>
          </div>
          <span class="conv-date">{{ formatDate(conv.updatedAt) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { cleanTitle } from '../utils/title-extractor.js';
import SearchBar from './SearchBar.vue';
import SkeletonLoader from './SkeletonLoader.vue';

const props = defineProps({
  conversations: Array,
  selectedId: String,
  loading: Boolean
});

const emit = defineEmits(['select', 'search', 'delete']);

const searchQuery = ref('');

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
  const days = Math.floor((now - date) / (1000 * 60 * 60 * 24));

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
  background: var(--bg-secondary);
}

.conversation-list-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-light);
}

.conversation-list-content {
  flex: 1;
  overflow-y: auto;
}

.conversation-items {
  list-style: none;
  margin: 0;
  padding: 0;
}

.conversation-item {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.conversation-item:hover {
  background: var(--bg-tertiary);
}

.conversation-item.active {
  background: var(--primary);
  color: white;
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
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.large-file-badge {
  font-size: var(--font-size-xs);
  color: var(--color-warning);
  background: rgba(245, 158, 11, 0.1);
  padding: 2px 6px;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.conversation-item.active .large-file-badge {
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.2);
}

.conv-date {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}

.conversation-item.active .conv-date {
  color: rgba(255, 255, 255, 0.7);
}

.empty-state {
  padding: 32px 16px;
  text-align: center;
  color: var(--text-muted);
  font-size: var(--font-size-sm);
}

.empty-state p {
  margin: 0;
}
</style>
