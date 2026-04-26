<template>
  <div class="skeleton-loader">
    <div
      v-for="i in count"
      :key="i"
      class="skeleton-item"
      :style="{ height }"
    ></div>
  </div>
</template>

<script setup>
defineProps({
  count: {
    type: Number,
    default: 5
  },
  height: {
    type: String,
    default: '16px'
  }
});
</script>

<style scoped>
.skeleton-loader {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-item {
  background: linear-gradient(
    90deg,
    var(--bg-tertiary) 25%,
    var(--bg-secondary) 50%,
    var(--bg-tertiary) 75%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-sm);
  animation: shimmer 1.5s infinite ease-in-out;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
