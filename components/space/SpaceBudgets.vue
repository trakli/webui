<template>
  <div class="space-page">
    <header class="page-head">
      <div>
        <h1>{{ t('Budgets') }}</h1>
        <p>{{ t('Limits everyone in {name} spends against.', { name: space?.name ?? '' }) }}</p>
      </div>
      <div v-if="canManage && canWrite" class="page-actions">
        <TButton :full-width="false" :text="t('Create a budget')" @click="openBudget(null)" />
      </div>
    </header>

    <ComponentLoader
      :is-loading="!ready && !error"
      :error="error"
      :has-data="ready && overview.budgets.length > 0"
      skeleton-variant="card"
      :on-retry="() => load(1)"
    >
      <div class="budget-grid">
        <BudgetCard
          v-for="budget in overview.budgets"
          :key="budget.id"
          :budget="budget"
          :editable="canManage && canWrite"
          @edit="openBudget"
          @delete="confirmDelete"
        />
      </div>
      <template #empty>
        <div class="empty">
          <h2>{{ t('No shared budgets yet') }}</h2>
          <p>
            {{
              canManage
                ? t('Set a monthly limit for groceries, bills or anything you pay for together.')
                : t('Admins create budgets. Once they do, everyone sees how much is left.')
            }}
          </p>
          <TButton
            v-if="canManage && canWrite"
            :full-width="false"
            :text="t('Create a budget')"
            @click="openBudget(null)"
          />
        </div>
      </template>
    </ComponentLoader>

    <TModal
      v-model="budgetOpen"
      size="large"
      :title="editing ? t('Edit budget') : t('Create a budget')"
      :description="t('Leave targets empty to cover all spending in this space.')"
    >
      <BudgetForm
        hide-header
        :editing-item="editing"
        :workspace-targets="targets"
        :api-error="submitError"
        :is-submitting="submitting"
        :defaults="{ currency: overview.wallets[0]?.currency }"
        @created="save"
        @updated="save"
        @close="budgetOpen = false"
        @create-target="createTarget"
      />
    </TModal>
    <SpaceLabelModal v-model="labelOpen" :kind="labelKind" />
    <ConfirmModal
      :is-open="!!confirming"
      :title="confirming?.title ?? ''"
      :message="confirming?.message ?? ''"
      :confirm-text="confirming?.confirm"
      type="danger"
      @confirm="runConfirm"
      @cancel="confirming = null"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import TButton from '@/components/TButton.vue';
import TModal from '@/components/TModal.vue';
import ComponentLoader from '@/components/ComponentLoader.vue';
import ConfirmModal from '@/components/modals/ConfirmModal.vue';
import BudgetCard from '@/components/budgets/BudgetCard.vue';
import BudgetForm from '@/components/budgets/BudgetForm.vue';
import SpaceLabelModal from './SpaceLabelModal.vue';
import type { Budget, BudgetTargetType } from '~/types/budget';
import { extractApiErrors } from '~/utils/apiErrors';

const { t } = useI18n();
const route = useRoute();
const { space, canManage, canWrite } = useActiveSpace();
const { overview, ready, error, load, ensure, saveBudget, removeBudget } = useSpaceFinance();
const { confirming, ask, runConfirm } = useSpaceConfirm();
const { handle } = useUpsell();
const budgetOpen = ref(false);
const editing = ref<Budget | null>(null);
const submitError = ref('');
const submitting = ref(false);
const labelOpen = ref(false);
const labelKind = ref<'categories' | 'groups'>('categories');
const targets = computed(() => ({
  categories: overview.value.categories,
  groups: overview.value.groups,
  wallets: overview.value.wallets
}));

function openBudget(budget: Budget | null) {
  editing.value = budget;
  submitError.value = '';
  budgetOpen.value = true;
}

async function save(payload: Parameters<typeof saveBudget>[0]) {
  submitting.value = true;
  submitError.value = '';
  try {
    await saveBudget({ ...payload, id: editing.value?.id });
    budgetOpen.value = false;
  } catch (cause) {
    if (handle(cause)) budgetOpen.value = false;
    else submitError.value = extractApiErrors(cause);
  } finally {
    submitting.value = false;
  }
}

function createTarget(type: BudgetTargetType) {
  labelKind.value = type === 'group' ? 'groups' : 'categories';
  labelOpen.value = true;
}

function confirmDelete(budget: Budget) {
  ask({
    title: t('Delete {name}?', { name: budget.name }),
    message: t('The budget is removed. Its transactions stay in this space.'),
    confirm: t('Delete'),
    action: () => removeBudget(budget)
  });
}

onMounted(async () => {
  await ensure();
  if (route.query.new === '1' && canManage.value && canWrite.value) openBudget(null);
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;
@use './space-page' as *;

.budget-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(20rem, 1fr));
  gap: $spacing-4;

  @media (max-width: $breakpoint-sm) {
    grid-template-columns: 1fr;
  }
}
</style>
