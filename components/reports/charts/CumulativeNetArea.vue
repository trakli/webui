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
      <defs>
        <linearGradient id="net-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="var(--color-primary)" stop-opacity="0.28" />
          <stop offset="100%" stop-color="var(--color-primary)" stop-opacity="0" />
        </linearGradient>
      </defs>

      <line :x1="padL" :x2="width - padR" :y1="zeroY" :y2="zeroY" class="zero-line" />

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

      <template v-for="(p, i) in points" :key="`x-${i}`">
        <text
          v-if="i === 0 || i === points.length - 1 || i === Math.floor(points.length / 2)"
          :x="p.x"
          :y="height - padB + 16"
          text-anchor="middle"
          class="axis"
        >
          {{ data[i].label }}
        </text>
      </template>

      <path :d="areaPath" fill="url(#net-area)" />
      <path :d="linePath" class="line" stroke-width="2.4" />

      <line
        v-if="hover >= 0"
        :x1="points[hover].x"
        :x2="points[hover].x"
        :y1="padT"
        :y2="height - padB"
        class="hover-line"
        stroke-dasharray="2 4"
      />
      <circle v-if="hover >= 0" :cx="points[hover].x" :cy="points[hover].y" r="4" class="dot" />
    </svg>

    <div v-if="hover >= 0 && data[hover]" class="tooltip" :style="tooltipStyle">
      <p class="tooltip-title">{{ data[hover].label }}</p>
      <p class="tooltip-val">{{ formatter(data[hover].cumulative, currency) }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  data: { type: Array, required: true }, // [{ label, cumulative }]
  currency: { type: String, default: 'USD' },
  formatter: { type: Function, default: (n) => `${Math.round(n)}` }
});

const width = 760;
const height = 240;
const padL = 56;
const padR = 16;
const padT = 16;
const padB = 32;

const svgRef = ref(null);
const containerRef = ref(null);
const hover = ref(-1);
const tooltipStyle = ref({});

const maxAbs = computed(() => Math.max(1, ...props.data.map((d) => Math.abs(d.cumulative))));
const niceStep = (max) => {
  const raw = max / 4;
  const pow10 = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / pow10;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow10;
};
const step = computed(() => niceStep(maxAbs.value));
const yMax = computed(() => Math.ceil(maxAbs.value / step.value) * step.value);
const yTicks = computed(() => Array.from({ length: 5 }, (_, i) => i * step.value));

const xStep = computed(() => (width - padL - padR) / Math.max(props.data.length - 1, 1));
const yScale = (v) => padT + (height - padT - padB) * (1 - v / yMax.value);
const zeroY = computed(() => yScale(0));

const points = computed(() =>
  props.data.map((d, i) => ({
    x: padL + i * xStep.value,
    y: yScale(Math.max(0, d.cumulative))
  }))
);

const linePath = computed(() => {
  const pts = points.value;
  if (!pts.length) return '';
  return pts.reduce((d, p, i) => (i === 0 ? `M ${p.x},${p.y}` : `${d} L ${p.x},${p.y}`), '');
});

const areaPath = computed(() => {
  const pts = points.value;
  if (pts.length < 2) return '';
  const line = pts.reduce((d, p, i) => (i === 0 ? `M ${p.x},${p.y}` : `${d} L ${p.x},${p.y}`), '');
  return `${line} L ${pts[pts.length - 1].x},${zeroY.value} L ${pts[0].x},${zeroY.value} Z`;
});

const shortNum = (n) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return `${Math.round(n)}`;
};

const onMove = (e) => {
  if (!svgRef.value) return;
  const rect = svgRef.value.getBoundingClientRect();
  const xView = (e.clientX - rect.left) * (width / rect.width);
  const idx = Math.round((xView - padL) / xStep.value);
  hover.value = Math.max(0, Math.min(points.value.length - 1, idx));

  const wrapRect = containerRef.value.getBoundingClientRect();
  const left = e.clientX - wrapRect.left + 12;
  const top = e.clientY - wrapRect.top - 56;
  tooltipStyle.value = {
    left: `${Math.max(8, Math.min(wrapRect.width - 180, left))}px`,
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
.zero-line {
  stroke: $border-color;
  stroke-width: 1;
}
.hover-line {
  stroke: $text-muted;
  opacity: 0.6;
}
.axis {
  fill: $text-muted;
  font-size: 10px;
  font-family: $font-family-sans;
}
.line {
  fill: none;
  stroke: var(--color-primary);
  stroke-linecap: round;
}
.dot {
  fill: var(--color-primary);
  stroke: var(--color-bg-white);
  stroke-width: 1.5;
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
  color: $text-primary;
  font-variant-numeric: tabular-nums;
  font-size: $font-size-sm;
}
</style>
