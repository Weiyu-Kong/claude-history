<template>
  <div class="skeleton-loader">
    <div
      v-for="i in count"
      :key="i"
      class="skeleton-item"
      :style="{ height, animationDelay: (i - 1) * 0.1 + 's' }"
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
  gap: 16px;
  padding: 8px 0;
}

.skeleton-item {
  background: linear-gradient(
    90deg,
    var(--bg-tertiary) 0%,
    var(--bg-secondary) 50%,
    var(--bg-tertiary) 100%
  );
  background-size: 200% 100%;
  border-radius: var(--radius-md);
  animation: shimmer 1.8s ease-in-out infinite;
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
