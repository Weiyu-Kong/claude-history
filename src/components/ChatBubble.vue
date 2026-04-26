<template>
  <div :class="['chat-bubble', role]">
    <div class="bubble-header">
      <span class="avatar">{{ role === 'user' ? 'U' : 'C' }}</span>
      <span class="role-label">{{ roleLabel }}</span>
    </div>
    <div class="bubble-content">
      <template v-for="(block, i) in blocks" :key="i">
        <div v-if="block.type === 'text'" class="text-content">{{ block.text }}</div>
        <ToolCall v-else-if="block.type === 'tool_use'" :block="block" />
        <ToolResult v-else-if="block.type === 'tool_result'" :block="block" />
        <ThinkingBlock v-else-if="block.type === 'thinking'" :block="block" />
      </template>
    </div>
  </div>
</template>

<script setup>
import ToolCall from './ToolCall.vue';
import ToolResult from './ToolResult.vue';
import ThinkingBlock from './ThinkingBlock.vue';

const props = defineProps({
  blocks: {
    type: Array,
    required: true
  },
  role: {
    type: String,
    required: true,
    validator: (value) => ['user', 'assistant'].includes(value)
  }
});

const roleLabel = props.role === 'user' ? 'You' : 'Claude';
</script>

<style scoped>
.chat-bubble {
  display: flex;
  flex-direction: column;
  max-width: 80%;
  margin-bottom: 16px;
}

.chat-bubble.user {
  align-self: flex-end;
}

.chat-bubble.assistant {
  align-self: flex-start;
}

.bubble-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.avatar {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  font-weight: 600;
}

.chat-bubble.user .avatar {
  background-color: var(--bubble-user-bg);
  color: var(--bubble-user-text);
}

.chat-bubble.assistant .avatar {
  background-color: var(--bubble-claude-bg);
  color: var(--bubble-claude-text);
}

.role-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-secondary);
}

.bubble-content {
  padding: 12px 16px;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
}

.chat-bubble.user .bubble-content {
  background-color: var(--bubble-user-bg);
  color: var(--bubble-user-text);
}

.chat-bubble.assistant .bubble-content {
  background-color: var(--bubble-claude-bg);
  color: var(--bubble-claude-text);
}

.text-content {
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.6;
}
</style>
