<template>
  <div class="conversation-list">
    <div class="conversation-list-header">
      <SearchBar :query="searchQuery" @search="$emit('search', $event)" />
    </div>

    <div class="conversation-list-content">
      <SkeletonLoader v-if="loading" :count="5" height="64px" />

      <div v-else-if="!filteredConversations || filteredConversations.length === 0" class="empty-state">
        <p>{{ searchQuery ? 'No matching conversations' : 'No conversations yet' }}</p>
      </div>

      <ul v-else class="conversation-items">
        <li
          v-for="conv in filteredConversations"
          :key="conv.filePath"
          :class="['conversation-item', { active: conv.filePath === selectedId }]"
          @click="$emit('select', conv)"
        >
          <div class="conv-main">
            <span class="conv-title">{{ conv.title || 'Untitled' }}</span>
            <span v-if="conv.fileSize > 50 * 1024 * 1024" class="large-file-warning" title="Large file">
              Large file
            </span>
          </div>
          <div class="conv-meta">
            <span class="conv-date">{{ formatDate(conv.lastModified) }}</span>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import SearchBar from './SearchBar.vue';
import SkeletonLoader from './SkeletonLoader.vue';

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

defineEmits(['select', 'search']);

const searchQuery = ref('');

const filteredConversations = computed(() => {
  if (!searchQuery.value.trim()) {
    return props.conversations;
  }
  const query = searchQuery.value.toLowerCase();
  return props.conversations.filter(conv =>
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
    return 'Yesterday';
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

.conv-meta {
  display: flex;
  align-items: center;
}

.conv-date {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
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
