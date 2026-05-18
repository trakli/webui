<template>
  <div ref="containerRef" class="chart">
    <svg
      ref="svgRef"
      :viewBox="`0 0 ${width} ${height}`"
      preserveAspectRatio="none"
      class="svg"
      @mousemove="onMove"
      @mouseleave="onLeave"
    >
      <template v-for="(tick, i) in yTicks" :key="`y-${i}`">
        <line
          :x1="padL"
          :x2="width - padR"
          :y1="yScale(tick)"
          :y2="yScale(tick)"
          class="grid"
          stroke-dasharray="3 4"
        />
        <text :x="padL - 6" :y="yScale(tick) + 4" text-anchor="end" class="axis">
          {{ shortNum(tick) }}
        </text>
      </template>

      <template v-for="(b, i) in bars" :key="`bar-${i}`">
        <rect
          :x="b.x"
          :y="b.y"
          :width="b.w"
          :height="b.h"
          rx="2"
          :class="['bar', { 'bar--hover': hover === i, 'bar--zero': b.value === 0 }]"
        />
      </template>

      <template v-for="(label, i) in xLabels" :key="`xl-${i}`">
        <text :x="label.x" :y="height - padB + 14" text-anchor="middle" class="axis">
          {{ label.text }}
        </text>
      </template>
    </svg>

    <div v-if="hover >= 0 && data[hover]" class="tooltip" :style="tooltipStyle">
      <p class="tooltip-title">{{ formatLong(data[hover].date) }}</p>
      <p class="tooltip-val">{{ formatter(data[hover].expense, currency) }}</p>
      <p v-if="data[hover].txCount" class="tooltip-meta">
        {{ data[hover].txCount }} {{ t('transactions') }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const { t, locale } = useI18n();

const props = defineProps({
  data: { type: Array, required: true }, // [{ date, expense, txCount }]
  currency: { type: String, default: 'USD' },
  formatter: { type: Function, default: (n) => `${Math.round(n)}` }
});

const width = 760;
const height = 240;
const padL = 56;
const padR = 16;
const padT = 16;
const padB = 28;

const svgRef = ref(null);
const containerRef = ref(null);
const hover = ref(-1);
const tooltipStyle = ref({});

const maxVal = computed(() => Math.max(1, ...props.data.map((d) => d.expense)));
const niceStep = (max) => {
  const raw = max / 4;
  const pow10 = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / pow10;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow10;
};
const step = computed(() => niceStep(maxVal.value));
const yMax = computed(() => Math.ceil(maxVal.value / step.value) * step.value);
const yTicks = computed(() => Array.from({ length: 5 }, (_, i) => i * step.value));

const usableW = computed(() => width - padL - padR);
const gap = 2;
const barW = computed(() => Math.max(2, usableW.value / Math.max(1, props.data.length) - gap));
const yScale = (v) => padT + (height - padT - padB) * (1 - v / yMax.value);

const bars = computed(() =>
  props.data.map((d, i) => {
    const x = padL + i * (barW.value + gap);
    const y = yScale(d.expense);
    return {
      x,
      y,
      w: barW.value,
      h: Math.max(d.expense === 0 ? 1 : 2, height - padB - y),
      value: d.expense
    };
  })
);

// Sparse x labels - first, middle, last
const xLabels = computed(() => {
  if (!props.data.length) return [];
  const idxs = [0, Math.floor(props.data.length / 2), props.data.length - 1].filter(
    (v, i, arr) => arr.indexOf(v) === i
  );
  return idxs.map((i) => ({
    x: padL + i * (barW.value + gap) + barW.value / 2,
    text: shortDate(props.data[i].date)
  }));
});

const shortNum = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return `${Math.round(n)}`;
};

const shortDate = (iso) =>
  new Intl.DateTimeFormat(locale.value, { month: 'short', day: 'numeric' }).format(
    new Date(iso + 'T00:00:00')
  );

const formatLong = (iso) =>
  new Intl.DateTimeFormat(locale.value, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(new Date(iso + 'T00:00:00'));

const onMove = (e) => {
  if (!svgRef.value) return;
  const rect = svgRef.value.getBoundingClientRect();
  const xView = (e.clientX - rect.left) * (width / rect.width);
  const idx = Math.floor((xView - padL) / (barW.value + gap));
  hover.value = Math.max(0, Math.min(props.data.length - 1, idx));

  const wrapRect = containerRef.value.getBoundingClientRect();
  const left = e.clientX - wrapRect.left + 12;
  const top = e.clientY - wrapRect.top - 56;
  tooltipStyle.value = {
    left: `${Math.max(8, Math.min(wrapRect.width - 200, left))}px`,
    top: `${Math.max(8, top)}px`
  };
};

const onLeave = () => {
  hover.value = -1;
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.chart {
  position: relative;
  width: 100%;
  height: 240px;
}

.svg {
  width: 100%;
  height: 100%;
  display: block;
}

.grid {
  stroke: $chart-grid;
}
.axis {
  fill: $text-muted;
  font-size: 10px;
  font-family: $font-family-sans;
}

.bar {
  fill: rgba(var(--color-expense-rgb), 0.7);
  transition: fill $duration-fast $easing-standard;

  &--hover {
    fill: var(--color-expense);
  }
  &--zero {
    fill: $border-color;
  }
}

.tooltip {
  position: absolute;
  min-width: 160px;
  background: $bg-white;
  border: 1px solid $border-color;
  border-radius: 10px;
  box-shadow: $elevation-3;
  padding: $spacing-2 $spacing-3;
  pointer-events: none;
  font-size: $font-size-xs;

  p {
    margin: 0;
  }
}

.tooltip-title {
  font-weight: $font-semibold;
  color: $text-muted;
}
.tooltip-val {
  font-weight: $font-bold;
  color: var(--color-expense);
  font-variant-numeric: tabular-nums;
  font-size: $font-size-sm;
}
.tooltip-meta {
  color: $text-muted;
}
</style>
