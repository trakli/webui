<template>
  <div class="chat-chart-block">
    <p v-if="title" class="block-title">{{ title }}</p>

    <ClientOnly>
      <component
        :is="ApexChart"
        v-if="normalized"
        :type="apexType"
        height="260"
        :options="options"
        :series="series"
      />
      <pre v-else class="chart-fallback">{{ pretty }}</pre>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';

// Loaded client-side only (apexcharts touches the DOM at import).
const ApexChart = defineAsyncComponent(() => import('vue3-apexcharts'));

const props = defineProps<{
  title?: string;
  chart_hint?: string;
  dataset_ref?: string;
  data?: unknown;
}>();

const rows = computed<Record<string, unknown>[]>(() =>
  Array.isArray(props.data)
    ? (props.data as Record<string, unknown>[]).filter((r) => r && typeof r === 'object')
    : []
);

const labelKey = computed<string | null>(() => {
  const first = rows.value[0];
  if (!first) return null;
  return Object.keys(first).find((k) => typeof first[k] === 'string') ?? null;
});

const numericKeys = computed<string[]>(() => {
  const first = rows.value[0];
  if (!first) return [];
  const numeric = Object.keys(first).filter(
    (k) => typeof first[k] === 'number' && k !== 'percentage' && !/(^|_)id$/i.test(k)
  );
  // Count/metadata columns (transaction_count) sit alongside the real value
  // (amount) in the built-in datasets. Keeping them made numericKeys > 1, which
  // silently downgraded pie/donut to bar and could even plot the id. Drop them
  // when a real value column remains; keep them if that is all there is.
  const values = numeric.filter((k) => !/(^|_)count$/i.test(k));
  return values.length > 0 ? values : numeric;
});

const normalized = computed(
  () => rows.value.length > 0 && labelKey.value !== null && numericKeys.value.length > 0
);

const categories = computed(() => rows.value.map((r) => String(r[labelKey.value as string])));

// Shapes that plot one numeric column over its labels (a flat number array plus
// `labels`), vs the multi-series shapes that plot named series over an x-axis.
const SINGLE_SERIES = ['pie', 'donut', 'polarArea', 'radialBar', 'treemap'];
const KNOWN = [
  'line',
  'area',
  'bar',
  'hbar',
  'pie',
  'donut',
  'polarArea',
  'radialBar',
  'scatter',
  'treemap'
];

// Honor the requested chart, but fall back when the data shape can't support it
// (a single-series chart needs exactly one numeric column).
const kind = computed<string>(() => {
  const hint = props.chart_hint;
  if (hint && KNOWN.includes(hint)) {
    if (SINGLE_SERIES.includes(hint) && numericKeys.value.length > 1) return 'bar';
    return hint;
  }
  return numericKeys.value.length > 1 ? 'bar' : 'donut';
});

// hbar is a bar with a horizontal plot option; everything else maps 1:1.
const apexType = computed(() => (kind.value === 'hbar' ? 'bar' : kind.value));

const isSingleSeries = computed(() => SINGLE_SERIES.includes(kind.value));

const series = computed(() => {
  if (kind.value === 'treemap') {
    const key = numericKeys.value[0];
    return [
      {
        data: rows.value.map((r) => ({ x: String(r[labelKey.value as string]), y: Number(r[key]) }))
      }
    ];
  }
  if (isSingleSeries.value) {
    const key = numericKeys.value[0];
    return rows.value.map((r) => Number(r[key]));
  }
  return numericKeys.value.map((key) => ({
    name: key.replace(/_/g, ' '),
    data: rows.value.map((r) => Number(r[key]))
  }));
});

const options = computed(() => {
  const base: Record<string, unknown> = {
    chart: { toolbar: { show: false } },
    legend: { position: 'bottom' }
  };
  if (kind.value === 'hbar') {
    base.plotOptions = { bar: { horizontal: true } };
    base.xaxis = { categories: categories.value };
  } else if (kind.value === 'treemap') {
    // treemap carries its own labels inside the series data points.
  } else if (isSingleSeries.value) {
    base.labels = categories.value;
  } else {
    base.xaxis = { categories: categories.value };
  }
  return base;
});

const pretty = computed(() => JSON.stringify(props.data, null, 2));
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.block-title {
  font-weight: $font-semibold;
  margin-bottom: $spacing-2;
  font-size: $font-size-sm;
}

.chart-fallback {
  background: $bg-gray;
  padding: $spacing-2;
  border-radius: $radius-md;
  overflow-x: auto;
  font-size: $font-size-xs;
  margin: 0;
}
</style>
