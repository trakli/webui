<template>
  <footer class="ls" data-testid="ledger-status">
    <span>{{ rangeLabel }}</span>
    <span
      >{{ t('In') }} <b class="ls-in">{{ money(kpis.income, base, locale) }}</b></span
    >
    <span
      >{{ t('Out') }} <b>{{ money(kpis.expense, base, locale) }}</b></span
    >
    <span class="ls-hide-sm">
      {{ t('Kept') }}
      <b :class="kpis.kept >= 0 ? 'ls-in' : 'ls-out'">{{
        money(kpis.kept, base, locale, { sign: true })
      }}</b>
    </span>
    <span v-if="updated" class="ls-end ls-hide-sm">
      <span class="ls-dot" />{{ t('Updated {time}', { time: updated }) }}
    </span>
  </footer>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useLedgerOverview } from '@/composables/useLedgerOverview';
import { money } from '@/utils/ledgerMoney';

const { t, locale } = useI18n();
const { base, kpis, span, loadedAt, loadStats } = useLedgerOverview();

const rangeLabel = computed(() => {
  const fmt = new Intl.DateTimeFormat(locale.value, { month: 'short', day: 'numeric' });
  return fmt.formatRange(span.value.start, span.value.today);
});

const updated = computed(() =>
  loadedAt.value
    ? loadedAt.value.toLocaleTimeString(locale.value, { hour: '2-digit', minute: '2-digit' })
    : ''
);

onMounted(() => loadStats());
</script>

<style scoped>
.ls {
  display: flex;
  gap: 18px;
  align-items: center;
  padding: 6px 16px;
  border-top: 1px solid var(--ledger-line);
  background: var(--ledger-surface);
  font-size: 12px;
  color: var(--ledger-ink-3);
  white-space: nowrap;
  overflow: hidden;
}

.ls b {
  color: var(--ledger-ink);
  font-family: var(--ledger-mono);
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.ls b.ls-in {
  color: var(--ledger-income);
}

.ls b.ls-out {
  color: var(--ledger-expense);
}

.ls-end {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
}

.ls-dot {
  width: 7px;
  height: 7px;
  border-radius: 2px;
  background: var(--ledger-brand-text);
  display: inline-block;
  margin-right: 6px;
}

@media (max-width: 767px) {
  .ls {
    gap: 12px;
    padding: 6px 12px;
  }

  .ls-hide-sm {
    display: none;
  }
}
</style>
