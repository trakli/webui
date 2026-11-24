<template>
  <svg
    class="lc"
    :viewBox="`0 0 ${W} ${H}`"
    width="100%"
    role="img"
    :aria-label="label"
    data-testid="ledger-spend-chart"
  >
    <g v-for="tick in yTicks" :key="`y${tick}`">
      <line :x1="P.l" :x2="W - P.r" :y1="y(tick)" :y2="y(tick)" class="lc-grid" />
      <text :x="P.l - 6" :y="y(tick) + 3" text-anchor="end">{{ tickLabel(tick) }}</text>
    </g>
    <text v-for="tick in xTicks" :key="`x${tick.i}`" :x="x(tick.i)" :y="H - 6" text-anchor="middle">
      {{ tick.label }}
    </text>
    <path v-if="current.length > 1" :d="area" class="lc-area" />
    <path v-if="previous.length > 1" :d="line(previous.slice(0, totalDays))" class="lc-prev" />
    <path v-if="current.length > 1" :d="line(current)" class="lc-now" />
    <template v-if="current.length">
      <circle :cx="x(last)" :cy="y(current[last])" r="4" class="lc-dot" />
      <text
        :x="x(last) + (last > totalDays * 0.8 ? -8 : 8)"
        :y="y(current[last]) - 8"
        :text-anchor="last > totalDays * 0.8 ? 'end' : 'start'"
        class="lc-value"
      >
        {{ format(current[last]) }}
      </text>
    </template>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { addDays, type LedgerPeriod } from '@/utils/ledgerOverview';

const props = defineProps<{
  current: number[];
  previous: number[];
  totalDays: number;
  start: Date;
  period: LedgerPeriod;
  locale: string;
  label: string;
  format: (value: number) => string;
  tickFormat: (value: number) => string;
}>();

const W = 640;
const H = 200;
const P = { l: 52, r: 12, t: 12, b: 22 };

const niceMax = (value: number) => {
  if (value <= 0) return 100;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * magnitude >= value / 4) ?? 10;
  return Math.ceil(value / (step * magnitude)) * step * magnitude;
};

const max = computed(() =>
  niceMax(Math.max(0, ...props.current, ...props.previous.slice(0, props.totalDays)))
);

const x = (i: number) => P.l + (i * (W - P.l - P.r)) / Math.max(1, props.totalDays - 1);
const y = (v: number) => H - P.b - (v / max.value) * (H - P.t - P.b);

const yTicks = computed(() => [0, 1, 2, 3, 4].map((k) => (max.value * k) / 4));
const tickLabel = (value: number) => (value ? props.tickFormat(value) : '0');

const xTicks = computed(() => {
  const ticks: { i: number; label: string }[] = [];
  const monthDay = new Intl.DateTimeFormat(props.locale, { month: 'short', day: 'numeric' });
  const month = new Intl.DateTimeFormat(props.locale, { month: 'short' });
  for (let i = 0; i < props.totalDays; i += 1) {
    const date = addDays(props.start, i);
    if (props.period === 'month' && i % 7 === 0) ticks.push({ i, label: monthDay.format(date) });
    if (props.period !== 'month' && date.getDate() === 1) ticks.push({ i, label: month.format(date) });
  }
  return ticks;
});

const line = (values: number[]) =>
  values.map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join('');

const last = computed(() => props.current.length - 1);

const area = computed(
  () => `${line(props.current)}L${x(last.value).toFixed(1)},${y(0)}L${x(0)},${y(0)}Z`
);
</script>

<style scoped>
.lc text {
  font-family: var(--ledger-mono);
  font-size: 10.5px;
  fill: var(--ledger-ink-3);
}

.lc-grid {
  stroke: var(--ledger-line);
}

.lc-area {
  fill: var(--ledger-brand);
  opacity: 0.1;
}

.lc-prev {
  fill: none;
  stroke: var(--ledger-ink-3);
  stroke-width: 1.5;
  stroke-dasharray: 4 4;
}

.lc-now {
  fill: none;
  stroke: var(--ledger-brand-text);
  stroke-width: 2.2;
}

.lc-dot {
  fill: var(--ledger-brand-text);
}

.lc text.lc-value {
  fill: var(--ledger-ink);
  font-weight: 600;
}
</style>
