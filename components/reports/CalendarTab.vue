<template>
  <section class="calendar-tab">
    <header class="tab-header">
      <div>
        <p class="eyebrow">{{ t('Calendar') }}</p>
        <h2 class="title">{{ t('Spending day by day') }}</h2>
        <p class="sub">{{ t('Spot the busy days, the quiet ones, and your streaks.') }}</p>
      </div>
    </header>

    <div class="cal-stage">
      <div class="cal-main">
        <CalendarHeatmap
          :buckets="buckets"
          :currency="currency"
          :formatter="formatter"
          @select-day="$emit('select-day', $event)"
        />
      </div>

      <aside class="cal-side">
        <article class="stat-card">
          <header>
            <Flame :size="12" />
            <h3>{{ t('Top spend days') }}</h3>
          </header>
          <ol v-if="topDays.length" class="rank">
            <li v-for="d in topDays" :key="d.date" class="rank-item">
              <span class="rank-date">{{ formatLong(d.date) }}</span>
              <span class="rank-amt">{{ formatter(d.expense, currency) }}</span>
            </li>
          </ol>
          <p v-else class="empty">{{ t('No spending recorded.') }}</p>
        </article>

        <article class="stat-card">
          <header>
            <BarChart3 :size="12" />
            <h3>{{ t('At a glance') }}</h3>
          </header>
          <dl class="stat-list">
            <div class="stat-row">
              <dt>{{ t('Days with spend') }}</dt>
              <dd>{{ daysWithSpend }} / {{ buckets.length }}</dd>
            </div>
            <div class="stat-row">
              <dt>{{ t('No-spend days') }}</dt>
              <dd>{{ noSpendDays }}</dd>
            </div>
            <div class="stat-row">
              <dt>{{ t('Avg daily spend') }}</dt>
              <dd>{{ formatter(avgDaily, currency) }}</dd>
            </div>
            <div class="stat-row">
              <dt>{{ t('Busiest weekday') }}</dt>
              <dd>{{ busiestWeekday }}</dd>
            </div>
          </dl>
        </article>

        <article class="stat-card">
          <header>
            <Calendar :size="12" />
            <h3>{{ t('By weekday') }}</h3>
          </header>
          <div class="weekday-grid">
            <div v-for="(d, i) in weekBuckets" :key="i" class="weekday-cell">
              <div class="weekday-bar-vert">
                <span class="weekday-bar-fill" :style="{ height: `${(d / weekMax) * 100}%` }" />
              </div>
              <span class="weekday-name">{{ dayShortNames[i] }}</span>
            </div>
          </div>
        </article>
      </aside>
    </div>
  </section>
</template>

<script setup>
import { computed } from 'vue';
import { Calendar, Flame, BarChart3 } from 'lucide-vue-next';
import CalendarHeatmap from './CalendarHeatmap.vue';

const { t, locale } = useI18n();

const props = defineProps({
  buckets: { type: Array, required: true },
  currency: { type: String, default: 'USD' },
  formatter: { type: Function, default: (n) => `${Math.round(n)}` }
});

defineEmits(['select-day']);

const topDays = computed(() =>
  [...props.buckets]
    .filter((b) => b.expense > 0)
    .sort((a, b) => b.expense - a.expense)
    .slice(0, 5)
);

const daysWithSpend = computed(() => props.buckets.filter((b) => b.expense > 0).length);
const noSpendDays = computed(() => props.buckets.filter((b) => b.expense === 0).length);
const avgDaily = computed(() => {
  const totalSpend = props.buckets.reduce((s, b) => s + b.expense, 0);
  const n = props.buckets.length || 1;
  return totalSpend / n;
});

const dayShortNames = computed(() => {
  // Monday-first
  const base = new Date(2024, 0, 1); // Monday
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    return new Intl.DateTimeFormat(locale.value, { weekday: 'short' }).format(d);
  });
});

const weekBuckets = computed(() => {
  const arr = [0, 0, 0, 0, 0, 0, 0];
  props.buckets.forEach((b) => {
    const d = new Date(b.date + 'T00:00:00');
    const idx = (d.getDay() + 6) % 7; // shift Mon=0
    arr[idx] += b.expense;
  });
  return arr;
});

const weekMax = computed(() => Math.max(1, ...weekBuckets.value));

const busiestWeekday = computed(() => {
  const idx = weekBuckets.value.indexOf(Math.max(...weekBuckets.value));
  return dayShortNames.value[idx];
});

const formatLong = (iso) =>
  new Intl.DateTimeFormat(locale.value, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(new Date(iso + 'T00:00:00'));
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.calendar-tab {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.tab-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: $spacing-3;
  flex-wrap: wrap;
}

.eyebrow {
  display: none;
}

.title {
  font-size: 1.25rem;
  font-weight: $font-semibold;
  color: $text-primary;
  margin: 0;
  letter-spacing: -0.01em;
}

.sub {
  font-size: $font-size-sm;
  color: $text-muted;
  margin: 4px 0 0;
}

.cal-stage {
  display: grid;
  grid-template-columns: 1fr;
  gap: $spacing-3;
  align-items: start;

  @media (min-width: $breakpoint-lg) {
    grid-template-columns: minmax(0, 2.4fr) minmax(280px, 1fr);
  }
}

.cal-main {
  min-width: 0;
  max-height: 82vh;
  overflow-y: auto;

  @media (min-width: $breakpoint-lg) {
    max-height: calc(100vh - 200px);
  }
}

.cal-side {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
  max-height: 82vh;
  overflow-y: auto;
  padding-right: 4px;

  @media (min-width: $breakpoint-lg) {
    position: sticky;
    top: $spacing-3;
    max-height: calc(100vh - 200px);
  }

  /* Tame the scrollbar */
  scrollbar-width: thin;
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: $border-color;
    border-radius: 3px;
  }
}

.stat-card {
  background: $bg-white;
  border: 1px solid $border-color;
  border-radius: 14px;
  padding: $spacing-3 $spacing-4;
  box-shadow: $elevation-1;
  display: flex;
  flex-direction: column;
  gap: $spacing-2;

  header {
    display: flex;
    align-items: center;
    gap: 4px;
    color: $text-muted;

    h3 {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      font-weight: $font-semibold;
      color: $text-muted;
      margin: 0;
    }
  }
}

.rank {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.rank-item {
  display: flex;
  justify-content: space-between;
  gap: $spacing-2;
  align-items: baseline;
  padding: 4px 0;
  font-size: $font-size-sm;
  border-bottom: 1px dashed $border-color;

  &:last-child {
    border-bottom: none;
  }
}

.rank-date {
  color: $text-primary;
  font-weight: $font-medium;
}

.rank-amt {
  color: var(--color-expense);
  font-weight: $font-bold;
  font-variant-numeric: tabular-nums;
}

.empty {
  font-size: $font-size-sm;
  color: $text-muted;
  margin: 0;
}

.stat-list {
  display: flex;
  flex-direction: column;
  gap: 0;
  margin: 0;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding: 4px 0;
  font-size: $font-size-sm;
  border-bottom: 1px dashed $border-color;

  &:last-child {
    border-bottom: none;
  }

  dt {
    color: $text-muted;
    margin: 0;
  }
  dd {
    color: $text-primary;
    font-weight: $font-semibold;
    font-variant-numeric: tabular-nums;
    margin: 0;
  }
}

.weekday-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  align-items: end;
  min-height: 80px;
}

.weekday-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.weekday-bar-vert {
  position: relative;
  width: 100%;
  height: 56px;
  background: rgba(0, 0, 0, 0.04);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: flex-end;
}

.weekday-bar-fill {
  display: block;
  width: 100%;
  background: $text-secondary;
  border-radius: 4px;
  transition: height $duration-slow $easing-emphasized;
  min-height: 2px;
}

.weekday-name {
  font-size: 10px;
  color: $text-muted;
  font-weight: $font-semibold;
  text-transform: uppercase;
}
</style>
