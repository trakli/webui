<template>
  <div class="chat-timeline-block">
    <p v-if="title" class="block-title">{{ title }}</p>
    <ol class="timeline">
      <li v-for="(item, i) in items" :key="i" class="timeline-item">
        <span class="timeline-dot" aria-hidden="true" />
        <div class="timeline-content">
          <div class="timeline-head">
            <span class="timeline-item-title">{{ item.title }}</span>
            <span v-if="formatAmount(item)" class="timeline-amount">{{ formatAmount(item) }}</span>
          </div>
          <span v-if="item.date" class="timeline-date">{{ formatDate(item.date) }}</span>
          <p v-if="item.description" class="timeline-desc">{{ item.description }}</p>
        </div>
      </li>
    </ol>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface TimelineItem {
  date?: string;
  title?: string;
  description?: string;
  amount?: number | string;
  currency?: string | null;
}

const props = defineProps<{ title?: string; items?: TimelineItem[] }>();

const items = computed<TimelineItem[]>(() => props.items ?? []);

const formatAmount = (item: TimelineItem): string => {
  if (item.amount === undefined || item.amount === null || item.amount === '') return '';
  const num =
    typeof item.amount === 'number'
      ? item.amount.toLocaleString(undefined, { maximumFractionDigits: 2 })
      : String(item.amount);
  return item.currency ? `${num} ${item.currency}` : num;
};

const formatDate = (iso: string): string => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.block-title {
  font-weight: $font-semibold;
  margin-bottom: $spacing-2;
  font-size: $font-size-sm;
}

.timeline {
  list-style: none;
  margin: 0;
  padding: 0;
}

.timeline-item {
  position: relative;
  padding: 0 0 $spacing-3 $spacing-4;
  border-left: 2px solid $primary-muted;

  &:last-child {
    border-left-color: transparent;
    padding-bottom: 0;
  }
}

.timeline-dot {
  position: absolute;
  left: -5px;
  top: 2px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: $primary;
}

.timeline-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.timeline-head {
  display: flex;
  justify-content: space-between;
  gap: $spacing-2;
}

.timeline-item-title {
  font-weight: $font-semibold;
  font-size: $font-size-sm;
}

.timeline-amount {
  font-weight: $font-bold;
  font-size: $font-size-sm;
  white-space: nowrap;
}

.timeline-date {
  font-size: $font-size-xs;
  color: $text-muted;
}

.timeline-desc {
  margin: 0;
  font-size: $font-size-sm;
  color: $text-secondary;
}
</style>
