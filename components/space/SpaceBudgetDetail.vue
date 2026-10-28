<template>
  <div class="space-page">
    <NuxtLink to="/budgets" class="back">← {{ t('All budgets') }}</NuxtLink>
    <ComponentLoader
      :is-loading="!ready && !error"
      :error="error"
      :has-data="ready && !!budget"
      skeleton-variant="card"
    >
      <template v-if="budget">
        <BudgetCard :budget="budget" :editable="false" class="summary" />
        <div class="columns">
          <section class="panel">
            <header class="panel-head">
              <h2>{{ t('Spending in this period') }}</h2>
              <span class="muted">{{ t('{count} entries', { count: total }, total) }}</span>
            </header>
            <ComponentLoader
              :is-loading="entriesLoading"
              :has-data="entries.length > 0"
              skeleton-variant="list"
            >
              <ul class="entries">
                <li v-for="entry in entries" :key="entry.id">
                  <span class="entry-main">
                    <span class="title">{{ entry.description || t('Expense') }}</span>
                    <span class="muted"
                      >{{ entry.contributor }} · {{ formatDate(entry.datetime) }}</span
                    >
                  </span>
                  <span class="amount" :class="`amount--${entry.type}`">
                    {{ entry.type === 'expense' ? '−' : '+'
                    }}{{ spaceMoney(entry.amount, entry.currency) }}
                  </span>
                </li>
              </ul>
              <TPagination
                v-if="lastPage > 1"
                :current-page="page"
                :total-pages="lastPage"
                @page-change="loadEntries"
              />
              <template #empty>
                <p class="muted">{{ t('Nothing counts toward this budget yet this period.') }}</p>
              </template>
            </ComponentLoader>
          </section>
          <section class="panel">
            <header class="panel-head">
              <h2>{{ t('Past periods') }}</h2>
            </header>
            <ul v-if="periods.length" class="entries">
              <li v-for="period in periods" :key="period.id">
                <span class="muted"
                  >{{ formatDate(period.period_start) }} – {{ formatDate(period.period_end) }}</span
                >
                <span class="amount">{{ spaceMoney(period.net_spent, budget.currency) }}</span>
              </li>
            </ul>
            <p v-else class="muted">{{ t('Closed periods appear here with what was spent.') }}</p>
            <TButton
              v-if="canClose"
              variant="secondary"
              :full-width="false"
              :text="t('Close ended period')"
              @click="confirmClose"
            />
          </section>
        </div>
      </template>
      <template #empty>
        <div class="empty">
          <h2>{{ t('This budget is not in {name}', { name: space?.name ?? '' }) }}</h2>
          <p>{{ t('It may have been deleted, or it belongs to another space.') }}</p>
          <TButton :full-width="false" :text="t('All budgets')" to="/budgets" />
        </div>
      </template>
    </ComponentLoader>
    <ConfirmModal
      :is-open="!!confirming"
      :title="confirming?.title ?? ''"
      :message="confirming?.message ?? ''"
      :confirm-text="confirming?.confirm"
      type="info"
      @confirm="runConfirm"
      @cancel="confirming = null"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import TButton from '@/components/TButton.vue';
import TPagination from '@/components/TPagination.vue';
import ComponentLoader from '@/components/ComponentLoader.vue';
import ConfirmModal from '@/components/modals/ConfirmModal.vue';
import BudgetCard from '@/components/budgets/BudgetCard.vue';
import type { WorkspaceTransaction } from '~/types/workspace';
import { spaceMoney } from '~/utils/spaceMoney';

const props = defineProps<{ id: number }>();
const { t } = useI18n();
const { space, canManage, canWrite } = useActiveSpace();
const { overview, ready, error, ensure, budgetEntries, budgetPeriods, closeBudget } =
  useSpaceFinance();
const { confirming, ask, runConfirm } = useSpaceConfirm();
const budget = computed(() => overview.value.budgets.find((item) => item.id === props.id));
const entries = ref<WorkspaceTransaction[]>([]);
const periods = ref<Awaited<ReturnType<typeof budgetPeriods>>>([]);
const entriesLoading = ref(false);
const page = ref(1);
const lastPage = ref(1);
const total = ref(0);
const canClose = computed(
  () =>
    canManage.value &&
    canWrite.value &&
    !!budget.value?.progress &&
    new Date(budget.value.progress.period_end) < new Date()
);

async function loadEntries(next = 1) {
  if (!budget.value) return;
  entriesLoading.value = true;
  try {
    const result = await budgetEntries(budget.value.id, next);
    entries.value = result.data;
    page.value = result.current_page;
    lastPage.value = result.last_page;
    total.value = result.total;
  } finally {
    entriesLoading.value = false;
  }
}

function confirmClose() {
  const current = budget.value;
  if (!current) return;
  ask({
    title: t('Close the ended period?'),
    message: t('Its total is saved and what is left carries into the next period.'),
    confirm: t('Close period'),
    action: () => closeBudget(current.id)
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

watch(budget, async (current, previous) => {
  if (!current || current.id === previous?.id) return;
  await loadEntries(1);
  periods.value = await budgetPeriods(current.id).catch(() => []);
});

onMounted(ensure);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;
@use './space-page' as *;

.back {
  display: inline-block;
  margin-bottom: $spacing-4;
  color: $primary;
  font-size: $font-size-sm;
  font-weight: $font-medium;
}

.summary {
  margin-bottom: $spacing-6;
}

.columns {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: $spacing-6;

  @media (max-width: $breakpoint-lg) {
    grid-template-columns: 1fr;
  }
}

.panel {
  padding: $spacing-5;
  background: $bg-white;
  border: 1px solid $border-light;
  border-radius: $radius-xl;
  box-shadow: $elevation-1;
}

.panel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: $spacing-3;

  h2 {
    margin: 0;
    font-size: $font-size-lg;
    color: $text-primary;
  }
}

.entries {
  margin: 0 0 $spacing-3;
  padding: 0;
  list-style: none;

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: $spacing-3;
    padding: 6px 10px;
    border-bottom: 1px solid $border-light;
  }
}

.entry-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.title {
  color: $text-primary;
}

.muted {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.amount {
  font-weight: $font-semibold;
  white-space: nowrap;

  &--expense {
    color: var(--color-expense);
  }

  &--income {
    color: var(--color-income);
  }
}
</style>
