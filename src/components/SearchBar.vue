<template>
  <div class="search-bar">
    <span class="search-icon">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
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
  transition: color var(--transition-fast);
}

.search-bar:focus-within .search-icon {
  color: var(--primary);
}

input {
  width: 100%;
  padding: 10px 36px 10px 36px;
  font-family: var(--font-sans);
  font-size: var(--font-size-sm);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  transition: all var(--transition-fast);
}

input::placeholder {
  color: var(--text-muted);
  font-style: italic;
}

input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(180, 83, 9, 0.1);
  background-color: var(--bg-primary);
}

.clear-btn {
  position: absolute;
  right: 6px;
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
  transition: all var(--transition-fast);
}

.clear-btn:hover {
  color: var(--text-primary);
  background-color: var(--bg-tertiary);
}
</style>
