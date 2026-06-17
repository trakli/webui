<template>
  <!-- New agent path: an ordered stream of widget blocks. -->
  <div v-if="blocks.length" class="blocks-container">
    <template v-for="(block, i) in blocks" :key="i">
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
import ChatImportReviewBlock from '@/components/ai/blocks/ChatImportReviewBlock.vue';
import ChatCanvasBlock from '@/components/ai/blocks/ChatCanvasBlock.vue';

const props = defineProps<{
  result: ChatMessageResult | null;
  sessionId?: number;
}>();

defineEmits<{ (e: 'changed'): void; (e: 'open-canvas', block: ChatBlock): void }>();

const blocks = computed<ChatBlock[]>(() => props.result?.blocks ?? []);
const sessionId = computed(() => props.sessionId ?? 0);

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
