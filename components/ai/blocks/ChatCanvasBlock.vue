<template>
  <div
    class="canvas-card"
    role="button"
    tabindex="0"
    @click="$emit('open')"
    @keydown.enter="$emit('open')"
  >
    <div class="canvas-head">
      <span class="canvas-icon"><FileText :size="20" /></span>
      <span class="canvas-text">
        <span class="canvas-title">{{ block.title || t('Document') }}</span>
        <span class="canvas-meta">{{ t('{count} sections', { count: sectionCount }) }}</span>
      </span>
      <PanelRight :size="18" class="canvas-open" />
    </div>

    <!-- Inline preview of the first sections so the report is visible in chat,
         not just a card. Non-interactive: any click opens the full canvas. -->
    <div v-if="previewBlocks.length" class="canvas-preview">
      <template v-for="(b, i) in previewBlocks" :key="i">
        <ChatMarkdownBlock v-if="b.type === 'markdown'" :text="b.text as string" />
        <ChatCalloutBlock
          v-else-if="b.type === 'callout'"
          :text="b.text as string"
          :title="b.title as string"
          :variant="b.variant as string"
        />
        <ChatKpiBlock
          v-else-if="b.type === 'kpi'"
          :title="b.title as string"
          :items="b.items as any[]"
        />
        <ChatChartBlock
          v-else-if="b.type === 'chart'"
          :title="b.title as string"
          :chart_hint="b.chart_hint as string"
          :dataset_ref="b.dataset_ref as string"
          :data="b.data"
        />
        <ChatTableBlock
          v-else-if="b.type === 'table'"
          :title="b.title as string"
          :columns="b.columns as string[]"
          :rows="b.rows as Record<string, unknown>[]"
        />
      </template>
      <div class="canvas-fade" aria-hidden="true" />
    </div>

    <span class="canvas-cta">{{ t('Open in canvas') }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { FileText, PanelRight } from 'lucide-vue-next';
import type { ChatBlock } from '@/services/api/aiApi';
import ChatMarkdownBlock from '@/components/ai/blocks/ChatMarkdownBlock.vue';
import ChatCalloutBlock from '@/components/ai/blocks/ChatCalloutBlock.vue';
import ChatKpiBlock from '@/components/ai/blocks/ChatKpiBlock.vue';
import ChatChartBlock from '@/components/ai/blocks/ChatChartBlock.vue';
import ChatTableBlock from '@/components/ai/blocks/ChatTableBlock.vue';

const props = defineProps<{ block: ChatBlock & { title?: string; blocks?: ChatBlock[] } }>();
defineEmits<{ (e: 'open'): void }>();

const { t } = useI18n();

const PREVIEWABLE = ['markdown', 'callout', 'kpi', 'chart', 'table'];

const sectionCount = computed(() => props.block.blocks?.length ?? 0);

// Show the first couple of renderable sections as a teaser.
const previewBlocks = computed<ChatBlock[]>(() =>
  (props.block.blocks ?? []).filter((b) => PREVIEWABLE.includes(b.type as string)).slice(0, 2)
);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.canvas-card {
  display: flex;
  flex-direction: column;
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
  }
}

.canvas-head {
  display: flex;
  align-items: center;
  gap: $spacing-3;
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

.canvas-preview {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
  max-height: 280px;
  overflow: hidden;
  pointer-events: none;
  border-top: 1px solid $primary-muted;
  padding-top: $spacing-3;
}

.canvas-fade {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 56px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0), $bg-white);
}

.canvas-cta {
  align-self: flex-start;
  font-size: $font-size-sm;
  font-weight: $font-semibold;
  color: $primary;
}
</style>
