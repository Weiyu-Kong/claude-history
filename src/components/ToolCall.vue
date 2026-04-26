<template>
  <div class="tool-call">
    <button class="toggle-btn" @click="expanded = !expanded">
      <span class="toggle-icon">{{ expanded ? '▼' : '▶' }}</span>
      <span class="tool-name">Tool: {{ toolName }}</span>
      <span v-if="lineCount > 0" class="line-count">({{ lineCount }} lines)</span>
    </button>
    <div v-if="expanded" class="tool-content">
      <pre class="code-block"><code>{{ inputText }}</code></pre>
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

const toolName = computed(() => props.block.toolName || 'unknown');

const lineCount = computed(() => {
  if (props.block.inputLines) {
    return props.block.inputLines;
  }
  if (props.block.input) {
    const lines = props.block.input.split('\n').length;
    return lines > 1 ? lines : 0;
  }
  return 0;
});

const inputText = computed(() => {
  if (typeof props.block.input === 'string') {
    return props.block.input;
  }
  return JSON.stringify(props.block.input, null, 2);
});
</script>

<style scoped>
.tool-call {
  margin-top: 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
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

.tool-name {
  font-weight: 500;
  color: var(--primary);
}

.line-count {
  color: var(--text-muted);
}

.tool-content {
  padding: 12px;
  background-color: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  max-height: 400px;
  overflow-y: auto;
}

.code-block {
  margin: 0;
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--text-primary);
}
</style>
