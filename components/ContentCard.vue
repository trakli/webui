<template>
  <div class="entity-card">
    <div class="entity-icon-name" :class="{ 'no-icon': !icon }">
      <component :is="resolvedIcon" v-if="icon" class="entity-icon" />
      <span class="name">{{ name }}</span>
    </div>
    <div class="entity-description">
      {{ description }}
      <div
        v-if="type && pageName === 'Category'"
        class="category-type-badge"
        :class="`type-${type}`"
      >
        {{ type === 'income' ? 'Income' : 'Expense' }}
      </div>
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
import { computed } from 'vue';
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
  },
  type: {
    type: String,
    default: null
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
@use 'sass:color';

.entity-card {
  display: grid;
  grid-template-columns: 1.8fr 2.5fr auto;
  align-items: start;
  padding: $spacing-4;
  border-bottom: 1px solid $border-light;
  gap: $spacing-4;
  background: $bg-gray;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  cursor: pointer;
  min-height: 60px;

  @media (max-width: $breakpoint-md) {
    grid-template-columns: 1.6fr 2.2fr auto;
    padding: $spacing-3;
    gap: $spacing-3;
  }

  @media (max-width: $breakpoint-sm) {
    grid-template-columns: 1.5fr 2fr auto;
    padding: $spacing-2;
    gap: $spacing-2;
    min-height: 50px;
  }

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

  @media (max-width: $breakpoint-sm) {
    width: 20px;
    height: 20px;
  }
}

.entity-icon-name {
  display: flex;
  align-items: flex-start;
  gap: $spacing-2;
  padding: 0;
  min-width: 0;

  .name {
    font-weight: 600;
    color: $primary;
    white-space: normal;
    word-wrap: break-word;
    overflow-wrap: break-word;
    hyphens: auto;
    font-size: 0.95rem;
    flex: 1;
    min-width: 0;
    line-height: 1.3;

    @media (max-width: $breakpoint-sm) {
      font-size: 0.875rem;
      line-height: 1.2;
    }
  }

  &.no-icon {
    padding-left: calc(24px + #{$spacing-2});

    @media (max-width: $breakpoint-sm) {
      padding-left: calc(20px + #{$spacing-2});
    }
  }
}

.entity-description {
  color: $primary;
  font-size: 0.95rem;
  padding: 0;
  line-height: 1.4;
  word-wrap: break-word;
  overflow-wrap: break-word;
  hyphens: auto;
  white-space: normal;
  min-width: 0;

  @media (max-width: $breakpoint-sm) {
    font-size: 0.875rem;
    line-height: 1.3;
  }
}

.entity-actions {
  display: flex;
  gap: $spacing-2;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
  transition: opacity 0.2s ease;
  min-width: 80px;

  @media (max-width: $breakpoint-md) {
    min-width: 70px;
    gap: $spacing-1;
  }

  @media (max-width: $breakpoint-sm) {
    gap: $spacing-1;
    min-width: 65px;
  }

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
    background: color.adjust($error-color, $lightness: 45%);
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
