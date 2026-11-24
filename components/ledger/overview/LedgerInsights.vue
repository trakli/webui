<template>
  <div class="lo-insights">
      <h2 class="lo-h"><Lightbulb />{{ t('What stands out') }}</h2>
      <div v-for="item in insights" :key="item.key" class="lo-ins">
        <span class="lo-coin"><component :is="item.icon" /></span>
        <div><b>{{ item.title }}</b> {{ item.detail }}</div>
      </div>
      <p v-if="!insights.length" class="lo-muted">{{ t('Nothing unusual so far.') }}</p>

      <div>
        <h2 class="lo-h">{{ t('Coming up') }}</h2>
        <ul class="lo-list lo-upcoming">
          <li v-for="item in upcoming" :key="item.id">
            <span class="lo-when">
              <b>{{ item.when.getDate() }}</b>
              <small>{{ item.when.toLocaleString(locale, { month: 'short' }) }}</small>
            </span>
            <span class="lo-list-name">
              {{ item.title }}
              <small v-if="item.description">{{ item.description }}</small>
            </span>
          </li>
        </ul>
        <NuxtLink v-if="!upcoming.length" to="/reminders" class="lo-link">
          {{ t('Nothing scheduled. Add a reminder') }}
        </NuxtLink>
      </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { Leaf, Lightbulb, Target, TrendingDown, TrendingUp } from 'lucide-vue-next';
import { useLedgerOverview } from '@/composables/useLedgerOverview';
import { useBudgets } from '@/composables/useBudgets';
import { useReminders } from '@/composables/useReminders';
import { addDays } from '@/utils/ledgerOverview';
import { money } from '@/utils/ledgerMoney';

const { t, locale } = useI18n();
const { span, base, categories, noSpend, loadStats, loadDetail } = useLedgerOverview();
const { activeBudgets, fetchBudgets } = useBudgets();
const { reminders, fetchReminders } = useReminders();

const fmt = (value: number) => money(value, base.value, locale.value);
const shortDate = (date: Date) => date.toLocaleString(locale.value, { month: 'short', day: 'numeric' });
const prevLabel = computed(() =>
  new Intl.DateTimeFormat(locale.value, { month: 'short', day: 'numeric' })
    .formatRange(span.value.prevStart, span.value.prevToday)
    .replace(/\s/g, '\u00a0')
);
const biggestFall = computed(() =>
  categories.value.filter((row) => row.prevAmount > 0 && row.delta < -0.005).sort((a, b) => a.delta - b.delta)[0]
);
const biggestRise = computed(() =>
  categories.value.filter((row) => row.delta > 0.005).sort((a, b) => b.delta - a.delta)[0]
);

const insights = computed(() => {
  const out: { key: string; icon: unknown; title: string; detail: string }[] = [];

  for (const budget of activeBudgets.value) {
    const progress = budget.progress;
    if (!progress) continue;
    const spent = money(progress.net_spent, budget.currency, locale.value);
    const limit = money(progress.effective_limit, budget.currency, locale.value);
    if (progress.status === 'over_budget') {
      out.push({
        key: `budget${budget.id}`,
        icon: Target,
        title: t('{name} is {amount} over budget.', {
          name: budget.name,
          amount: money(progress.net_spent - progress.effective_limit, budget.currency, locale.value)
        }),
        detail: t('{spent} spent of {limit}.', { spent, limit })
      });
    } else if (progress.status === 'near_limit' || progress.status === 'forecast_breach') {
      out.push({
        key: `budget${budget.id}`,
        icon: Target,
        title: t('{name} has used {percent}% of its budget.', {
          name: budget.name,
          percent: Math.round(progress.percent_used)
        }),
        detail:
          progress.status === 'forecast_breach'
            ? t('At this pace it goes over before the period ends.')
            : t('{spent} spent of {limit}.', { spent, limit })
      });
    }
  }

  if (biggestFall.value) {
    out.push({
      key: 'fall',
      icon: TrendingDown,
      title: t('{name} fell {amount}', { name: biggestFall.value.name, amount: fmt(-biggestFall.value.delta) }),
      detail: t('against {range}, the biggest drop of any category.', { range: prevLabel.value })
    });
  }

  if (biggestRise.value) {
    out.push({
      key: 'rise',
      icon: TrendingUp,
      title: t('{name} is up {amount}', { name: biggestRise.value.name, amount: fmt(biggestRise.value.delta) }),
      detail: t('against {range}.', { range: prevLabel.value })
    });
  }

  const quiet = noSpend.value;
  if (quiet.count > 0) {
    const from = addDays(span.value.start, quiet.longestStart);
    const to = addDays(span.value.start, quiet.longestStart + quiet.longest - 1);
    out.push({
      key: 'quiet',
      icon: Leaf,
      title: t('{count} no-spend days', { count: quiet.count }, quiet.count),
      detail:
        quiet.longest >= 2
          ? t('including {days} in a row, {from} to {to}.', {
              days: quiet.longest,
              from: shortDate(from),
              to: shortDate(to)
            })
          : t('so far in this period.')
    });
  }

  return out.slice(0, 4);
});

const upcoming = computed(() => {
  const today = span.value.today.getTime();
  return reminders.value
    .filter((item) => item.status === 'active' || item.status === 'snoozed')
    .map((item) => ({ ...item, when: new Date(item.snoozed_until || item.next_trigger_at || item.trigger_at) }))
    .filter((item) => !Number.isNaN(item.when.getTime()) && item.when.getTime() >= today)
    .sort((a, b) => a.when.getTime() - b.when.getTime())
    .slice(0, 4);
});

onMounted(() => {
  loadStats();
  loadDetail();
  fetchBudgets().catch(() => {});
  fetchReminders();
});
</script>

<style scoped>
.lo-insights {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.lo-h {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: var(--ledger-ink-3);
}

.lo-h :deep(svg) {
  width: 14px;
  height: 14px;
  flex: none;
}

.lo-muted {
  color: var(--ledger-ink-3);
  font-size: 12.5px;
  margin: 0;
}

.lo-link {
  margin-left: auto;
}

.lo-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
}

.lo-list li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 0;
  border-bottom: 1px solid var(--ledger-line);
  font-size: 13px;
}

.lo-list li:last-child {
  border-bottom: 0;
}

.lo-list-name {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.lo-list-name small {
  color: var(--ledger-ink-3);
  font-size: 12px;
}

.lo-ins {
  display: flex;
  gap: 10px;
  padding: 10px;
  border-radius: var(--ledger-r);
  background: var(--ledger-surface-2);
  font-size: 13px;
  line-height: 1.45;
}

.lo-coin {
  width: 30px;
  height: 30px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: var(--ledger-r-sm);
  background: var(--ledger-surface);
  color: var(--ledger-ink-2);
}

.lo-coin :deep(svg) {
  width: 16px;
  height: 16px;
}

.lo-upcoming {
  margin-top: 4px;
}

.lo-when {
  width: 40px;
  flex: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4px 0;
  border-radius: var(--ledger-r-sm);
  background: var(--ledger-surface-2);
  line-height: 1.1;
}

.lo-when b {
  font-family: var(--ledger-mono);
  font-size: 14px;
}

.lo-when small {
  font-size: 10px;
  text-transform: uppercase;
  color: var(--ledger-ink-3);
}
</style>
