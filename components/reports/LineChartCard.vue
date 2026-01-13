<template>
  <div class="card">
    <h2 class="title">{{ t('Income Trend Line (Last 6 Months)') }}</h2>
    <div ref="containerRef" class="chart-container">
      <svg
        ref="svgRef"
        :viewBox="`0 0 ${width} ${height}`"
        preserveAspectRatio="none"
        class="chart"
        @mousemove="onMouseMove"
        @mouseleave="onMouseLeave"
      >
        <defs>
          <filter id="markerShadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx="0"
              dy="1"
              stdDeviation="1"
              flood-color="#93c5fd"
              flood-opacity="0.6"
            />
          </filter>
        </defs>
        <g>
          <template v-for="(tick, i) in yTicks" :key="`y-${i}`">
            <line
              :x1="paddingLeft"
              :x2="width - paddingRight"
              :y1="yScale(tick)"
              :y2="yScale(tick)"
              class="grid-line"
              stroke-dasharray="4 4"
            />
            <text :x="paddingLeft - 8" :y="yScale(tick) + 4" text-anchor="end" class="axis-label">
              {{ formatCurrency(tick) }}
            </text>
          </template>
          <template v-for="(p, i) in pointArray" :key="`x-${i}`">
            <line
              :x1="p.x"
              :x2="p.x"
              :y1="paddingTop"
              :y2="height - paddingBottom"
              class="grid-line"
              stroke-dasharray="4 4"
            />
            <text :x="p.x" :y="height - paddingBottom + 18" text-anchor="middle" class="axis-label">
              {{ data[i].name }}
            </text>
          </template>
        </g>
        <line
          v-if="hoverIndex >= 0"
          :x1="pointArray[hoverIndex].x"
          :x2="pointArray[hoverIndex].x"
          :y1="paddingTop"
          :y2="height - paddingBottom"
          class="hover-line"
          stroke-dasharray="3 3"
        />
        <path :d="smoothPath" fill="none" class="data-line" stroke-width="2.5" />
        <template v-for="(p, idx) in pointArray" :key="`pt-${idx}`">
          <circle
            :cx="p.x"
            :cy="p.y"
            r="4"
            class="data-point"
            stroke-width="2"
            filter="url(#markerShadow)"
          />
        </template>
        <rect
          :x="paddingLeft"
          :y="paddingTop"
          :width="width - paddingLeft - paddingRight"
          :height="height - paddingTop - paddingBottom"
          fill="transparent"
        />
      </svg>
      <div v-if="hoverIndex >= 0" class="tooltip" :style="tooltipStyle">
        <div class="tooltip-title">{{ data[hoverIndex].name }}</div>
        <div class="tooltip-value">{{ formatCurrency(data[hoverIndex].value) }}</div>
        <div v-if="data[hoverIndex].insight" class="tooltip-insight">
          {{ data[hoverIndex].insight }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const { t } = useI18n();

const props = defineProps({
  data: { type: Array, required: true } // [{ name: 'Jan', value: 6000, insight?: '...' }]
});

const width = 760;
const height = 300;
const paddingLeft = 64;
const paddingRight = 24;
const paddingTop = 24;
const paddingBottom = 40;

const svgRef = ref(null);
const containerRef = ref(null);
const hoverIndex = ref(-1);
const tooltipStyle = ref({});

const maxValue = computed(() => Math.max(...props.data.map((d) => d.value)) || 1);

const niceStep = (max, steps = 5) => {
  const raw = max / (steps - 1);
  const pow10 = Math.pow(10, Math.floor(Math.log10(raw)));
  const normalized = raw / pow10;
  let nice;
  if (normalized <= 1) nice = 1;
  else if (normalized <= 2) nice = 2;
  else if (normalized <= 5) nice = 5;
  else nice = 10;
  return nice * pow10;
};

const step = computed(() => niceStep(maxValue.value, 5));
const yMax = computed(() => Math.ceil(maxValue.value / step.value) * step.value);
const yTicks = computed(() => Array.from({ length: 5 }, (_, i) => i * step.value));

const xStep = computed(
  () => (width - paddingLeft - paddingRight) / Math.max(props.data.length - 1, 1)
);
const yScale = (v) => paddingTop + (height - paddingTop - paddingBottom) * (1 - v / yMax.value);

const pointArray = computed(() =>
  props.data.map((d, i) => ({
    x: paddingLeft + i * xStep.value,
    y: yScale(d.value)
  }))
);

// Smooth cubic Bezier path
const smoothPath = computed(() => {
  const pts = pointArray.value;
  if (!pts.length) return '';
  if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`;
  const tension = 0.25;
  let d = `M ${pts[0].x},${pts[0].y}`;
  for (let i = 0; i < pts.length - 1; i += 1) {
    const p0 = i > 0 ? pts[i - 1] : pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = i !== pts.length - 2 ? pts[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const cp1y = p1.y + (p2.y - p0.y) * tension;
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = p2.y - (p3.y - p1.y) * tension;

    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
  }
  return d;
});

const formatCurrency = (n) => `$${n}`;

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

const onMouseMove = (e) => {
  const svg = svgRef.value;
  if (!svg) return;
  const rect = svg.getBoundingClientRect();
  const xView = (e.clientX - rect.left) * (width / rect.width);
  const idx = Math.round((xView - paddingLeft) / xStep.value);
  const clamped = clamp(idx, 0, pointArray.value.length - 1);
  hoverIndex.value = clamped;

  // Position tooltip near the hovered point
  const containerRect = containerRef.value.getBoundingClientRect();
  const leftPx = e.clientX - containerRect.left + 12;
  const topPx = e.clientY - containerRect.top - 48;
  const maxLeft = containerRect.width - 180;
  tooltipStyle.value = {
    left: `${clamp(leftPx, 8, maxLeft)}px`,
    top: `${clamp(topPx, 8, containerRect.height - 80)}px`
  };
};

const onMouseLeave = () => {
  hoverIndex.value = -1;
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.card {
  background: $bg-white;
  border-radius: $radius-xl;
  box-shadow: $shadow-md;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.title {
  font-size: $font-size-lg;
  font-weight: $font-semibold;
  margin-bottom: 0.5rem;
}
.chart-container {
  width: 100%;
  height: 320px;
  position: relative;
}
.chart {
  width: 100%;
  height: 100%;
}
.axis-label {
  fill: $text-muted;
  font-size: 12px;
}

.grid-line {
  stroke: $border-color;
}

.hover-line {
  stroke: $primary-light;
}

.data-line {
  stroke: $primary;
}

.data-point {
  fill: $primary;
  stroke: $bg-white;
}

.tooltip {
  position: absolute;
  min-width: 160px;
  max-width: 220px;
  background: $bg-white;
  border: 1px solid $border-light;
  border-radius: $radius-lg;
  padding: 0.5rem 0.75rem;
  box-shadow: $shadow-md;
  pointer-events: none;
}
.tooltip-title {
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: 2px;
}
.tooltip-value {
  font-weight: $font-bold;
  color: $primary;
  margin-bottom: 2px;
}
.tooltip-insight {
  font-size: $font-size-xs;
  color: $text-muted;
}
</style>
