<template>
  <div id="app">
    <div class="app-container">
      <aside class="panel panel-left" :style="{ width: leftPanelWidth + 'px' }">
        <ProjectList
          :projects="projectsStore.projects"
          :selectedId="projectsStore.selectedProjectId"
          :loading="projectsStore.loading"
          :error="projectsStore.error"
          @select="handleProjectSelect"
          @refresh="handleRefresh"
          @delete="handleProjectDelete"
        />
      </aside>

      <div class="resize-handle" @mousedown="startResize('left', $event)">
        <div class="handle-line"></div>
      </div>

      <aside class="panel panel-middle" :style="{ width: middlePanelWidth + 'px' }">
        <div class="panel-header-actions">
          <ThemeSelector />
        </div>
        <ConversationList
          :conversations="currentConversations"
          :selectedId="conversationsStore.activeConversation?.filePath"
          :loading="conversationsStore.loading"
          @select="handleConversationSelect"
          @delete="handleConversationDelete"
        />
      </aside>

      <div class="resize-handle" @mousedown="startResize('right', $event)">
        <div class="handle-line"></div>
      </div>

      <main class="panel panel-right" :style="{ minWidth: rightPanelMinWidth + 'px' }">
        <MessageThread
          :conversation="conversationsStore.activeConversation"
          :loading="conversationsStore.loading"
          :skippedCount="conversationsStore.skippedMessages"
        />
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useProjectsStore } from './stores/projects';
import { useConversationsStore } from './stores/conversations';
import { useThemeStore } from './stores/theme';
import ProjectList from './components/ProjectList.vue';
import ConversationList from './components/ConversationList.vue';
import MessageThread from './components/MessageThread.vue';
import ThemeSelector from './components/ThemeSelector.vue';

const projectsStore = useProjectsStore();
const conversationsStore = useConversationsStore();
const themeStore = useThemeStore();

const leftPanelWidth = ref(240);
const middlePanelWidth = ref(300);
const rightPanelMinWidth = 400;

const currentConversations = computed(() => {
  return projectsStore.selectedProject?.conversations || [];
});

function handleProjectSelect(projectId) {
  projectsStore.selectProject(projectId);
  conversationsStore.clearActive();
}

function handleConversationSelect(conv) {
  conversationsStore.openConversation(conv);
}

function handleRefresh() {
  projectsStore.clearSelectedProject();
  conversationsStore.clearActive();
  projectsStore.loadProjects();
}

function handleProjectDelete(projectId) {
  window.electronAPI.deleteProject(projectId).then(() => {
    const index = projectsStore.projects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      projectsStore.projects.splice(index, 1);
    }
    conversationsStore.clearActive();
  });
}

function handleConversationDelete(filePath) {
  window.electronAPI.deleteConversation(filePath).then(() => {
    const currentProject = projectsStore.selectedProject;
    if (currentProject && currentProject.conversations) {
      const index = currentProject.conversations.findIndex(c => c.filePath === filePath);
      if (index !== -1) {
        currentProject.conversations.splice(index, 1);
      }
    }
    conversationsStore.clearActive();
  });
}

const resizing = ref(null);
const resizeStartX = ref(0);
const resizeStartWidth = ref(0);

function startResize(panel, event) {
  resizing.value = panel;
  resizeStartX.value = event.clientX;
  resizeStartWidth.value = panel === 'left' ? leftPanelWidth.value : middlePanelWidth.value;
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
}

function handleResize(event) {
  if (!resizing.value) return;
  const delta = event.clientX - resizeStartX.value;

  if (resizing.value === 'left') {
    const newWidth = resizeStartWidth.value + delta;
    leftPanelWidth.value = Math.max(180, Math.min(360, newWidth));
  } else if (resizing.value === 'right') {
    const newWidth = resizeStartWidth.value + delta;
    middlePanelWidth.value = Math.max(240, Math.min(480, newWidth));
  }
}

function stopResize() {
  resizing.value = null;
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
  document.body.style.cursor = '';
  document.body.style.userSelect = '';
}

onMounted(() => {
  themeStore.initTheme();
  projectsStore.loadProjects();
});
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100%;
  overflow: hidden;
}

.panel {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-left {
  flex-shrink: 0;
}

.panel-middle {
  flex-shrink: 0;
}

.panel-right {
  flex: 1;
}

.panel-header-actions {
  display: flex;
  justify-content: flex-end;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-light);
  background: var(--bg-secondary);
}

.resize-handle {
  width: 8px;
  background-color: var(--border-light);
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background-color var(--transition-fast);
}

.resize-handle:hover {
  background-color: var(--bg-tertiary);
}

.resize-handle:hover .handle-line {
  background-color: var(--primary);
  transform: scaleY(1.3);
}

.handle-line {
  width: 2px;
  height: 40px;
  background-color: var(--border-color);
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
}
</style>
