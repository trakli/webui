<template>
  <svg
    class="ld"
    :viewBox="`0 0 ${W} ${H}`"
    width="100%"
    role="img"
    :aria-label="label"
    data-testid="ledger-daily-chart"
  >
    <g v-for="bar in bars" :key="bar.i">
      <title>{{ bar.title }}</title>
      <rect
        v-if="bar.type === 'future'"
        :x="bar.x"
        :y="H - P.b - 4"
        :width="bar.w"
        height="4"
        rx="1"
        class="ld-future"
      />
      <rect
        v-else-if="bar.type === 'none'"
        :x="bar.x + bar.w / 2 - 3"
        :y="H - P.b - 6"
        width="6"
        height="6"
        rx="1"
        class="ld-none"
      />
      <template v-else>
        <rect
          :x="bar.x"
          :y="y(bar.value)"
          :width="bar.w"
          :height="H - P.b - y(bar.value)"
          rx="1"
          :class="bar.type === 'today' ? 'ld-today' : 'ld-spent'"
        />
        <template v-if="bar.value > cap">
          <line
            :x1="bar.x - 1"
            :x2="bar.x + bar.w + 1"
            :y1="y(bar.value) + 9"
            :y2="y(bar.value) + 5"
            class="ld-break"
          />
          <text v-if="bar.capLabel" :x="bar.x + bar.w / 2" :y="P.t - 3" text-anchor="middle">
            {{ format(bar.value) }}
          </text>
        </template>
      </template>
      <text v-if="bar.tick" :x="bar.x + bar.w / 2" :y="H - 4" text-anchor="middle">
        {{ bar.tick }}
      </text>
    </g>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { addDays, type LedgerPeriod } from '@/utils/ledgerOverview';

const props = defineProps<{
  daily: number[];
  elapsed: number;
  start: Date;
  period: LedgerPeriod;
  locale: string;
  label: string;
  format: (value: number) => string;
}>();

const W = 640;
const H = 130;
const P = { l: 6, r: 6, t: 14, b: 18 };

// A rent or tuition day would flatten every other bar, so bars above the cap
// are clipped with a break mark and their value printed above them.
const cap = computed(() => {
  const spent = props.daily
    .slice(0, props.elapsed)
    .filter((v) => v > 0)
    .sort((a, b) => a - b);
  if (!spent.length) return 1;
  const p90 = spent[Math.min(spent.length - 1, Math.floor(spent.length * 0.9))];
  const top = spent[spent.length - 1];
  return top > p90 * 2.5 ? p90 * 1.4 : top;
});

const y = (v: number) => H - P.b - (Math.min(v, cap.value) / cap.value) * (H - P.t - P.b);

const bars = computed(() => {
  const n = props.daily.length;
  const step = (W - P.l - P.r) / Math.max(1, n);
  const gap = step > 8 ? 2 : step > 3 ? 0.5 : 0;
  const dayFmt = new Intl.DateTimeFormat(props.locale, { month: 'short', day: 'numeric' });
  const monthFmt = new Intl.DateTimeFormat(props.locale, { month: 'short' });
  const list = props.daily.map((value, i) => {
    const date = addDays(props.start, i);
    const type =
      i >= props.elapsed
        ? 'future'
        : i === props.elapsed - 1
          ? 'today'
          : value > 0
            ? 'spent'
            : 'none';
    const tick =
      props.period === 'month'
        ? i % 7 === 0
          ? String(date.getDate())
          : ''
        : date.getDate() === 1
          ? monthFmt.format(date)
          : '';
    return {
      i,
      value,
      type,
      tick,
      x: P.l + i * step + gap,
      w: Math.max(0.6, step - gap * 2),
      title: `${dayFmt.format(date)}: ${props.format(value)}`,
      capLabel: false
    };
  });
  const LABEL_SPACE = 52;
  let lastLabel = -Infinity;
  for (const bar of [...list].sort((a, b) => b.value - a.value)) {
    if (bar.value <= cap.value) break;
    if (Math.abs(bar.x - lastLabel) >= LABEL_SPACE || lastLabel === -Infinity) {
      bar.capLabel = true;
      lastLabel = bar.x;
    }
  }
  return list;
});
</script>

<style scoped>
.ld text {
  font-family: var(--ledger-mono);
  font-size: 10.5px;
  fill: var(--ledger-ink-3);
}

.ld-spent {
  fill: var(--ledger-brand);
}

.ld-today {
  fill: var(--ledger-orange);
}

.ld-none {
  fill: var(--ledger-brand-text);
}

.ld-future {
  fill: var(--ledger-surface-3);
}

.ld-break {
  stroke: var(--ledger-surface);
  stroke-width: 2;
}
</style>
