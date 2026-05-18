<template>
  <div ref="containerRef" class="sankey">
    <svg :viewBox="`0 0 ${width} ${height}`" preserveAspectRatio="xMidYMid meet" class="sankey-svg">
      <defs>
        <linearGradient
          v-for="(link, i) in links"
          :id="`link-grad-${uid}-${i}`"
          :key="`grad-${i}`"
          x1="0%"
          x2="100%"
          y1="0%"
          y2="0%"
        >
          <stop offset="0%" :stop-color="link.startColor" stop-opacity="0.55" />
          <stop offset="100%" :stop-color="link.endColor" stop-opacity="0.55" />
        </linearGradient>
      </defs>

      <path
        v-for="(link, i) in links"
        :key="`link-${i}`"
        :d="link.path"
        :stroke="`url(#link-grad-${uid}-${i})`"
        :stroke-width="link.thickness"
        fill="none"
        :class="['link', { 'link--dim': hoverNode && !link.connectsTo(hoverNode) }]"
        @mouseenter="hoveredLinkIdx = i"
        @mouseleave="hoveredLinkIdx = -1"
      />

      <g v-for="node in incomeNodes" :key="`in-${node.name}`">
        <rect
          :x="node.x"
          :y="node.y"
          :width="nodeWidth"
          :height="node.height"
          rx="3"
          :fill="node.color"
          @mouseenter="hoverNode = node.name"
          @mouseleave="hoverNode = null"
        />
        <text
          :x="node.x - 8"
          :y="node.y + node.height / 2"
          dy="0.32em"
          text-anchor="end"
          class="node-label"
        >
          {{ node.name }}
        </text>
        <text
          :x="node.x - 8"
          :y="node.y + node.height / 2 + 14"
          dy="0.32em"
          text-anchor="end"
          class="node-amount"
        >
          {{ formatter(node.amount, currency) }}
        </text>
      </g>

      <g v-for="node in expenseNodes" :key="`out-${node.name}`">
        <rect
          :x="node.x"
          :y="node.y"
          :width="nodeWidth"
          :height="node.height"
          rx="3"
          :fill="node.color"
          @mouseenter="hoverNode = node.name"
          @mouseleave="hoverNode = null"
        />
        <text
          :x="node.x + nodeWidth + 8"
          :y="node.y + node.height / 2"
          dy="0.32em"
          class="node-label"
        >
          {{ node.name }}
        </text>
        <text
          :x="node.x + nodeWidth + 8"
          :y="node.y + node.height / 2 + 14"
          dy="0.32em"
          class="node-amount"
        >
          {{ formatter(node.amount, currency) }}
        </text>
      </g>
    </svg>

    <p v-if="!links.length" class="empty">
      {{ t('Not enough data to draw a flow yet') }}
    </p>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue';

const { t } = useI18n();

const props = defineProps({
  flow: { type: Object, required: true },
  currency: { type: String, default: 'USD' },
  formatter: { type: Function, default: (n) => `${Math.round(n)}` }
});

const containerRef = ref(null);
const hoverNode = ref(null);
const hoveredLinkIdx = ref(-1);
const uid = Math.random().toString(36).slice(2, 8);

const width = 900;
const height = 460;
const nodeWidth = 14;
const nodeGap = 8;
const leftX = 80;
const rightX = width - 80 - nodeWidth;

const layoutNodes = (items, color) => {
  if (!items.length) return [];
  const total = items.reduce((s, i) => s + i.amount, 0) || 1;
  const usable = height - (items.length - 1) * nodeGap - 40;
  let cursor = 20;
  return items.map((item) => {
    const h = Math.max(8, (item.amount / total) * usable);
    const node = {
      ...item,
      x: 0,
      y: cursor,
      height: h,
      color: item.color || color
    };
    cursor += h + nodeGap;
    return node;
  });
};

const incomeNodes = computed(() => {
  const items = props.flow.sources || [];
  return layoutNodes(items, 'var(--color-income)').map((n) => ({
    ...n,
    x: leftX,
    color: 'var(--color-income)'
  }));
});

const expenseNodes = computed(() => {
  const sinks = props.flow.sinks || [];
  const savings = props.flow.savings || 0;
  const all = [...sinks];
  if (savings > 0) {
    all.push({ name: t('Savings'), amount: savings, color: 'var(--color-primary)' });
  }
  return layoutNodes(all, 'var(--color-expense)').map((n) => ({
    ...n,
    x: rightX
  }));
});

const links = computed(() => {
  const inNodes = incomeNodes.value;
  const outNodes = expenseNodes.value;
  if (!inNodes.length || !outNodes.length) return [];
  const totalIn = inNodes.reduce((s, n) => s + n.amount, 0) || 1;
  const totalOut = outNodes.reduce((s, n) => s + n.amount, 0) || 1;

  const inCursors = new Map(inNodes.map((n) => [n.name, n.y]));
  const outCursors = new Map(outNodes.map((n) => [n.name, n.y]));

  const out = [];
  inNodes.forEach((src) => {
    outNodes.forEach((dst) => {
      const inShare = src.amount / totalIn; // fraction of in attributed to this source
      const linkAmt = (dst.amount * inShare * totalIn) / totalOut;
      if (linkAmt < 0.5) return;
      const thickness = Math.max(1, (linkAmt / totalIn) * (height - 40));

      const srcY = inCursors.get(src.name);
      const dstY = outCursors.get(dst.name);
      const srcHFrac = thickness;
      const dstHFrac = thickness;

      inCursors.set(src.name, srcY + srcHFrac);
      outCursors.set(dst.name, dstY + dstHFrac);

      const x0 = src.x + nodeWidth;
      const x1 = dst.x;
      const cx = (x0 + x1) / 2;
      const y0 = srcY + srcHFrac / 2;
      const y1 = dstY + dstHFrac / 2;

      const path = `M ${x0},${y0} C ${cx},${y0} ${cx},${y1} ${x1},${y1}`;

      out.push({
        path,
        thickness,
        startColor: 'var(--color-income)',
        endColor: dst.color || 'var(--color-expense)',
        src: src.name,
        dst: dst.name,
        connectsTo: (name) => name === src.name || name === dst.name
      });
    });
  });
  return out;
});

onMounted(() => {
  // Nothing yet; reserved for resize observer if needed
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.sankey {
  position: relative;
  width: 100%;
  min-height: 460px;
}

.sankey-svg {
  width: 100%;
  height: 460px;
  display: block;
}

.link {
  transition: opacity $duration-base $easing-standard;
  cursor: pointer;

  &:hover {
    opacity: 0.9;
  }

  &--dim {
    opacity: 0.12;
  }
}

.node-label {
  font-size: 12px;
  fill: var(--color-text-primary);
  font-weight: 600;
  font-family: $font-family-sans;
}

.node-amount {
  font-size: 10px;
  fill: var(--color-text-muted);
  font-family: $font-family-sans;
  font-variant-numeric: tabular-nums;
}

.empty {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  color: $text-muted;
  font-size: $font-size-sm;
  margin: 0;
}
</style>
