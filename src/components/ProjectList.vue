<template>
  <div class="project-list">
    <div class="project-list-header">
      <h2>Projects</h2>
    </div>

    <div class="project-list-content">
      <SkeletonLoader v-if="loading" :count="5" height="48px" />

      <div v-else-if="error" class="error-state">
        <span class="error-icon">!</span>
        <p>{{ error }}</p>
      </div>

      <div v-else-if="!projects || projects.length === 0" class="empty-state">
        <p>No projects found</p>
      </div>

      <ul v-else class="project-items">
        <li
          v-for="project in projects"
          :key="project.id"
          :class="['project-item', { active: project.id === selectedId }]"
          @click="$emit('select', project.id)"
        >
          <span class="project-name">{{ project.name }}</span>
          <span class="project-count">{{ project.conversationCount || 0 }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import SkeletonLoader from './SkeletonLoader.vue';

defineProps({
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

defineEmits(['select']);
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
  padding: 16px;
  border-bottom: 1px solid var(--border-light);
}

.project-list-header h2 {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

.project-list-content {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.project-items {
  list-style: none;
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

.project-item.active {
  background-color: var(--primary);
  color: white;
}

.project-item.active .project-count {
  color: rgba(255, 255, 255, 0.8);
}

.project-name {
  font-size: var(--font-size-sm);
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.project-count {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
  background-color: var(--bg-tertiary);
  padding: 2px 8px;
  border-radius: var(--radius-full);
  flex-shrink: 0;
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
}
</style>
