<template>
  <div class="space-dashboard">
    <section class="welcome tone-card" :class="`surface surface--${tone}`">
      <div class="welcome-copy">
        <p class="eyebrow">{{ urgentCopy.eyebrow }}</p>
        <h1 class="welcome-title">{{ urgentCopy.title }}</h1>
        <p class="welcome-text">{{ urgentCopy.text }}</p>
      </div>
      <TButton
        v-if="urgentCopy.action"
        class="welcome-action"
        :full-width="false"
        :text="urgentCopy.action.label"
        :to="urgentCopy.action.to"
        @click="urgentCopy.action.run?.()"
      />
    </section>

    <ComponentLoader
      :is-loading="!ready && !error"
      :error="error"
      :has-data="ready"
      :show-empty="false"
      skeleton-variant="card"
      :on-retry="() => load(1)"
    >
      <section class="totals" :aria-label="t('This space in numbers')">
        <article v-for="total in totals" :key="total.currency" class="total tone-card">
          <p class="total-label">{{ t('Spent') }} · {{ total.currency }}</p>
          <p class="total-value total-value--expense">
            {{ spaceMoney(total.expenses, total.currency) }}
          </p>
          <p class="total-sub">
            {{ t('Income') }}
            <strong class="total-value--income">{{
              spaceMoney(total.income, total.currency)
            }}</strong>
          </p>
        </article>
        <article class="total tone-card">
          <p class="total-label">{{ t('Shared wallets') }}</p>
          <p class="total-value">{{ overview.wallets.length }}</p>
          <p class="total-sub">
            {{ t('{count} people', { count: space?.member_count ?? 1 }, space?.member_count ?? 1) }}
          </p>
        </article>
      </section>

      <div class="columns">
        <section class="panel">
          <header class="panel-head">
            <h2>{{ t('Budgets') }}</h2>
            <NuxtLink v-if="overview.budgets.length" to="/budgets" class="panel-link">
              {{ t('All budgets') }}
            </NuxtLink>
          </header>
          <div v-if="overview.budgets.length" class="budget-list">
            <BudgetCard
              v-for="budget in overview.budgets.slice(0, 3)"
              :key="budget.id"
              :budget="budget"
              :editable="false"
            />
          </div>
          <div v-else class="panel-empty">
            <p class="panel-empty-title">{{ t('No shared budgets yet') }}</p>
            <p>{{ t('A budget shows everyone how much is left before the month runs out.') }}</p>
            <TButton
              v-if="canManage && canWrite"
              :full-width="false"
              variant="secondary"
              :text="t('Create a budget')"
              :to="{ path: '/budgets', query: { new: '1' } }"
            />
          </div>
        </section>

        <section class="panel">
          <header class="panel-head">
            <h2>{{ t('Recent activity') }}</h2>
            <NuxtLink v-if="transactions.length" to="/transactions" class="panel-link">
              {{ t('All transactions') }}
            </NuxtLink>
          </header>
          <ul v-if="transactions.length" class="activity">
            <li v-for="entry in transactions.slice(0, 6)" :key="entry.id" class="activity-row">
              <span class="avatar" aria-hidden="true">{{ initials(entry.contributor) }}</span>
              <span class="activity-main">
                <span class="activity-title">{{ entry.description || typeLabel(entry.type) }}</span>
                <span class="activity-meta">
                  {{ entry.contributor }} · {{ formatDate(entry.datetime) }}
                </span>
              </span>
              <span class="activity-amount" :class="`activity-amount--${entry.type}`">
                {{ entry.type === 'expense' ? '−' : '+'
                }}{{ spaceMoney(entry.amount, entry.currency) }}
              </span>
            </li>
          </ul>
          <div v-else class="panel-empty">
            <p class="panel-empty-title">{{ t('Nothing recorded yet') }}</p>
            <p>{{ t('Shared spending appears here with the name of whoever recorded it.') }}</p>
            <TButton
              v-if="canWrite"
              :full-width="false"
              variant="secondary"
              :text="t('Record a transaction')"
              @click="compose()"
            />
          </div>
        </section>
      </div>
    </ComponentLoader>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import TButton from '@/components/TButton.vue';
import ComponentLoader from '@/components/ComponentLoader.vue';
import BudgetCard from '@/components/budgets/BudgetCard.vue';
import { spaceTone, spaceUrgency } from '~/utils/activeSpace';
import { spaceMoney } from '~/utils/spaceMoney';

const { t } = useI18n();
const { space, canManage, canWrite, isOwner } = useActiveSpace();
const { overview, transactions, ready, error, load, ensure } = useSpaceFinance();
const { compose } = useSpaceComposer();
const { resolveComponent } = useExtensionSlots();
const hasBilling = computed(() => !!resolveComponent('cloud.workspace.billing'));
const tone = computed(() => (space.value ? spaceTone(space.value.kind) : 'neutral'));
const totals = computed(() =>
  overview.value.totals.length
    ? overview.value.totals
    : [...new Set(overview.value.wallets.map((wallet) => wallet.currency))].map((currency) => ({
        currency,
        income: 0,
        expenses: 0
      }))
);

interface Action {
  label: string;
  to?: string | { path: string; query: Record<string, string> };
  run?: () => void;
}

const urgentCopy = computed(() => {
  const name = space.value?.name ?? '';
  const urgency = space.value ? spaceUrgency(space.value, overview.value) : null;
  const copy = (title: string, text: string, action?: Action) => ({
    eyebrow: name,
    title,
    text,
    action
  });
  switch (urgency) {
    case 'unpaid':
      return isOwner.value
        ? copy(
            t('Activate {name}', { name }),
            t(
              'This space is a draft. Activate it to share wallets, budgets and spending with the people you invite.'
            ),
            hasBilling.value ? { label: t('Activate space'), to: '/space-billing' } : undefined
          )
        : copy(
            t('Waiting for the owner'),
            t(
              'The owner needs to activate this space before anyone can make changes. You can still look around.'
            )
          );
    case 'no-wallet':
      return canManage.value
        ? copy(
            t('Add the first shared wallet'),
            t('A shared wallet is where the money you spend together is recorded.'),
            { label: t('Add a shared wallet'), to: { path: '/wallets', query: { new: '1' } } }
          )
        : copy(
            t('No shared wallet yet'),
            t('An admin needs to add a shared wallet before transactions can be recorded.')
          );
    case 'alone':
      return copy(
        t('Bring someone in'),
        t('A shared space works once the people you share money with have joined.'),
        canManage.value
          ? { label: t('Invite someone'), to: { path: '/people', query: { invite: '1' } } }
          : undefined
      );
    case 'over-budget':
      return copy(
        t('A budget has run over'),
        t('Check which budget went over and what pushed it there.'),
        { label: t('Review budgets'), to: '/budgets' }
      );
    default:
      return copy(
        t('Everything is on track'),
        t('Record shared spending as it happens so everyone sees the same numbers.'),
        canWrite.value ? { label: t('Record a transaction'), run: () => compose() } : undefined
      );
  }
});

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function typeLabel(type: string) {
  return type === 'income' ? t('Income') : t('Expense');
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

onMounted(ensure);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.space-dashboard {
  display: flex;
  flex-direction: column;
  gap: $spacing-6;
}

.welcome {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-4;
  padding: $spacing-6;
  border-radius: $radius-xl;

  @media (max-width: $breakpoint-sm) {
    padding: $spacing-5 $spacing-4;
  }
}

.welcome-copy {
  max-width: 40rem;
}

.welcome-title {
  margin: $spacing-1 0 $spacing-2;
  font-size: $font-size-2xl;
  color: $text-primary;
}

.welcome-text {
  margin: 0;
  color: $text-secondary;
}

.welcome-action {
  @media (max-width: $breakpoint-sm) {
    width: 100%;
  }
}

.totals {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr));
  gap: $spacing-4;

  @media (max-width: $breakpoint-sm) {
    grid-template-columns: 1fr 1fr;
    gap: $spacing-3;
  }
}

.total {
  border-radius: $radius-xl;
  padding: $spacing-4;

  p {
    margin: 0;
  }
}

.total-label {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.total-value {
  margin: $spacing-1 0 !important;
  font-size: $font-size-2xl;
  font-weight: $font-bold;
  color: $text-primary;

  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-lg;
  }

  &--expense {
    color: var(--color-expense);
  }

  &--income {
    color: var(--color-income);
  }
}

.total-sub {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.columns {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: $spacing-6;
  margin-top: $spacing-6;

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

  @media (max-width: $breakpoint-sm) {
    padding: $spacing-4;
  }
}

.panel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: $spacing-4;

  h2 {
    margin: 0;
    font-size: $font-size-lg;
    color: $text-primary;
  }
}

.panel-link {
  font-size: $font-size-sm;
  font-weight: $font-medium;
  color: $primary;
}

.budget-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-3;
}

.panel-empty {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: $spacing-2;
  color: $text-secondary;

  p {
    margin: 0;
  }
}

.panel-empty-title {
  font-weight: $font-semibold;
  color: $text-primary;
}

.activity {
  margin: 0;
  padding: 0;
  list-style: none;
}

.activity-row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: $spacing-3;
  padding: 6px 10px;
  border-radius: $radius-lg;

  &:hover {
    background: $bg-light;
  }
}

.avatar {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: $primary-light;
  color: $primary-dark;
  font-size: $font-size-xs;
  font-weight: $font-semibold;
}

.activity-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.activity-title {
  overflow: hidden;
  color: $text-primary;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.activity-meta {
  font-size: $font-size-xs;
  color: $text-secondary;
}

.activity-amount {
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
