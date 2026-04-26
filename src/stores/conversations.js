import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useConversationsStore = defineStore('conversations', () => {
  const selectedConvId = ref(null);
  const activeConversation = ref(null);
  const loading = ref(false);
  const skippedMessages = ref(0);
  const cache = new Map();

  const selectedConv = computed(() =>
    activeConversation.value?.messages?.find(m => m.id === selectedConvId.value) || null
  );

  async function openConversation(conv) {
    if (activeConversation.value?.filePath === conv.filePath) return;
    loading.value = true;
    try {
      if (cache.has(conv.filePath)) {
        activeConversation.value = cache.get(conv.filePath);
      } else {
        const result = await window.electronAPI.loadConversation(conv.filePath);
        if (cache.size >= 20) {
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
        cache.set(conv.filePath, result);
        activeConversation.value = result;
      }
      skippedMessages.value = activeConversation.value.skippedCount || 0;
    } finally {
      loading.value = false;
    }
  }

  function clearActive() { activeConversation.value = null; }

  return { selectedConvId, activeConversation, loading, skippedMessages, selectedConv, openConversation, clearActive };
});
