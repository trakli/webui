<template>
  <section class="strip">
    <article class="note-card note-card--biggest">
      <header>
        <span class="ico"><Banknote :size="14" /></span>
        <h3>{{ t('Biggest expense') }}</h3>
      </header>
      <template v-if="notable.biggestExpense">
        <p class="note-value">
          {{ formatter(notable.biggestExpense.amount, currency) }}
        </p>
        <p class="note-meta">
          {{ notable.biggestExpense.party }}
          <span class="dot">·</span>
          {{ notable.biggestExpense.category }}
        </p>
        <p class="note-date">{{ formatDate(notable.biggestExpense.date) }}</p>
      </template>
      <p v-else class="note-empty">{{ t('No expenses in this period') }}</p>
    </article>

    <article class="note-card note-card--swing">
      <header>
        <span class="ico"><ArrowUpDown :size="14" /></span>
        <h3>{{ t('Biggest swing') }}</h3>
      </header>
      <template v-if="notable.biggestCategorySwing">
        <p class="note-value">
          {{ notable.biggestCategorySwing.name }}
        </p>
        <p class="note-meta">
          {{ formatter(notable.biggestCategorySwing.fromAmount, currency) }}
          <ArrowRight :size="12" class="inline-ico" />
          {{ formatter(notable.biggestCategorySwing.toAmount, currency) }}
        </p>
        <p
          class="note-pill"
          :class="notable.biggestCategorySwing.deltaPct < 0 ? 'pill--good' : 'pill--bad'"
        >
          <component
            :is="notable.biggestCategorySwing.deltaPct > 0 ? ArrowUpRight : ArrowDownRight"
            :size="12"
          />
          {{ notable.biggestCategorySwing.deltaPct > 0 ? '+' : ''
          }}{{ notable.biggestCategorySwing.deltaPct }}%
        </p>
      </template>
      <p v-else class="note-empty">{{ t('No comparable changes') }}</p>
    </article>

    <article class="note-card note-card--first">
      <header>
        <span class="ico"><UserPlus :size="14" /></span>
        <h3>{{ t('First-time payees') }}</h3>
      </header>
      <p class="note-value">{{ notable.firstTimePayees.count }}</p>
      <template v-if="notable.firstTimePayees.names.length">
        <p class="note-meta note-meta--list">
          <span v-for="(name, i) in notable.firstTimePayees.names" :key="name" class="tag">
            {{ name }}<span v-if="i < notable.firstTimePayees.names.length - 1">·</span>
          </span>
        </p>
      </template>
      <p v-else class="note-empty">{{ t('All familiar names') }}</p>
    </article>

    <article class="note-card note-card--streak">
      <header>
        <span class="ico"><ShieldCheck :size="14" /></span>
        <h3>{{ t('No-spend streak') }}</h3>
      </header>
      <p class="note-value">
        {{ notable.longestNoSpendStreak.days }}
        <span class="value-suffix">{{ t('days') }}</span>
      </p>
      <p v-if="notable.longestNoSpendStreak.startDate" class="note-meta">
        {{ formatDate(notable.longestNoSpendStreak.startDate) }}
        <ArrowRight :size="12" class="inline-ico" />
        {{ formatDate(notable.longestNoSpendStreak.endDate) }}
      </p>
      <p v-else class="note-empty">{{ t('Every day had spending') }}</p>
    </article>
  </section>
</template>

<script setup>
import {
  Banknote,
  ArrowUpDown,
  UserPlus,
  ShieldCheck,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-vue-next';

const { t, locale } = useI18n();

defineProps({
  notable: { type: Object, required: true },
  currency: { type: String, default: 'USD' },
  formatter: { type: Function, default: (n) => `${Math.round(n)}` }
});

const formatDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso + 'T00:00:00');
  return new Intl.DateTimeFormat(locale.value, { month: 'short', day: 'numeric' }).format(d);
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.strip {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  background: $bg-white;
  border: 1px solid $border-color;
  border-radius: 14px;
  box-shadow: $elevation-1;
  overflow: hidden;

  @media (min-width: $breakpoint-sm) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: $breakpoint-lg) {
    grid-template-columns: repeat(4, 1fr);
  }
}

.note-card {
  padding: $spacing-4;
  display: flex;
  flex-direction: column;
  gap: 4px;
  border-right: 1px solid $border-color;

  &:last-child {
    border-right: none;
  }

  @media (max-width: $breakpoint-lg) {
    &:nth-child(2) {
      border-right: none;
    }
    &:nth-child(1),
    &:nth-child(2) {
      border-bottom: 1px solid $border-color;
    }
  }

  @media (max-width: $breakpoint-sm) {
    border-right: none;
    border-bottom: 1px solid $border-color;
    &:last-child {
      border-bottom: none;
    }
  }

  header {
    display: flex;
    align-items: center;
    gap: $spacing-2;

    h3 {
      font-size: 11px;
      font-weight: $font-semibold;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: $text-muted;
      margin: 0;
    }
  }
}

.ico {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: $text-muted;
}

.note-card--biggest .ico {
  color: var(--color-expense);
}
.note-card--swing .ico {
  color: var(--color-warning);
}
.note-card--first .ico {
  color: $text-secondary;
}
.note-card--streak .ico {
  color: var(--color-income);
}

.note-value {
  font-size: 1.15rem;
  font-weight: $font-semibold;
  color: $text-primary;
  margin: 2px 0 0;
  font-variant-numeric: tabular-nums;
  line-height: 1.15;
  letter-spacing: -0.01em;

  .note-card--biggest & {
    color: var(--color-expense);
  }
  .note-card--streak & {
    color: var(--color-income);
  }
}

.value-suffix {
  font-size: $font-size-sm;
  font-weight: $font-medium;
  color: $text-muted;
  margin-left: 4px;
}

.note-meta {
  font-size: $font-size-sm;
  color: $text-secondary;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;

  &--list {
    gap: 4px;
  }
}

.inline-ico {
  display: inline-block;
  vertical-align: middle;
  color: $text-muted;
}

.dot {
  color: $text-muted;
}

.tag {
  font-size: $font-size-xs;
  padding: 2px 6px;
  border-radius: 6px;
  background: $bg-light;
  color: $text-secondary;
}

.note-date {
  font-size: $font-size-xs;
  color: $text-muted;
  margin: 0;
}

.note-empty {
  font-size: $font-size-sm;
  color: $text-muted;
  margin: 4px 0 0;
}

.note-pill {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  align-self: flex-start;
  margin-top: 4px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: $font-size-xs;
  font-weight: $font-semibold;
  font-variant-numeric: tabular-nums;

  &.pill--good {
    background: var(--color-income-soft);
    color: var(--color-income);
  }
  &.pill--bad {
    background: var(--color-expense-soft);
    color: var(--color-expense);
  }
}
</style>
