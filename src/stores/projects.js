import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useProjectsStore = defineStore('projects', () => {
  const projects = ref([]);
  const selectedProjectId = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const selectedProject = computed(() =>
    projects.value.find(p => p.id === selectedProjectId.value) || null
  );

  async function loadProjects() {
    loading.value = true;
    error.value = null;
    try {
      const result = await window.electronAPI.scanProjects();
      projects.value = result;
    } catch (e) {
      error.value = e.message;
    } finally {
      loading.value = false;
    }
  }

  function selectProject(id) { selectedProjectId.value = id; }

  return { projects, selectedProjectId, selectedProject, loading, error, loadProjects, selectProject };
});
