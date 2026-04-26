<template>
  <div class="project-list">
    <div class="project-list-header">
      <div class="header-title">
        <div class="header-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <h2>项目</h2>
      </div>
      <button class="refresh-btn" @click="$emit('refresh')" :disabled="loading" title="刷新项目">
        <svg :class="{ spinning: loading }" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 4v6h-6M1 20v-6h6"/>
          <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
        </svg>
      </button>
    </div>

    <div class="project-list-content">
      <SkeletonLoader v-if="loading" :count="5" height="56px" />

      <div v-else-if="error" class="error-state">
        <div class="error-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <p>{{ error }}</p>
        <button class="retry-btn" @click="$emit('refresh')">重试</button>
      </div>

      <div v-else-if="!projects || projects.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
        <p>未找到项目</p>
        <p class="empty-hint">请确保 Claude Code 已创建对话记录</p>
      </div>

      <ul v-else class="project-items">
        <li
          v-for="(project, index) in projects"
          :key="project.id"
          :class="['project-item', { active: project.id === selectedId }]"
          @click="$emit('select', project.id)"
          :style="{ animationDelay: Math.min(index, 10) * 0.04 + 's' }"
        >
          <div class="project-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
            </svg>
          </div>
          <div class="project-info">
            <span class="project-name">{{ getDisplayName(project) }}</span>
            <span class="project-path">{{ getShortPath(project.path) }}</span>
          </div>
          <div class="project-meta">
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

function getDisplayName(project) {
  if (!project.name) {
    return project.path?.split('/').pop() || '未命名项目';
  }
  const parts = project.name.split('-');
  if (parts.length >= 2) {
    return parts.slice(-2).join('-');
  }
  return parts[parts.length - 1];
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
  background: linear-gradient(to right, var(--bg-secondary), var(--bg-primary));
}

.header-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.header-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, var(--primary), #F59E0B);
  border-radius: var(--radius-md);
  color: white;
}

.project-list-header h2 {
  font-family: var(--font-display);
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
  letter-spacing: -0.01em;
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
  transition: all var(--transition-fast);
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
  gap: 10px;
  padding: 10px 12px;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
  animation: slideIn 0.3s ease-out;
  animation-fill-mode: both;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.project-item:hover {
  background-color: var(--bg-tertiary);
}

.project-item:hover .project-meta {
  opacity: 1;
}

.project-item.active {
  background: linear-gradient(135deg, var(--primary) 0%, #6366F1 100%);
  color: white;
  box-shadow: var(--shadow-sm);
}

.project-item.active .project-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.project-item.active .project-count {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.project-item.active .delete-btn {
  color: rgba(255, 255, 255, 0.7);
}

.project-item.active .delete-btn:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.15);
}

.project-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  flex-shrink: 0;
  transition: all var(--transition-fast);
}

.project-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  gap: 2px;
}

.project-name {
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-item.active .project-name {
  color: white;
}

.project-path {
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-item.active .project-path {
  color: rgba(255, 255, 255, 0.7);
}

.project-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0;
  transition: opacity var(--transition-fast);
}

.project-item.active .project-meta {
  opacity: 1;
}

.project-count {
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  background-color: var(--bg-tertiary);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
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
  transition: all var(--transition-fast);
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

.refresh-btn:focus-visible {
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
  opacity: 0.4;
}

.empty-state p {
  font-family: var(--font-display);
  font-size: var(--font-size-sm);
  color: var(--text-muted);
  margin: 0 0 4px 0;
}

.empty-hint {
  font-size: var(--font-size-xs);
  opacity: 0.7;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background-color: rgba(185, 28, 28, 0.1);
  border-radius: var(--radius-full);
  color: var(--color-error);
  margin-bottom: 16px;
}

.error-state p {
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  color: var(--color-error);
  margin: 0 0 16px 0;
}

.retry-btn {
  padding: 8px 20px;
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--color-error);
  background-color: transparent;
  border: 1px solid var(--color-error);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.retry-btn:hover {
  background-color: var(--color-error);
  color: white;
}
</style>
