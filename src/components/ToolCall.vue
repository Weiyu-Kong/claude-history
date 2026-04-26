<template>
  <div class="tool-call">
    <button class="toggle-btn" @click="expanded = !expanded">
      <span class="toggle-icon">{{ expanded ? '▼' : '▶' }}</span>
      <span class="tool-name">Tool: {{ toolName }}</span>
      <span v-if="lineCount > 0" class="line-count">({{ lineCount }} lines)</span>
    </button>
    <div v-if="expanded" class="tool-content">
      <!-- Special formatting for Bash commands with JSON structure -->
      <div v-if="isBashJsonCommand" class="bash-command-wrapper">
        <div class="bash-field">
          <span class="bash-label">Command</span>
          <pre class="bash-command"><code>{{ parsedCommand }}</code></pre>
        </div>
        <div v-if="parsedDescription" class="bash-field">
          <span class="bash-label">Description</span>
          <span class="bash-description">{{ parsedDescription }}</span>
        </div>
      </div>
      <!-- Default JSON display for other tools -->
      <pre v-else class="code-block"><code>{{ inputText }}</code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineExpose } from 'vue';

const props = defineProps({
  block: {
    type: Object,
    required: true
  }
});

const expanded = ref(false);

const toolName = computed(() => props.block.toolName || props.block.name || 'unknown');

const lineCount = computed(() => {
  if (props.block.inputLines) {
    return props.block.inputLines;
  }
  const input = props.block.input;
  if (typeof input === 'string') {
    const lines = input.split('\n').length;
    return lines > 1 ? lines : 0;
  }
  if (typeof input === 'object' && input !== null) {
    return 1; // Single-line JSON object
  }
  return 0;
});

const inputText = computed(() => {
  const input = props.block.input;
  if (typeof input === 'string') {
    return input;
  }
  if (typeof input === 'object' && input !== null) {
    return JSON.stringify(input, null, 2);
  }
  return '';
});

// Check if this is a Bash command with {command, description} structure
const isBashJsonCommand = computed(() => {
  const name = toolName.value.toLowerCase();
  if (name !== 'bash') return false;

  const input = props.block.input;
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      return parsed.command && typeof parsed.command === 'string';
    } catch {
      return false;
    }
  }
  if (typeof input === 'object' && input !== null) {
    return input.command && typeof input.command === 'string';
  }
  return false;
});

const parsedCommand = computed(() => {
  const input = props.block.input;
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      return parsed.command || '';
    } catch {
      return input;
    }
  }
  if (typeof input === 'object' && input !== null) {
    return input.command || '';
  }
  return '';
});

const parsedDescription = computed(() => {
  const input = props.block.input;
  if (typeof input === 'string') {
    try {
      const parsed = JSON.parse(input);
      return parsed.description || '';
    } catch {
      return '';
    }
  }
  if (typeof input === 'object' && input !== null) {
    return input.description || '';
  }
  return '';
});

// Expand all
function expandAll() {
  expanded.value = true;
}

defineExpose({ expandAll });
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

/* Bash command special styling */
.bash-command-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bash-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.bash-label {
  font-size: var(--font-size-xs);
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.bash-command {
  margin: 0;
  padding: 12px;
  background-color: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  white-space: pre-wrap;
  word-break: break-word;
  color: var(--text-primary);
  line-height: 1.5;
  overflow-x: auto;
}

.bash-description {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  font-style: italic;
}
</style>