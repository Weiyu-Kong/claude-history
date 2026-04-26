<template>
  <div class="search-bar">
    <span class="search-icon">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <path d="m21 21-4.35-4.35"></path>
      </svg>
    </span>
    <input
      ref="inputRef"
      type="text"
      :value="query"
      placeholder="搜索对话..."
      @input="handleInput"
    />
    <button
      v-if="query"
      class="clear-btn"
      @click="clearSearch"
      title="清除搜索"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M18 6 6 18"></path>
        <path d="m6 6 12 12"></path>
      </svg>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  query: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['search']);
const inputRef = ref(null);

function handleInput(event) {
  emit('search', event.target.value);
}

function clearSearch() {
  emit('search', '');
  inputRef.value?.focus();
}

onMounted(() => {
  inputRef.value?.focus();
});
</script>

<style scoped>
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-muted);
  pointer-events: none;
  display: flex;
  align-items: center;
}

input {
  width: 100%;
  padding: 10px 36px;
  font-size: var(--font-size-sm);
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

input::placeholder {
  color: var(--text-muted);
}

input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.clear-btn {
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.clear-btn:hover {
  color: var(--text-primary);
  background-color: var(--bg-secondary);
}
</style>
