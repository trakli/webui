<template>
  <div class="category-breakdown">
    <div class="header">
      <h3 class="title">Spending Overview</h3>
      <div class="chart-tabs">
        <button
          v-for="tab in chartTabs"
          :key="tab.id"
          class="tab-btn"
          :class="{ active: activeChart === tab.id }"
          @click="activeChart = tab.id"
        >
          <component :is="tab.icon" />
        </button>
      </div>
    </div>

    <div v-if="!hasData" class="empty-state">
      <p>No expense data available</p>
    </div>

    <div v-else class="chart-section">
      <!-- Pie/Donut Chart -->
      <div v-if="activeChart === 'pie'" class="chart-container">
        <div class="donut-wrapper">
          <div class="donut" :style="{ background: gradient }" />
          <div class="donut-center">
            <span class="center-label">Total</span>
            <span class="center-value">{{ formatTotal }}</span>
          </div>
        </div>
        <div class="chart-legend">
          <div v-for="(item, index) in topCategories" :key="index" class="legend-item">
            <span class="legend-dot" :style="{ background: item.color }" />
            <span class="legend-name">{{ item.name }}</span>
            <span class="legend-percent">{{ formatPercent(item.value) }}%</span>
          </div>
        </div>
      </div>

      <!-- Vertical Bar Chart -->
      <div v-else-if="activeChart === 'bar'" class="chart-container bar-container">
        <div class="bar-chart">
          <div v-for="(item, index) in topCategories" :key="index" class="bar-column">
            <div class="bar-value">{{ formatPercent(item.value) }}%</div>
            <div class="bar-track">
              <div
                class="bar-fill"
                :style="{ height: getBarHeight(item.value), background: item.color }"
              />
            </div>
            <div class="bar-label">{{ truncateName(item.name) }}</div>
          </div>
        </div>
      </div>

      <!-- Line Chart -->
      <div v-else-if="activeChart === 'line'" class="chart-container line-container">
        <svg class="line-chart" viewBox="0 0 280 160" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient
              v-for="(cat, idx) in topCategories"
              :id="'gradient-' + idx"
              :key="'grad-' + idx"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" :style="`stop-color: ${cat.color}; stop-opacity: 0.3`" />
              <stop offset="100%" :style="`stop-color: ${cat.color}; stop-opacity: 0.05`" />
            </linearGradient>
          </defs>
          <!-- Grid lines -->
          <line x1="30" y1="20" x2="30" y2="130" stroke="#e5e7eb" stroke-width="1" />
          <line x1="30" y1="130" x2="270" y2="130" stroke="#e5e7eb" stroke-width="1" />
          <line x1="30" y1="75" x2="270" y2="75" stroke="#e5e7eb" stroke-width="1" stroke-dasharray="4" />
          <!-- Lines for each category -->
          <path
            v-for="(cat, idx) in topCategories"
            :key="'line-' + idx"
            :d="getCategoryLinePath(idx)"
            fill="none"
            :stroke="cat.color"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- Data points -->
          <circle
            v-for="(point, idx) in allDataPoints"
            :key="'point-' + idx"
            :cx="point.x"
            :cy="point.y"
            r="3"
            :fill="point.color"
          />
        </svg>
        <div class="line-legend">
          <div v-for="(cat, idx) in topCategories" :key="idx" class="line-legend-item">
            <span class="legend-dot" :style="{ background: cat.color }" />
            <span class="legend-text">{{ truncateName(cat.name, 10) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, markRaw } from 'vue';
import { PieChart, BarChart3, TrendingUp } from 'lucide-vue-next';
import { useStatistics } from '@/composables/useStatistics';

const { currentStatistics, formatCompactCurrency } = useStatistics();

const COLORS = [
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#10b981', // Green
  '#ef4444', // Red
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316'  // Orange
];

const statistics = currentStatistics;
const activeChart = ref('pie');

const chartTabs = [
  { id: 'pie', icon: markRaw(PieChart) },
  { id: 'bar', icon: markRaw(BarChart3) },
  { id: 'line', icon: markRaw(TrendingUp) }
];

const expenseCategories = computed(() => {
  return statistics.value?.category_breakdown?.expense_categories || [];
});

const hasData = computed(() => expenseCategories.value.length > 0);

const totalExpenses = computed(() => {
  return expenseCategories.value.reduce((sum, cat) => sum + cat.amount, 0);
});

const topCategories = computed(() => {
  return expenseCategories.value.slice(0, 5).map((cat, index) => ({
    name: cat.category || cat.name || 'Unknown',
    value: cat.amount,
    color: COLORS[index % COLORS.length]
  }));
});

const gradient = computed(() => {
  if (!hasData.value) return '#e5e7eb';

  const total = totalExpenses.value || 1;
  let current = 0;
  const stops = topCategories.value.map((cat) => {
    const start = (current / total) * 360;
    current += cat.value;
    const end = (current / total) * 360;
    return `${cat.color} ${start}deg ${end}deg`;
  });

  if (current < total) {
    stops.push(`#e5e7eb ${(current / total) * 360}deg 360deg`);
  }

  return `conic-gradient(${stops.join(', ')})`;
});

const formatTotal = computed(() => {
  return formatCompactCurrency(totalExpenses.value, 'USD');
});

const formatPercent = (value) => {
  const total = totalExpenses.value || 1;
  return ((value / total) * 100).toFixed(0);
};

const getBarHeight = (value) => {
  const maxValue = topCategories.value[0]?.value || 1;
  return `${(value / maxValue) * 100}%`;
};

const truncateName = (name, max = 8) => {
  if (!name) return '';
  return name.length > max ? name.slice(0, max) + '…' : name;
};

const generateCategoryPoints = (categoryIndex) => {
  const cat = topCategories.value[categoryIndex];
  if (!cat) return [];

  const baseValue = cat.value;
  const numPoints = 5;
  const width = 240;
  const height = 110;
  const startX = 30;
  const startY = 20;

  const maxVal = topCategories.value[0]?.value || 1;
  const points = [];

  for (let i = 0; i < numPoints; i++) {
    const variation = 0.7 + Math.sin(categoryIndex + i * 1.5) * 0.3;
    const value = baseValue * variation;
    const x = startX + (i * width) / (numPoints - 1);
    const y = startY + height - (value / maxVal) * height;
    points.push({ x, y, color: cat.color });
  }

  return points;
};

const getCategoryLinePath = (categoryIndex) => {
  const points = generateCategoryPoints(categoryIndex);
  if (points.length === 0) return '';
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
};

const allDataPoints = computed(() => {
  const points = [];
  topCategories.value.forEach((_, idx) => {
    points.push(...generateCategoryPoints(idx));
  });
  return points;
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.category-breakdown {
  background: $bg-white;
  border-radius: $radius-xl;
  box-shadow: $shadow-sm;
  border: 1px solid $border-color;
  padding: $spacing-4;
  height: 320px;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-3;
  flex-shrink: 0;
}

.title {
  font-size: $font-size-base;
  font-weight: $font-semibold;
  color: $text-primary;
  margin: 0;
}

.chart-tabs {
  display: flex;
  gap: $spacing-1;
  background: $bg-light;
  padding: 3px;
  border-radius: $radius-md;
}

.tab-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: $radius-sm;
  cursor: pointer;
  color: $text-muted;
  transition: all 0.15s;

  svg {
    width: 16px;
    height: 16px;
  }

  &:hover {
    color: $text-primary;
  }

  &.active {
    background: $bg-white;
    color: $primary;
    box-shadow: $shadow-sm;
  }
}

.empty-state {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: $text-muted;
  font-size: $font-size-sm;
}

.chart-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.chart-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-4;
}

.donut-wrapper {
  position: relative;
  width: 160px;
  height: 160px;
  flex-shrink: 0;
}

.donut {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    inset: 28%;
    background: $bg-white;
    border-radius: 50%;
  }
}

.donut-center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.center-label {
  font-size: $font-size-xs;
  color: $text-muted;
}

.center-value {
  font-size: $font-size-base;
  font-weight: $font-bold;
  color: $text-primary;
}

.chart-legend {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
  min-width: 120px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: $spacing-2;
}

.legend-dot {
  width: 12px;
  height: 12px;
  border-radius: $radius-sm;
  flex-shrink: 0;
}

.legend-name {
  font-size: $font-size-sm;
  font-weight: $font-medium;
  color: $text-primary;
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
}

.legend-percent {
  font-size: $font-size-sm;
  font-weight: $font-semibold;
  color: $text-primary;
}

.bar-container {
  flex-direction: column;
  padding: $spacing-2 0;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: $spacing-4;
  height: 180px;
  width: 100%;
}

.bar-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: $spacing-1;
  flex: 1;
  max-width: 50px;
}

.bar-value {
  font-size: $font-size-xs;
  font-weight: $font-semibold;
  color: $text-primary;
}

.bar-track {
  width: 100%;
  height: 120px;
  background: $bg-light;
  border-radius: $radius-md;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.bar-fill {
  width: 100%;
  border-radius: $radius-md;
  transition: height 0.3s ease;
}

.bar-label {
  font-size: $font-size-xs;
  font-weight: $font-medium;
  color: $text-primary;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.line-container {
  flex-direction: column;
  gap: $spacing-2;
}

.line-chart {
  width: 100%;
  max-width: 280px;
  height: auto;
}

.line-legend {
  display: flex;
  justify-content: center;
  gap: $spacing-3;
  flex-wrap: wrap;
  margin-top: $spacing-2;
}

.line-legend-item {
  display: flex;
  align-items: center;
  gap: $spacing-1;
}

.legend-text {
  font-size: $font-size-xs;
  font-weight: $font-medium;
  color: $text-primary;
}
</style>
