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
      <!-- y grid + ticks -->
      <g>
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
      </g>

      <!-- x labels -->
      <template v-for="(p, i) in points" :key="`x-${i}`">
        <text
          v-if="data[i]"
          :x="p.income.x"
          :y="height - padB + 16"
          text-anchor="middle"
          class="axis"
        >
          {{ data[i].label }}
        </text>
      </template>

      <!-- hover guide -->
      <line
        v-if="hover >= 0"
        :x1="points[hover].income.x"
        :x2="points[hover].income.x"
        :y1="padT"
        :y2="height - padB"
        class="hover"
        stroke-dasharray="2 4"
      />

      <!-- income area + line -->
      <path :d="areaPath('income')" class="area area--income" />
      <path :d="linePath('income')" class="line line--income" stroke-width="2" />

      <!-- expense area + line -->
      <path :d="areaPath('expense')" class="area area--expense" />
      <path :d="linePath('expense')" class="line line--expense" stroke-width="2" />

      <!-- net dashed line -->
      <path :d="linePath('net')" class="line line--net" stroke-width="2" stroke-dasharray="5 4" />

      <!-- points on hover -->
      <template v-if="hover >= 0">
        <circle
          :cx="points[hover].income.x"
          :cy="points[hover].income.y"
          r="4"
          class="dot dot--income"
        />
        <circle
          :cx="points[hover].expense.x"
          :cy="points[hover].expense.y"
          r="4"
          class="dot dot--expense"
        />
        <circle :cx="points[hover].net.x" :cy="points[hover].net.y" r="4" class="dot dot--net" />
      </template>
    </svg>

    <!-- legend -->
    <ul class="legend">
      <li><span class="sw sw--income" />{{ t('Income') }}</li>
      <li><span class="sw sw--expense" />{{ t('Expense') }}</li>
      <li><span class="sw sw--net" />{{ t('Net') }}</li>
    </ul>

    <div v-if="hover >= 0 && data[hover]" class="tooltip" :style="tooltipStyle">
      <p class="tooltip-title">{{ data[hover].label }}</p>
      <p class="tip-row">
        <span class="sw sw--income" />{{ t('Income') }}:
        {{ formatter(data[hover].income, currency) }}
      </p>
      <p class="tip-row">
        <span class="sw sw--expense" />{{ t('Expense') }}:
        {{ formatter(data[hover].expense, currency) }}
      </p>
      <p class="tip-row">
        <span class="sw sw--net" />{{ t('Net') }}: {{ formatter(data[hover].net, currency) }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const { t } = useI18n();

const props = defineProps({
  data: { type: Array, required: true }, // [{ label, income, expense, net }]
  currency: { type: String, default: 'USD' },
  formatter: { type: Function, default: (n) => `${Math.round(n)}` }
});

const width = 760;
const height = 280;
const padL = 56;
const padR = 16;
const padT = 16;
const padB = 32;

const svgRef = ref(null);
const containerRef = ref(null);
const hover = ref(-1);
const tooltipStyle = ref({});

const maxVal = computed(() => {
  const arr = [
    ...props.data.map((d) => d.income),
    ...props.data.map((d) => d.expense),
    ...props.data.map((d) => d.net)
  ];
  return Math.max(1, ...arr.map((v) => Math.abs(v)));
});

const niceStep = (max) => {
  const raw = max / 4;
  const pow10 = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / pow10;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * pow10;
};
const step = computed(() => niceStep(maxVal.value));
const yMax = computed(() => Math.ceil(maxVal.value / step.value) * step.value);
const yTicks = computed(() => Array.from({ length: 5 }, (_, i) => i * step.value));

const xStep = computed(() => (width - padL - padR) / Math.max(props.data.length - 1, 1));
const yScale = (v) => padT + (height - padT - padB) * (1 - v / yMax.value);

const points = computed(() =>
  props.data.map((d, i) => {
    const x = padL + i * xStep.value;
    return {
      income: { x, y: yScale(d.income) },
      expense: { x, y: yScale(d.expense) },
      net: { x, y: yScale(Math.max(0, d.net)) }
    };
  })
);

const linePath = (key) => {
  const pts = points.value.map((p) => p[key]);
  if (!pts.length) return '';
  return pts.reduce((d, p, i) => (i === 0 ? `M ${p.x},${p.y}` : `${d} L ${p.x},${p.y}`), '');
};

const areaPath = (key) => {
  const pts = points.value.map((p) => p[key]);
  if (pts.length < 2) return '';
  const line = pts.reduce((d, p, i) => (i === 0 ? `M ${p.x},${p.y}` : `${d} L ${p.x},${p.y}`), '');
  return `${line} L ${pts[pts.length - 1].x},${height - padB} L ${pts[0].x},${height - padB} Z`;
};

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
  height: 280px;
}

.svg {
  width: 100%;
  height: 100%;
  display: block;
}

.grid {
  stroke: $chart-grid;
}
.hover {
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
  stroke-linecap: round;
  stroke-linejoin: round;

  &--income {
    stroke: var(--color-income);
  }
  &--expense {
    stroke: var(--color-expense);
  }
  &--net {
    stroke: var(--color-text-secondary);
  }
}

.area {
  &--income {
    fill: rgba(var(--color-income-rgb), 0.1);
  }
  &--expense {
    fill: rgba(var(--color-expense-rgb), 0.08);
  }
}

.dot {
  stroke: var(--color-bg-white);
  stroke-width: 1.5;

  &--income {
    fill: var(--color-income);
  }
  &--expense {
    fill: var(--color-expense);
  }
  &--net {
    fill: var(--color-text-secondary);
  }
}

.legend {
  position: absolute;
  top: 0;
  right: 0;
  list-style: none;
  display: inline-flex;
  gap: $spacing-3;
  margin: 0;
  padding: 0;
  font-size: 11px;
  color: $text-muted;

  li {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
}

.sw {
  width: 10px;
  height: 10px;
  border-radius: 2px;

  &--income {
    background: var(--color-income);
  }
  &--expense {
    background: var(--color-expense);
  }
  &--net {
    background: var(--color-text-secondary);
  }
}

.tooltip {
  position: absolute;
  min-width: 180px;
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
  font-weight: $font-bold;
  color: $text-primary;
  margin-bottom: 4px !important;
}

.tip-row {
  display: flex;
  align-items: center;
  gap: 6px;
  color: $text-secondary;
  font-variant-numeric: tabular-nums;
  line-height: 1.5;
}
</style>
