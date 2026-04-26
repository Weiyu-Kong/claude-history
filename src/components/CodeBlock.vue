<template>
  <div class="code-block">
    <div class="code-header">
      <span v-if="language" class="language">{{ language }}</span>
      <button class="copy-btn" @click="copyCode">
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
    </div>
    <div v-if="lines.length > MAX_PREVIEW_LINES && !expanded" class="code-preview">
      <pre><code v-html="highlightedPreview"></code></pre>
      <button class="expand-btn" @click="expanded = true">
        Expand {{ lines.length }} lines
      </button>
    </div>
    <div v-else class="code-full">
      <pre><code v-html="highlighted"></code></pre>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import hljs from 'highlight.js/lib/core';
import json from 'highlight.js/lib/languages/json';
import javascript from 'highlight.js/lib/languages/javascript';
import bash from 'highlight.js/lib/languages/bash';
import plaintext from 'highlight.js/lib/languages/plaintext';

hljs.registerLanguage('json', json);
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('js', javascript);
hljs.registerLanguage('bash', bash);
hljs.registerLanguage('sh', bash);
hljs.registerLanguage('plaintext', plaintext);

const props = defineProps({
  code: {
    type: String,
    required: true
  },
  language: {
    type: String,
    default: 'plaintext'
  }
});

const MAX_PREVIEW_LINES = 15;
const expanded = ref(false);
const copied = ref(false);

const lines = computed(() => props.code.split('\n'));

const escapeHtml = (text) => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
};

const highlightCode = (code) => {
  const escaped = escapeHtml(code);
  try {
    if (hljs.getLanguage(props.language)) {
      return hljs.highlight(escaped, { language: props.language }).value;
    }
    return hljs.highlight(escaped, { language: 'plaintext' }).value;
  } catch {
    return escaped;
  }
};

const highlighted = computed(() => highlightCode(props.code));

const highlightedPreview = computed(() => {
  const previewLines = lines.value.slice(0, MAX_PREVIEW_LINES).join('\n');
  return highlightCode(previewLines);
});

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(props.code);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy code:', err);
  }
};
</script>

<style scoped>
.code-block {
  margin-top: 8px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  background-color: #1e1e1e;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background-color: #2d2d2d;
  border-bottom: 1px solid #3d3d3d;
}

.language {
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
  color: #a0a0a0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.copy-btn {
  padding: 4px 12px;
  background-color: #3d3d3d;
  color: #e0e0e0;
  border: none;
  border-radius: var(--radius-sm);
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  cursor: pointer;
  transition: background-color 0.2s;
}

.copy-btn:hover {
  background-color: #4d4d4d;
}

.code-preview {
  position: relative;
}

.code-preview pre,
.code-full pre {
  margin: 0;
  padding: 12px;
  overflow-x: auto;
  background-color: #1e1e1e;
}

.code-preview code,
.code-full code {
  font-family: var(--font-mono);
  font-size: var(--font-size-sm);
  line-height: 1.5;
  color: #e0e0e0;
}

.expand-btn {
  width: 100%;
  padding: 8px 12px;
  background-color: #2d2d2d;
  color: #a0a0a0;
  border: none;
  border-top: 1px solid #3d3d3d;
  cursor: pointer;
  font-family: var(--font-sans);
  font-size: var(--font-size-xs);
  text-align: center;
  transition: background-color 0.2s;
}

.expand-btn:hover {
  background-color: #3d3d3d;
  color: #e0e0e0;
}

/* highlight.js theme overrides for dark code blocks */
.code-block :deep(.hljs-keyword),
.code-block :deep(.hljs-selector-tag),
.code-block :deep(.hljs-literal),
.code-block :deep(.hljs-section),
.code-block :deep(.hljs-link) {
  color: #569cd6;
}

.code-block :deep(.hljs-string),
.code-block :deep(.hljs-title),
.code-block :deep(.hljs-name),
.code-block :deep(.hljs-type),
.code-block :deep(.hljs-attribute),
.code-block :deep(.hljs-symbol),
.code-block :deep(.hljs-bullet),
.code-block :deep(.hljs-addition),
.code-block :deep(.hljs-variable),
.code-block :deep(.hljs-template-tag),
.code-block :deep(.hljs-template-variable) {
  color: #ce9178;
}

.code-block :deep(.hljs-comment),
.code-block :deep(.hljs-quote),
.code-block :deep(.hljs-deletion),
.code-block :deep(.hljs-meta) {
  color: #6a9955;
}

.code-block :deep(.hljs-number) {
  color: #b5cea8;
}

.code-block :deep(.hljs-built_in),
.code-block :deep(.hljs-class .hljs-title) {
  color: #4ec9b0;
}

.code-block :deep(.hljs-function) {
  color: #dcdcaa;
}

.code-block :deep(.hljs-params) {
  color: #9cdcfe;
}
</style>
