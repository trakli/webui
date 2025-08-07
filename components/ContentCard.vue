<template>
  <div class="entity-card">
    <div class="entity-icon-name" :class="{ 'no-icon': !icon }">
      <component v-if="icon" :is="resolvedIcon" class="entity-icon" />
      <span class="name">{{ name }}</span>
    </div>
    <div class="entity-description">
      {{ description }}
    </div>

    <div class="entity-actions">
      <button class="action-button edit" :title="`Edit ${pageName}`" @click="$emit('edit')">
        <LucideEdit />
      </button>
      <button class="action-button delete" :title="`Delete ${pageName}`" @click="$emit('delete')">
        <LucideTrash />
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, computed } from 'vue';
import { Edit as LucideEdit, Trash as LucideTrash } from 'lucide-vue-next';
import * as LucideIcons from 'lucide-vue-next';

const props = defineProps({
  name: String,
  icon: {
    type: String,
    default: null
  },
  description: String,
  pageName: {
    type: String,
    required: true
  }
});

defineEmits(['edit', 'delete']);

const resolvedIcon = computed(() => {
  if (!props.icon) return null;
  return LucideIcons[props.icon] || LucideIcons.Box;
});
</script>

<style lang="scss" scoped>
@use '~/assets/scss/_variables' as *;

.entity-card {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: $spacing-4;
  border-bottom: 1px solid $border-light;
  gap: $spacing-4;
  background: $bg-gray;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    background: whitesmoke;

    .entity-icon {
      transform: scale(1.1);
    }

    .action-button {
      opacity: 1;
      transform: translateX(0);
    }
  }
}

.entity-icon {
  width: 24px;
  height: 24px;
  color: $primary;
  transition: transform 0.2s ease;
  flex-shrink: 0;
}

.entity-icon-name {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2;
  width: 15%;
  flex-shrink: 0;
  .name {
    font-weight: 600;
    color: $primary;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &.no-icon {
    padding-left: calc(#{$spacing-2} + 24px + #{$spacing-2});
  }
}

.entity-description {
  flex: 1;
  color: $primary;
  font-size: 0.95rem;
  padding: $spacing-1 $spacing-2;
  gap: $spacing-2;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  overflow: hidden;
  width: 100%;
}

.entity-actions {
  display: flex;
  gap: $spacing-2;
  align-items: left;
  flex-shrink: 0;
  width: 10%;
  transition: opacity 0.2s ease;

  &:hover {
    opacity: 1;
  }
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  opacity: 0.7;
  transform: translateX(10px);
  width: 32px; // Fixed width for consistency
  height: 32px; // Fixed height for consistency

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    color: $error-color;
    background: lighten($error-color, 45%);
  }

  &.edit:hover {
    color: $primary;
  }

  &.delete {
    svg {
      color: $error-color;
    }

    &:hover {
      color: $error-color;
      background: $accent-color;
    }
  }
}

.tooltip {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%) translateY(0);
  background: #333;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;

  &:after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    transform: translateX(-50%);
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid #333;
  }
}
</style>
