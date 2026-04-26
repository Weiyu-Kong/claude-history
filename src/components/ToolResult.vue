<template>
  <div :class="['tool-result', { error: isError }]">
    <button class="toggle-btn" @click="expanded = !expanded">
      <span class="toggle-icon">{{ expanded ? '▼' : '▶' }}</span>
      <span class="result-label">Tool Result</span>
      <span v-if="isError" class="error-badge">Error</span>
    </button>
    <div v-if="expanded" class="result-content">
      <pre class="result-text"><code>{{ contentText }}</code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  block: {
    type: Object,
    required: true
  }
});

const expanded = ref(false);

const isError = computed(() => {
  return props.block.isError === true || props.block.is_error === true;
});

const contentText = computed(() => {
  const content = props.block.content || props.block.result || '';
  if (typeof content === 'string') {
    return content;
  }
  return JSON.stringify(content, null, 2);
});
</script>

<style scoped>
.tool-result {
  margin-top: 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.tool-result.error {
  border-color: var(--color-error);
}

.toggle-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: var(--bg-tertiary);
  border: none;
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  text-align: left;
}

.toggle-btn:hover {
  background-color: var(--border-color);
}

.toggle-icon {
  font-size: 10px;
  color: var(--text-muted);
}

.result-label {
  font-weight: 500;
}

.error-badge {
  background-color: var(--color-error);
  color: white;
  padding: 2px 8px;
  border-radius: var(--radius-full);
  font-size: var(--font-size-xs);
  font-weight: 600;
}

.result-content {
  padding: 12px;
  background-color: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  max-height: 400px;
  overflow-y: auto;
}

.tool-result.error .result-content {
  background-color: rgba(220, 38, 38, 0.05);
}

.result-text {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--text-primary);
}

.tool-result.error .result-text {
  color: var(--color-error);
}
</style>
