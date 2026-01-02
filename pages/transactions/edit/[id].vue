<template>
  <div>
    <TTopCard
      page-name="Transaction"
      page-name-plural="Transactions"
      action="Edit"
      :show-add-button="false"
      :breadcrumb-items="[
        { text: 'Home', clickable: false },
        { text: 'Transactions', clickable: true, action: 'back' },
        { text: 'Edit Transaction', current: true }
      ]"
      @back="$router.push('/transactions')"
    />
    <div
      v-if="errorMessage"
      style="
        max-width: 800px;
        margin: 20px auto;
        padding: 16px;
        background: #fee;
        border: 1px solid #fcc;
        border-radius: 8px;
        color: #c00;
      "
    >
      <strong>{{ t('Error:') }}</strong> {{ errorMessage }}
    </div>
    <div class="edit-form-section">
      <TransactionFormContainer
        :editing-item="transactionToEdit"
        :is-outcome-selected="transactionToEdit?.type === 'EXPENSE'"
        @submit="handleSubmit"
      />
      <TipsSection page-name="Transaction" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'nuxt/app';
import { useTransactions } from '@/composables/useTransactions';
import TTopCard from '@/components/TTopCard.vue';
import TransactionFormContainer from '@/components/TransactionFormContainer.vue';
import TipsSection from '@/components/TipsSection.vue';

const { t } = useI18n();

const router = useRouter();
const route = useRoute();
const { updateTransaction, getTransactionForEdit } = useTransactions();

const errorMessage = ref('');
const transactionToEdit = ref(null);
const isLoadingTransaction = ref(false);

const handleSubmit = async (data) => {
  errorMessage.value = '';
  try {
    await updateTransaction(route.params.id, data);
    router.push('/transactions');
  } catch (error) {
    console.error('Failed to update transaction:', error);
    if (error?.data?.errors) {
      const errors = error.data.errors;
      errorMessage.value = Object.entries(errors)
        .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
        .join('; ');
    } else if (error?.data?.message) {
      errorMessage.value = error.data.message;
    } else if (error?.message) {
      errorMessage.value = error.message;
    } else {
      errorMessage.value = t('Failed to update transaction. Please check all fields.');
    }
  }
};

const loadTransaction = async () => {
  const transactionId = route.params.id;
  if (!transactionId) return;

  try {
    isLoadingTransaction.value = true;
    errorMessage.value = '';

    transactionToEdit.value = await getTransactionForEdit(transactionId);
  } catch (error) {
    console.error('Failed to load transaction:', error);
    errorMessage.value = t('Failed to load transaction for editing.'); // Localize error message
  } finally {
    isLoadingTransaction.value = false;
  }
};

onMounted(() => {
  loadTransaction();
});

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.edit-form-section {
  display: flex;
  margin-top: 20px;
  gap: 60px;
  width: 100%;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 20px;
  justify-content: center;

  @media (max-width: $breakpoint-lg) {
    gap: 40px;
  }

  @media (max-width: $breakpoint-md) {
    flex-direction: column;
    gap: 30px;
    padding: 0 15px;
  }

  @media (max-width: $breakpoint-sm) {
    gap: 20px;
    padding: 0 10px;
  }
}
</style>
