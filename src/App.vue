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

      <div class="resize-handle" @mousedown="startResize('left', $event)"></div>

      <aside class="panel panel-middle" :style="{ width: middlePanelWidth + 'px' }">
        <ConversationList
          :conversations="currentConversations"
          :selectedId="conversationsStore.activeConversation?.filePath"
          :loading="conversationsStore.loading"
          @select="handleConversationSelect"
          @delete="handleConversationDelete"
        />
      </aside>

      <div class="resize-handle" @mousedown="startResize('right', $event)"></div>

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
import ProjectList from './components/ProjectList.vue';
import ConversationList from './components/ConversationList.vue';
import MessageThread from './components/MessageThread.vue';

const projectsStore = useProjectsStore();
const conversationsStore = useConversationsStore();

// Panel dimensions
const leftPanelWidth = ref(240);
const middlePanelWidth = ref(280);
const rightPanelMinWidth = 400;

// Conversation list for selected project
const currentConversations = computed(() => {
  return projectsStore.selectedProject?.conversations || [];
});

// Handlers
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
    // 直接从本地状态移除，不要重新扫描（重新扫描会从磁盘恢复被删除的记录）
    const index = projectsStore.projects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      projectsStore.projects.splice(index, 1);
    }
    conversationsStore.clearActive();
  });
}

function handleConversationDelete(filePath) {
  window.electronAPI.deleteConversation(filePath).then(() => {
    // 直接从当前项目的对话列表移除
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

// Panel resizing
const resizing = ref(null);
const resizeStartX = ref(0);
const resizeStartWidth = ref(0);

function startResize(panel, event) {
  resizing.value = panel;
  resizeStartX.value = event.clientX;
  resizeStartWidth.value = panel === 'left' ? leftPanelWidth.value : middlePanelWidth.value;
  document.addEventListener('mousemove', handleResize);
  document.addEventListener('mouseup', stopResize);
}

function handleResize(event) {
  if (!resizing.value) return;
  const delta = event.clientX - resizeStartX.value;

  if (resizing.value === 'left') {
    const newWidth = resizeStartWidth.value + delta;
    leftPanelWidth.value = Math.max(160, Math.min(400, newWidth));
  } else if (resizing.value === 'right') {
    const newWidth = resizeStartWidth.value + delta;
    middlePanelWidth.value = Math.max(200, Math.min(500, newWidth));
  }
}

function stopResize() {
  resizing.value = null;
  document.removeEventListener('mousemove', handleResize);
  document.removeEventListener('mouseup', stopResize);
}

// Load projects on mount
onMounted(() => {
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

.resize-handle {
  width: 4px;
  background-color: var(--border-light);
  cursor: col-resize;
  transition: background-color 0.15s ease;
  flex-shrink: 0;
}

.resize-handle:hover {
  background-color: var(--primary);
}
</style>
