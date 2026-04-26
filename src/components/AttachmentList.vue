<template>
  <div class="attachment-list">
    <div v-for="attachment in attachments" :key="attachment.path || attachment.name" class="attachment-chip" @click="openAttachment(attachment)">
      <span class="file-icon">{{ getFileIcon(attachment.mimeType || attachment.type) }}</span>
      <div class="file-info">
        <span class="file-name">{{ attachment.name || getFileName(attachment.path) }}</span>
        <span v-if="attachment.size" class="file-size">{{ formatSize(attachment.size) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  blocks: {
    type: Object,
    required: true
  }
});

const attachments = computed(() => {
  if (props.blocks.attachments) {
    return props.blocks.attachments;
  }
  if (props.blocks.content) {
    try {
      const parsed = typeof props.blocks.content === 'string'
        ? JSON.parse(props.blocks.content)
        : props.blocks.content;
      return parsed.attachments || parsed.files || [];
    } catch {
      return [];
    }
  }
  return [];
});

const getFileIcon = (mimeType) => {
  if (!mimeType) return '\u{1F4C4}'; // Document
  if (mimeType.startsWith('image/')) return '\u{1F5BC}'; // Picture
  if (mimeType.startsWith('video/')) return '\u{1F3AC}'; // Video
  if (mimeType.startsWith('audio/')) return '\u{1F3B5}'; // Music
  if (mimeType.includes('pdf')) return '\u{1F4D1}'; // Memo
  if (mimeType.includes('zip') || mimeType.includes('archive')) return '\u{1F4E6}'; // Package
  return '\u{1F4C4}'; // Document
};

const getFileName = (path) => {
  if (!path) return 'Unknown';
  return path.split('/').pop() || path.split('\\').pop() || path;
};

const formatSize = (bytes) => {
  if (!bytes) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let unitIndex = 0;
  let size = bytes;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

const openAttachment = (attachment) => {
  const filePath = attachment.path || attachment.uri;
  if (filePath && window.electronAPI && window.electronAPI.openExternal) {
    window.electronAPI.openExternal(filePath);
  }
};
</script>

<style scoped>
.attachment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.attachment-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background-color: var(--bg-tertiary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
}

.attachment-chip:hover {
  background-color: var(--border-color);
  border-color: var(--primary);
}

.file-icon {
  font-size: 18px;
}

.file-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.file-name {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-primary);
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.file-size {
  font-size: var(--font-size-xs);
  color: var(--text-muted);
}
</style>
