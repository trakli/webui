<template>
  <svg
    class="lf"
    :viewBox="`0 0 ${W} ${H}`"
    width="100%"
    role="img"
    :aria-label="label"
    data-testid="ledger-flow"
  >
    <path v-for="link in bands" :key="link.key" :d="link.d" :class="link.cls">
      <title>{{ link.title }}</title>
    </path>
    <rect
      v-for="node in nodes"
      :key="node.key"
      :x="node.x"
      :y="node.y"
      :width="NODE"
      :height="Math.max(1, node.h)"
      rx="1"
      :class="node.cls"
    />
    <template v-for="node in nodes" :key="`t${node.key}`">
      <text
        v-if="node.label && node.h >= 11"
        :x="node.side === 'left' ? node.x - 6 : node.x + NODE + 6"
        :y="node.y + node.h / 2 + (node.h >= 26 ? -2 : 3.5)"
        :text-anchor="node.side === 'left' ? 'end' : 'start'"
        class="lf-name"
      >
        {{ node.label }}
      </text>
      <text
        v-if="node.label && node.h >= 26"
        :x="node.side === 'left' ? node.x - 6 : node.x + NODE + 6"
        :y="node.y + node.h / 2 + 11"
        :text-anchor="node.side === 'left' ? 'end' : 'start'"
        class="lf-amt"
      >
        {{ format(node.amount) }}
      </text>
    </template>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface FlowNode {
  name: string;
  amount: number;
  tone?: 'brand' | 'warn';
}

const props = defineProps<{
  sources: FlowNode[];
  sinks: FlowNode[];
  label: string;
  format: (value: number) => string;
}>();

const W = 640;
const H = 210;
const NODE = 8;
const GAP = 4;
const LEFT_X = 168;
const POOL_X = W / 2 - NODE / 2;
const RIGHT_X = W - 180;

const clean = (rows: FlowNode[]) => rows.filter((row) => row.amount > 0);

const layout = computed(() => {
  const left = clean(props.sources);
  const right = clean(props.sinks);
  const total = Math.max(
    1,
    left.reduce((s, r) => s + r.amount, 0),
    right.reduce((s, r) => s + r.amount, 0)
  );
  const gaps = Math.max(left.length, right.length, 1) - 1;
  const scale = (H - 8 - gaps * GAP) / total;

  const stack = (rows: FlowNode[], x: number, side: 'left' | 'right') => {
    const height = rows.reduce((s, r) => s + r.amount * scale, 0) + (rows.length - 1) * GAP;
    let cursor = (H - height) / 2;
    return rows.map((row, i) => {
      const h = row.amount * scale;
      const node = {
        key: `${side}${i}`,
        side,
        x,
        y: cursor,
        h,
        label: row.name,
        amount: row.amount,
        tone: row.tone
      };
      cursor += h + GAP;
      return node;
    });
  };

  const leftNodes = stack(left, LEFT_X, 'left');
  const rightNodes = stack(right, RIGHT_X, 'right');
  const poolH = total * scale;
  const poolY = (H - poolH) / 2;
  return { leftNodes, rightNodes, poolY, poolH, scale };
});

const nodes = computed(() => {
  const { leftNodes, rightNodes, poolY, poolH } = layout.value;
  const tone = (n: { tone?: string }, base: string) =>
    n.tone === 'brand' ? 'lf-node-brand' : n.tone === 'warn' ? 'lf-node-warn' : base;
  return [
    ...leftNodes.map((n) => ({ ...n, cls: tone(n, 'lf-node-brand') })),
    {
      key: 'pool',
      side: 'pool',
      x: POOL_X,
      y: poolY,
      h: poolH,
      label: '',
      amount: 0,
      cls: 'lf-node-pool'
    },
    ...rightNodes.map((n) => ({ ...n, cls: tone(n, 'lf-node-ink') }))
  ];
});

const band = (x1: number, t1: number, b1: number, x2: number, t2: number, b2: number) => {
  const mx = (x1 + x2) / 2;
  return `M${x1},${t1}C${mx},${t1} ${mx},${t2} ${x2},${t2}L${x2},${b2}C${mx},${b2} ${mx},${b1} ${x1},${b1}Z`;
};

const bands = computed(() => {
  const { leftNodes, rightNodes, poolY } = layout.value;
  const out: { key: string; d: string; cls: string; title: string }[] = [];
  let cursor = poolY;
  for (const n of leftNodes) {
    out.push({
      key: `l${n.key}`,
      d: band(n.x + NODE, n.y, n.y + n.h, POOL_X, cursor, cursor + n.h),
      cls: n.tone === 'warn' ? 'lf-band-warn' : 'lf-band-in',
      title: `${n.label}: ${props.format(n.amount)}`
    });
    cursor += n.h;
  }
  cursor = poolY;
  for (const n of rightNodes) {
    out.push({
      key: `r${n.key}`,
      d: band(POOL_X + NODE, cursor, cursor + n.h, n.x, n.y, n.y + n.h),
      cls: n.tone === 'brand' ? 'lf-band-kept' : 'lf-band-out',
      title: `${n.label}: ${props.format(n.amount)}`
    });
    cursor += n.h;
  }
  return out;
});
</script>

<style scoped>
.lf text {
  font-size: 11.5px;
  fill: var(--ledger-ink-2);
}

.lf text.lf-amt {
  font-family: var(--ledger-mono);
  font-size: 10.5px;
  fill: var(--ledger-ink-3);
}

.lf-band-in {
  fill: var(--ledger-brand);
  opacity: 0.22;
}

.lf-band-warn {
  fill: var(--ledger-orange);
  opacity: 0.3;
}

.lf-band-out {
  fill: var(--ledger-ink-3);
  opacity: 0.16;
}

.lf-band-kept {
  fill: var(--ledger-brand);
  opacity: 0.34;
}

.lf path:hover {
  opacity: 0.5;
}

.lf-node-brand {
  fill: var(--ledger-brand);
}

.lf-node-warn {
  fill: var(--ledger-orange);
}

.lf-node-pool {
  fill: var(--ledger-ink);
}

.lf-node-ink {
  fill: var(--ledger-ink-2);
}
</style>
