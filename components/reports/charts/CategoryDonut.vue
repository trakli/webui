<template>
  <div class="donut-wrap">
    <div
      ref="ringRef"
      class="ring"
      :style="{ background: gradient }"
      @mousemove="onMove"
      @mouseleave="onLeave"
    >
      <div class="center">
        <p class="center-label">{{ centerLabel }}</p>
        <p class="center-value">{{ formatter(total, currency) }}</p>
      </div>
    </div>

    <ul class="legend">
      <li
        v-for="(d, i) in data"
        :key="d.name"
        class="leg"
        :class="{ 'leg--dim': hover >= 0 && hover !== i }"
      >
        <span class="dot" :style="{ background: d.color }" />
        <span class="name">{{ d.name }}</span>
        <span class="pct">{{ pct(d.value) }}%</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  data: { type: Array, required: true }, // [{ name, value, color }]
  total: { type: Number, required: true },
  centerLabel: { type: String, default: 'Total' },
  currency: { type: String, default: 'USD' },
  formatter: { type: Function, default: (n) => `${Math.round(n)}` }
});

const ringRef = ref(null);
const hover = ref(-1);

const sum = computed(() => props.data.reduce((s, d) => s + d.value, 0) || 1);

const gradient = computed(() => {
  let cursor = 0;
  const stops = props.data.map((d) => {
    const start = (cursor / sum.value) * 360;
    cursor += d.value;
    const end = (cursor / sum.value) * 360;
    return `${d.color} ${start}deg ${end}deg`;
  });
  return `conic-gradient(${stops.join(', ')})`;
});

const pct = (v) => ((v / sum.value) * 100).toFixed(0);

const onMove = (e) => {
  const el = ringRef.value;
  if (!el) return;
  const rect = el.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = e.clientX - cx;
  const dy = e.clientY - cy;
  const r = Math.sqrt(dx * dx + dy * dy);
  if (r > rect.width / 2) {
    hover.value = -1;
    return;
  }
  let ang = (Math.atan2(dy, dx) * 180) / Math.PI;
  ang = (ang + 90 + 360) % 360;
  let acc = 0;
  for (let i = 0; i < props.data.length; i += 1) {
    const span = (props.data[i].value / sum.value) * 360;
    if (ang >= acc && ang < acc + span) {
      hover.value = i;
      return;
    }
    acc += span;
  }
  hover.value = -1;
};
const onLeave = () => {
  hover.value = -1;
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.donut-wrap {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-3;
  align-items: center;

  @media (min-width: $breakpoint-md) {
    grid-template-columns: minmax(140px, 200px) minmax(0, 1fr);
    gap: $spacing-4;
  }
}

.ring {
  position: relative;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: $bg-light;
  margin: 0 auto;

  @media (min-width: $breakpoint-md) {
    width: 180px;
    height: 180px;
    margin: 0;
  }
}

.ring::after {
  content: '';
  position: absolute;
  inset: 22px;
  background: $bg-white;
  border-radius: 50%;
}

.center {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  text-align: center;
  z-index: 1;
}

.center-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: $font-semibold;
  color: $text-muted;
  margin: 0;
}

.center-value {
  font-size: 1.2rem;
  font-weight: $font-bold;
  color: $text-primary;
  font-variant-numeric: tabular-nums;
  margin: 4px 0 0;
}

.legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.leg {
  display: grid;
  grid-template-columns: 12px 1fr auto;
  gap: 8px;
  align-items: center;
  padding: 4px 0;
  border-bottom: 1px dashed $border-color;
  font-size: $font-size-sm;
  transition: opacity $duration-fast $easing-standard;

  &:last-child {
    border-bottom: none;
  }

  &--dim {
    opacity: 0.4;
  }
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 2px;
}

.name {
  color: $text-primary;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.pct {
  font-weight: $font-bold;
  color: $text-secondary;
  font-variant-numeric: tabular-nums;
}
</style>
