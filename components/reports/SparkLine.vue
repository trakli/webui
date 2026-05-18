<template>
  <svg
    class="sparkline"
    :viewBox="`0 0 ${width} ${height}`"
    preserveAspectRatio="none"
    aria-hidden="true"
  >
    <defs>
      <linearGradient :id="gradId" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" :stop-color="color" stop-opacity="0.32" />
        <stop offset="100%" :stop-color="color" stop-opacity="0" />
      </linearGradient>
    </defs>
    <path v-if="areaPath" :d="areaPath" :fill="`url(#${gradId})`" />
    <path v-if="linePath" :d="linePath" :stroke="color" stroke-width="2" fill="none" />
    <circle
      v-if="lastPoint"
      :cx="lastPoint.x"
      :cy="lastPoint.y"
      r="3"
      :fill="color"
      stroke="var(--color-bg-white)"
      stroke-width="1.5"
    />
  </svg>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  values: { type: Array, required: true }, // numbers oldest -> newest
  color: { type: String, default: '#10b981' },
  width: { type: Number, default: 120 },
  height: { type: Number, default: 36 }
});

const gradId = computed(() => `spark-grad-${Math.random().toString(36).slice(2, 8)}`);

const points = computed(() => {
  if (!props.values?.length) return [];
  const min = Math.min(...props.values);
  const max = Math.max(...props.values);
  const span = max - min || 1;
  const padY = 4;
  const usableH = props.height - padY * 2;
  const stepX = props.values.length > 1 ? props.width / (props.values.length - 1) : 0;
  return props.values.map((v, i) => ({
    x: i * stepX,
    y: padY + usableH - ((v - min) / span) * usableH
  }));
});

const linePath = computed(() => {
  const pts = points.value;
  if (pts.length < 2) return '';
  return pts.reduce((d, p, i) => (i === 0 ? `M ${p.x},${p.y}` : `${d} L ${p.x},${p.y}`), '');
});

const areaPath = computed(() => {
  const pts = points.value;
  if (pts.length < 2) return '';
  const line = pts.reduce((d, p, i) => (i === 0 ? `M ${p.x},${p.y}` : `${d} L ${p.x},${p.y}`), '');
  return `${line} L ${pts[pts.length - 1].x},${props.height} L ${pts[0].x},${props.height} Z`;
});

const lastPoint = computed(() => points.value[points.value.length - 1] || null);
</script>

<style lang="scss" scoped>
.sparkline {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}
</style>
