<template>
  <button type="button" class="canvas-card" @click="$emit('open')">
    <span class="canvas-icon"><FileText :size="20" /></span>
    <span class="canvas-text">
      <span class="canvas-title">{{ block.title || t('Document') }}</span>
      <span class="canvas-meta"
        >{{ t('{count} sections', { count: sectionCount }) }} · {{ t('Open in canvas') }}</span
      >
    </span>
    <PanelRight :size="18" class="canvas-open" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { FileText, PanelRight } from 'lucide-vue-next';
import type { ChatBlock } from '@/services/api/aiApi';

const props = defineProps<{ block: ChatBlock & { title?: string; blocks?: ChatBlock[] } }>();
defineEmits<{ (e: 'open'): void }>();

const { t } = useI18n();

const sectionCount = computed(() => props.block.blocks?.length ?? 0);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.canvas-card {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  width: 100%;
  text-align: left;
  padding: $spacing-3;
  border: 1px solid $primary-muted;
  border-radius: $radius-lg;
  background: $bg-white;
  cursor: pointer;
  transition: $transition-base;

  &:hover {
    border-color: $primary;
    background: $primary-light;
  }

  .canvas-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: $radius-lg;
    background: $primary-light;
    color: $primary;
    flex-shrink: 0;
  }

  .canvas-text {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .canvas-title {
    font-weight: $font-semibold;
    color: $text-primary;
  }

  .canvas-meta {
    font-size: $font-size-xs;
    color: $text-muted;
  }

  .canvas-open {
    color: $primary;
    flex-shrink: 0;
  }
}
</style>
