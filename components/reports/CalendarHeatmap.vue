<template>
  <section class="card">
    <header class="card-head">
      <div>
        <h2 class="card-title">{{ t('Spending calendar') }}</h2>
        <p class="card-sub">
          {{ t('Each tile is a day. Darker = more spent.') }}
        </p>
      </div>
      <div class="legend">
        <span class="legend-label">{{ t('Less') }}</span>
        <span v-for="step in 5" :key="step" class="legend-cell" :style="legendStyle(step - 1)" />
        <span class="legend-label">{{ t('More') }}</span>
      </div>
    </header>

    <div class="months">
      <article v-for="month in monthGroups" :key="month.label" class="month">
        <h3 class="month-label">{{ month.label }}</h3>
        <div class="grid">
          <span v-for="dow in dayHeaders" :key="dow" class="dow">{{ dow }}</span>
          <span
            v-for="(slot, i) in month.slots"
            :key="`${month.label}-${i}`"
            class="cell"
            :class="{
              'cell--empty': slot.empty,
              'cell--zero': !slot.empty && slot.expense === 0,
              'cell--today': slot.isToday,
              'cell--hover': hoveredKey === slot.date
            }"
            :style="!slot.empty ? cellStyle(slot.expense) : null"
            :title="cellTitle(slot)"
            @mouseenter="hoveredKey = slot.date"
            @mouseleave="hoveredKey = null"
            @click="!slot.empty && slot.expense > 0 && $emit('select-day', slot)"
          >
            <span v-if="!slot.empty" class="cell-num">{{ slot.dayNum }}</span>
          </span>
        </div>
      </article>
    </div>

    <footer v-if="hoveredSlot && !hoveredSlot.empty" class="hover-meta">
      <span class="hover-date">{{ formatDate(hoveredSlot.date) }}</span>
      <span class="hover-amt">
        <ArrowDownLeft :size="12" class="ico-in" />
        {{ formatter(hoveredSlot.income, currency) }}
      </span>
      <span class="hover-amt">
        <ArrowUpRight :size="12" class="ico-out" />
        {{ formatter(hoveredSlot.expense, currency) }}
      </span>
      <span class="hover-amt hover-amt--net">
        {{ t('Net') }} {{ formatter(hoveredSlot.net, currency) }}
      </span>
    </footer>
  </section>
</template>

<script setup>
import { computed, ref } from 'vue';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-vue-next';

const { t, locale } = useI18n();

const props = defineProps({
  buckets: { type: Array, required: true }, // DailyBucket[]
  currency: { type: String, default: 'USD' },
  formatter: { type: Function, default: (n) => `${Math.round(n)}` }
});

defineEmits(['select-day']);

const hoveredKey = ref(null);
const todayISO = new Date().toISOString().slice(0, 10);

const dayHeaders = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

// Group buckets by YYYY-MM
const monthGroups = computed(() => {
  if (!props.buckets.length) return [];
  const groups = new Map();
  props.buckets.forEach((b) => {
    const monthKey = b.date.slice(0, 7);
    if (!groups.has(monthKey)) groups.set(monthKey, []);
    groups.get(monthKey).push(b);
  });

  return Array.from(groups.entries()).map(([key, days]) => {
    const first = new Date(key + '-01T00:00:00');
    const startDow = (first.getDay() + 6) % 7; // shift so Monday=0
    const slots = [];
    // Leading empties
    for (let i = 0; i < startDow; i += 1) {
      slots.push({ empty: true });
    }
    days.forEach((d) => {
      const dt = new Date(d.date + 'T00:00:00');
      slots.push({
        ...d,
        empty: false,
        dayNum: dt.getDate(),
        isToday: d.date === todayISO
      });
    });
    return {
      label: new Intl.DateTimeFormat(locale.value, { month: 'long', year: 'numeric' }).format(
        first
      ),
      slots
    };
  });
});

const max = computed(() => Math.max(1, ...props.buckets.map((b) => b.expense)));

const intensity = (amount) => {
  if (!amount) return 0;
  const pct = amount / max.value;
  // Log scale so big outliers don't wash out small days
  return Math.min(1, Math.log10(1 + pct * 9));
};

const cellStyle = (amount) => {
  const i = intensity(amount);
  return {
    background:
      i === 0
        ? 'var(--color-bg-light)'
        : `color-mix(in oklab, var(--color-expense) ${Math.round(i * 65)}%, var(--color-bg-light))`,
    color: i > 0.55 ? 'rgba(255,255,255,0.9)' : 'var(--color-text-muted)'
  };
};

const legendStyle = (step) => {
  const i = step / 4;
  return {
    background:
      i === 0
        ? 'var(--color-bg-light)'
        : `color-mix(in oklab, var(--color-expense) ${Math.round(i * 65)}%, var(--color-bg-light))`
  };
};

const hoveredSlot = computed(() => {
  if (!hoveredKey.value) return null;
  return props.buckets.find((b) => b.date === hoveredKey.value) || null;
});

const formatDate = (iso) => {
  if (!iso) return '';
  return new Intl.DateTimeFormat(locale.value, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  }).format(new Date(iso + 'T00:00:00'));
};

const cellTitle = (slot) => {
  if (slot.empty) return '';
  return `${slot.date} · ${props.formatter(slot.expense, props.currency)}`;
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.card {
  background: $bg-white;
  border: 1px solid $border-color;
  border-radius: 14px;
  padding: $spacing-4;
  box-shadow: $elevation-1;
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: $spacing-3;
}

.card-title {
  font-size: $font-size-lg;
  font-weight: $font-semibold;
  color: $text-primary;
  margin: 0;
}

.card-sub {
  font-size: $font-size-xs;
  color: $text-muted;
  margin: 2px 0 0;
}

.legend {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &-label {
    font-size: 10px;
    color: $text-muted;
  }

  &-cell {
    width: 12px;
    height: 12px;
    border-radius: 3px;
    border: 1px solid rgba(0, 0, 0, 0.04);
  }
}

.months {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: $spacing-3;
}

.month {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.month-label {
  font-size: $font-size-sm;
  font-weight: $font-semibold;
  color: $text-secondary;
  margin: 0;
}

.grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
}

.dow {
  font-size: 10px;
  color: $text-muted;
  text-align: center;
  font-weight: $font-medium;
}

.cell {
  position: relative;
  aspect-ratio: 1;
  border-radius: 5px;
  background: $bg-light;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
  transition: $transition-fast;
  border: 1px solid transparent;

  &-num {
    font-size: 10px;
    font-weight: $font-medium;
    opacity: 0.8;
  }

  &--empty {
    background: transparent;
    cursor: default;
  }

  &--zero {
    background: $bg-light;
  }

  &--today {
    outline: 2px solid var(--color-primary);
    outline-offset: 1px;
  }

  &--hover {
    transform: scale(1.08);
    z-index: 1;
    box-shadow: $elevation-2;
  }

  &:not(.cell--empty):not(.cell--zero):hover {
    cursor: pointer;
  }
}

.hover-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-2 $spacing-3;
  background: $bg-light;
  border-radius: 10px;
  font-size: $font-size-sm;

  .hover-date {
    font-weight: $font-semibold;
    color: $text-primary;
  }

  .hover-amt {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: $text-secondary;
    font-variant-numeric: tabular-nums;

    &--net {
      font-weight: $font-semibold;
      color: $text-primary;
      margin-left: auto;
    }
  }
}

.ico-in {
  color: var(--color-income);
}
.ico-out {
  color: var(--color-expense);
}
</style>
