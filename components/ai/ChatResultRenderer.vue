<template>
  <!-- New agent path: an ordered stream of widget blocks. -->
  <div v-if="blocks.length" class="blocks-container">
    <template v-for="(block, i) in blocks" :key="blockKey(block, i)">
      <ChatMarkdownBlock v-if="block.type === 'markdown'" :text="block.text as string" />
      <ChatTableBlock
        v-else-if="block.type === 'table'"
        :title="block.title as string"
        :columns="block.columns as string[]"
        :rows="block.rows as Record<string, unknown>[]"
      />
      <ChatKpiBlock
        v-else-if="block.type === 'kpi'"
        :title="block.title as string"
        :items="block.items as any[]"
      />
      <ChatChartBlock
        v-else-if="block.type === 'chart'"
        :title="block.title as string"
        :chart_hint="block.chart_hint as string"
        :dataset_ref="block.dataset_ref as string"
        :data="block.data"
      />
      <ChatProposedActionBlock
        v-else-if="block.type === 'proposed_action'"
        :block="block as any"
        :session-id="sessionId"
        @changed="$emit('changed')"
      />
      <ChatProposedActionBatchBlock
        v-else-if="block.type === 'proposed_action_batch'"
        :block="block as any"
        :session-id="sessionId"
        @changed="$emit('changed')"
      />
      <ChatComparisonBlock
        v-else-if="block.type === 'comparison'"
        :title="block.title as string"
        :series="block.series as Record<string, unknown>[]"
      />
      <ChatListBlock
        v-else-if="block.type === 'list'"
        :title="block.title as string"
        :items="block.items as Record<string, unknown>[]"
        :variant="block.variant as string"
      />
      <ChatCalloutBlock
        v-else-if="block.type === 'callout'"
        :text="block.text as string"
        :title="block.title as string"
        :variant="block.variant as string"
      />
      <ChatTimelineBlock
        v-else-if="block.type === 'timeline'"
        :title="block.title as string"
        :items="block.items as any[]"
      />
      <ChatProgressBlock
        v-else-if="block.type === 'progress'"
        :title="block.title as string"
        :items="block.items as any[]"
      />
      <ChatQuestionBlock
        v-else-if="block.type === 'question'"
        :prompt="block.prompt as string"
        :options="block.options as any[]"
        @select="$emit('send-message', $event)"
      />
      <ChatQuickActionsBlock
        v-else-if="block.type === 'quick_actions'"
        :actions="block.actions as any[]"
        @select="$emit('send-message', $event)"
      />
      <ChatImportReviewBlock v-else-if="block.type === 'import_review'" :block="block as any" />
      <ChatCanvasBlock
        v-else-if="block.type === 'canvas'"
        :block="block as any"
        @open="$emit('open-canvas', block)"
      />
      <!-- Unknown/newer block type: degrade to its text or a compact dump. -->
      <ChatMarkdownBlock v-else :text="(block.text as string) || (block.summary as string) || ''" />
    </template>
  </div>

  <!-- Legacy SmartQL path: a single format_type result. -->
  <div v-else-if="result?.rows?.length && result.format_type" class="results-container">
    <div v-if="result.format_type === 'scalar' && result.rows?.[0]" class="result-scalar">
      {{ formatValue(Object.values(result.rows[0])[0]) }}
    </div>

    <div v-else-if="result.format_type === 'pair' && result.rows?.[0]" class="result-pair">
      <span class="pair-label">{{ Object.keys(result.rows[0])[0] }}:</span>
      <span class="pair-value">{{ formatValue(Object.values(result.rows[0])[1]) }}</span>
    </div>

    <div v-else-if="result.format_type === 'record' && result.rows?.[0]" class="result-record">
      <div v-for="(value, key) in result.rows[0]" :key="key" class="record-row">
        <span class="record-key">{{ formatKey(key) }}:</span>
        <span class="record-value">{{ formatValue(value) }}</span>
      </div>
    </div>

    <ul v-else-if="result.format_type === 'list'" class="result-list">
      <li v-for="(row, i) in result.rows" :key="i">
        {{ formatValue(Object.values(row)[0]) }}
      </li>
    </ul>

    <div v-else-if="result.format_type === 'pair_list'" class="result-pair-list">
      <div v-for="(row, i) in result.rows" :key="i" class="pair-row">
        <span class="pair-label">{{ Object.values(row)[0] }}:</span>
        <span class="pair-value">{{ formatValue(Object.values(row)[1]) }}</span>
      </div>
    </div>

    <div
      v-else-if="result.format_type === 'table' && result.rows?.[0]"
      class="result-table-wrapper"
    >
      <table class="result-table">
        <thead>
          <tr>
            <th v-for="key in Object.keys(result.rows[0])" :key="key">
              {{ formatKey(key) }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, i) in result.rows" :key="i">
            <td v-for="(value, key) in row" :key="key">
              {{ formatValue(value) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <pre v-else class="result-raw">{{ JSON.stringify(result.rows, null, 2) }}</pre>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ChatBlock, ChatMessageResult } from '@/services/api/aiApi';
import ChatMarkdownBlock from '@/components/ai/blocks/ChatMarkdownBlock.vue';
import ChatTableBlock from '@/components/ai/blocks/ChatTableBlock.vue';
import ChatKpiBlock from '@/components/ai/blocks/ChatKpiBlock.vue';
import ChatChartBlock from '@/components/ai/blocks/ChatChartBlock.vue';
import ChatProposedActionBlock from '@/components/ai/blocks/ChatProposedActionBlock.vue';
import ChatProposedActionBatchBlock from '@/components/ai/blocks/ChatProposedActionBatchBlock.vue';
import ChatImportReviewBlock from '@/components/ai/blocks/ChatImportReviewBlock.vue';
import ChatCanvasBlock from '@/components/ai/blocks/ChatCanvasBlock.vue';
import ChatComparisonBlock from '@/components/ai/blocks/ChatComparisonBlock.vue';
import ChatListBlock from '@/components/ai/blocks/ChatListBlock.vue';
import ChatCalloutBlock from '@/components/ai/blocks/ChatCalloutBlock.vue';
import ChatTimelineBlock from '@/components/ai/blocks/ChatTimelineBlock.vue';
import ChatProgressBlock from '@/components/ai/blocks/ChatProgressBlock.vue';
import ChatQuestionBlock from '@/components/ai/blocks/ChatQuestionBlock.vue';
import ChatQuickActionsBlock from '@/components/ai/blocks/ChatQuickActionsBlock.vue';

const props = defineProps<{
  result: ChatMessageResult | null;
  sessionId?: number;
}>();

defineEmits<{
  (e: 'changed'): void;
  (e: 'open-canvas', block: ChatBlock): void;
  (e: 'send-message', message: string): void;
}>();

const blocks = computed<ChatBlock[]>(() => props.result?.blocks ?? []);
const sessionId = computed(() => props.sessionId ?? 0);

/**
 * Key an action card by its own identity, not its position: a reload that
 * reorders blocks would otherwise hand a card the wrong reactive state.
 */
const blockKey = (block: ChatBlock, index: number): string => {
  if (block.type === 'proposed_action' && block.id) return `action-${block.id}`;
  if (block.type === 'proposed_action_batch' && block.batch) return `batch-${block.batch}`;
  return `${block.type}-${index}`;
};

const formatKey = (key: string | number): string =>
  String(key)
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'number') {
    return Number.isInteger(value)
      ? value.toString()
      : value.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        });
  }
  return String(value);
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.blocks-container {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.results-container {
  margin-top: $spacing-2;
  padding-top: $spacing-2;
  border-top: 1px solid $primary-border;
}

.result-scalar {
  font-size: $font-size-2xl;
  font-weight: $font-bold;
  color: $primary;
}

.result-pair,
.pair-row {
  display: flex;
  gap: $spacing-2;
  padding: $spacing-1 0;

  .pair-label {
    font-weight: $font-semibold;
    color: $text-secondary;
  }

  .pair-value {
    font-weight: $font-bold;
  }
}

.result-record {
  .record-row {
    display: flex;
    gap: $spacing-2;
    padding: $spacing-1 0;
    border-bottom: 1px solid $primary-muted;

    &:last-child {
      border-bottom: none;
    }

    .record-key {
      font-weight: $font-semibold;
      color: $text-secondary;
      min-width: 100px;
    }
  }
}

.result-list {
  margin: 0;
  padding-left: $spacing-4;

  li {
    padding: $spacing-1 0;
  }
}

.result-pair-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-1;
}

.result-table-wrapper {
  overflow-x: auto;
  margin-top: $spacing-1;
}

.result-table {
  width: 100%;
  border-collapse: collapse;
  font-size: $font-size-sm;

  th,
  td {
    padding: $spacing-1 $spacing-2;
    text-align: left;
    border-bottom: 1px solid $primary-muted;
  }

  th {
    font-weight: $font-semibold;
    background: $primary-light;
  }

  tr:last-child td {
    border-bottom: none;
  }
}

.result-raw {
  background: $bg-gray;
  padding: $spacing-2;
  border-radius: $radius-md;
  overflow-x: auto;
  font-size: $font-size-sm;
  margin: 0;
}
</style>
