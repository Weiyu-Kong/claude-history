<template>
  <div class="project-list">
    <div class="project-list-header">
      <h2>项目列表</h2>
      <button class="refresh-btn" @click="$emit('refresh')" :disabled="loading" title="刷新项目">
        <svg :class="{ spinning: loading }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 4v6h-6M1 20v-6h6"/>
          <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
        </svg>
      </button>
    </div>

    <div class="project-list-content">
      <SkeletonLoader v-if="loading" :count="5" height="48px" />

      <div v-else-if="error" class="error-state">
        <span class="error-icon">!</span>
        <p>{{ error }}</p>
        <button class="retry-btn" @click="$emit('refresh')">重试</button>
      </div>

      <div v-else-if="!projects || projects.length === 0" class="empty-state">
        <p>未找到项目</p>
        <p class="empty-hint">请确保 Claude Code 已创建对话记录</p>
      </div>

      <ul v-else class="project-items">
        <li
          v-for="project in projects"
          :key="project.id"
          :class="['project-item', { active: project.id === selectedId }]"
          @click="$emit('select', project.id)"
          @contextmenu.prevent="showContextMenu($event, project)"
        >
          <div class="project-info">
            <span class="project-name">{{ getDisplayName(project) }}</span>
            <span class="project-path">{{ getShortPath(project.path) }}</span>
          </div>
          <div class="project-actions">
            <span class="project-count">{{ project.conversations?.length || 0 }}</span>
            <button class="delete-btn" @click.stop="confirmDelete(project)" title="删除项目">
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
      title="删除项目"
      :message="`确定要删除项目 &quot;${pendingDelete?.displayName}&quot; 吗？此操作无法撤销。`"
      type="danger"
      @confirm="handleDelete"
      @cancel="showDeleteConfirm = false"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import SkeletonLoader from './SkeletonLoader.vue';
import ConfirmDialog from './ConfirmDialog.vue';

const props = defineProps({
  projects: {
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
  },
  error: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['select', 'refresh', 'delete']);

// Delete confirmation state
const showDeleteConfirm = ref(false);
const pendingDelete = ref(null);

function confirmDelete(project) {
  pendingDelete.value = {
    id: project.id,
    name: project.name,
    displayName: getDisplayName(project)
  };
  showDeleteConfirm.value = true;
}

function handleDelete() {
  if (pendingDelete.value) {
    emit('delete', pendingDelete.value.id);
  }
  showDeleteConfirm.value = false;
  pendingDelete.value = null;
}

function showContextMenu(event, project) {
  // Context menu can be added later if needed
}

// Format project name - extract last two segments separated by hyphen
function getDisplayName(project) {
  if (project.name) {
    const parts = project.name.split('-');
    if (parts.length >= 2) {
      return parts.slice(-2).join('-');
    }
    return parts[parts.length - 1];
  }
  return project.name;
}

function getShortPath(path) {
  if (!path) return '';
  const parts = path.split('/').filter(Boolean);
  if (parts.length <= 3) return path;
  return parts.slice(0, 2).join('/') + '/.../' + parts.slice(-1).join('/');
}
</script>

<style scoped>
.project-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
}

.project-list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid var(--border-light);
}

.project-list-header h2 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.refresh-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background-color: transparent;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.refresh-btn:hover:not(:disabled) {
  background-color: var(--bg-tertiary);
  color: var(--primary);
  border-color: var(--primary);
}

.refresh-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.refresh-btn svg.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.project-list-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.project-items {
  list-style: none;
  margin: 0;
  padding: 0;
}

.project-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.project-item:hover {
  background-color: var(--bg-tertiary);
}

.project-item:hover .project-actions {
  opacity: 1;
}

.project-item.active {
  background-color: var(--primary);
  color: white;
}

.project-item.active .project-count {
  color: rgba(255, 255, 255, 0.8);
}

.project-item.active .delete-btn {
  color: rgba(255, 255, 255, 0.8);
}

.project-item.active .delete-btn:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
}

.project-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  gap: 2px;
}

.project-name {
  font-size: var(--font-size-sm);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-path {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  opacity: 0.7;
}

.project-item.active .project-path {
  color: rgba(255, 255, 255, 0.7);
}

.project-count {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  background-color: var(--bg-tertiary);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
}

.project-actions {
  opacity: 0;
  transition: opacity 0.15s ease;
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
  transition: all 0.15s ease;
}

.delete-btn:hover {
  color: var(--color-error);
  background-color: rgba(220, 38, 38, 0.1);
}

.empty-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  color: var(--text-muted);
}

.empty-hint {
  font-size: var(--font-size-xs);
  margin-top: 8px;
  opacity: 0.7;
}

.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: var(--color-error);
  color: white;
  border-radius: 50%;
  font-weight: bold;
  margin-bottom: 12px;
}

.error-state p {
  font-size: var(--font-size-sm);
  color: var(--color-error);
  margin: 0 0 12px 0;
}

.retry-btn {
  padding: 6px 16px;
  font-size: var(--font-size-sm);
  color: var(--primary);
  background-color: transparent;
  border: 1px solid var(--primary);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
}

.retry-btn:hover {
  background-color: var(--primary);
  color: white;
}
</style>