<template>
  <div class="card">
    <h2 class="title">{{ t('Income Sources Breakdown') }}</h2>
    <div ref="wrapperRef" class="donut-wrapper" @mousemove="onMouseMove" @mouseleave="onMouseLeave">
      <div class="donut" :style="{ background: gradient }" />
      <div class="donut-center">
        <p class="center-label">{{ t('Total Income') }}</p>
        <p class="center-value">{{ formatShortAmount(`${total} ${currency}`) }}</p>
      </div>
      <div v-if="hoverIndex >= 0" class="tooltip" :style="tooltipStyle">
        <div class="tooltip-title">
          <span class="color-dot" :style="{ background: data[hoverIndex].color }" />
          {{ data[hoverIndex].name }}
        </div>
        <div class="tooltip-value">
          {{ formatShortAmount(`${data[hoverIndex].value} ${currency}`) }} ({{
            percent(data[hoverIndex].value)
          }}%)
        </div>
      </div>
    </div>
    <div v-if="$slots.note" class="note">
      <slot name="note" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { formatShortAmount } from '@/utils/currency';

const { t } = useI18n();

const props = defineProps({
  data: { type: Array, required: true }, // [{ name, value, color }]
  total: { type: Number, required: true },
  currency: { type: String, default: 'USD' }
});

const wrapperRef = ref(null);
const hoverIndex = ref(-1);
const tooltipStyle = ref({});

const sum = computed(() => props.data.reduce((acc, d) => acc + d.value, 0) || 1);

const gradient = computed(() => {
  let current = 0;
  const stops = props.data.map((d) => {
    const start = (current / sum.value) * 360;
    current += d.value;
    const end = (current / sum.value) * 360;
    return `${d.color} ${start}deg ${end}deg`;
  });
  return `conic-gradient(${stops.join(', ')})`;
});

const percent = (v) => ((v / sum.value) * 100).toFixed(0);

const onMouseMove = (e) => {
  const el = wrapperRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2 - 8; // visual center tweak toward top
  const dx = e.clientX - cx;
  const dy = e.clientY - cy;
  const r = Math.sqrt(dx * dx + dy * dy);
  const outer = 110; // close to donut outer radius (px)
  const inner = 70; // close to donut inner radius (px)

  if (r < inner || r > outer) {
    hoverIndex.value = -1;
    return;
  }

  // angle in degrees [0,360), 0deg at +x axis increasing clockwise
  let ang = Math.atan2(dy, dx) * (180 / Math.PI);
  ang = (ang + 360) % 360;

  // find which segment contains the angle
  let start = 0;
  let found = -1;
  for (let i = 0; i < props.data.length; i += 1) {
    const end = start + (props.data[i].value / sum.value) * 360;
    if (ang >= start && ang < end) {
      found = i;
      break;
    }
    start = end;
  }
  hoverIndex.value = found;

  const left = e.clientX - rect.left + 10;
  const top = e.clientY - rect.top - 30;
  const maxLeft = rect.width - 180;
  const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
  tooltipStyle.value = {
    left: `${clamp(left, 8, maxLeft)}px`,
    top: `${clamp(top, 8, rect.height - 80)}px`
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
  padding: $spacing-4;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  font-size: $font-size-lg;
  font-weight: $font-semibold;
  margin-bottom: $spacing-2;
}

.donut-wrapper {
  position: relative;
  width: 100%;
  max-width: 360px;
  height: 280px;
  display: grid;
  place-items: center;
}

.donut {
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: $bg-gray;
  position: relative;
}

.donut::after {
  content: '';
  position: absolute;
  inset: 20px;
  background: $bg-white;
  border-radius: 50%;
}

.donut-center {
  position: absolute;
  text-align: center;
}

.center-label {
  font-size: $font-size-xs;
  color: $text-muted;
}

.center-value {
  font-size: $font-size-2xl;
  font-weight: $font-bold;
}

.note {
  margin-top: $spacing-3;
  background: rgba(var(--color-warning-rgb), 0.1);
  color: $warning;
  border-left: 4px solid $warning;
  padding: $spacing-2 $spacing-3;
  border-radius: $radius-lg;
  text-align: center;
}

.tooltip {
  position: absolute;
  min-width: 160px;
  max-width: 220px;
  background: $bg-white;
  border: 1px solid $border-light;
  border-radius: $radius-lg;
  padding: $spacing-2 $spacing-3;
  box-shadow: $shadow-md;
  pointer-events: none;
}

.tooltip-title {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: 2px;
}

.tooltip-value {
  font-weight: $font-bold;
  color: $text-secondary;
}

.color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}
</style>
