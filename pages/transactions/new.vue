<template>
  <div>
    <TTopCard
      page-name="Transaction"
      page-name-plural="Transactions"
      :show-add-button="false"
      :breadcrumb-items="[
        { text: 'Home', clickable: false },
        { text: 'Transactions', clickable: true, action: 'back' },
        { text: 'New Transaction', current: true }
      ]"
      @back="$router.push('/transactions')"
    />
    <div v-if="errorMessage" class="error-message">
      <strong>{{ t('Error:') }}</strong> {{ errorMessage }}
    </div>
    <TransactionFormSection @submit="handleSubmit" @transfer="handleTransfer" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'nuxt/app';
import { useTransactions } from '@/composables/useTransactions';
import { useSharedData } from '@/composables/useSharedData';
import transfersApi from '@/services/api/transfersApi';
import TTopCard from '@/components/TTopCard.vue';
import TransactionFormSection from '@/components/TransactionFormSection.vue';

const { t } = useI18n();

const router = useRouter();
const { addTransaction, refreshTransactions } = useTransactions();
const sharedData = useSharedData();

const errorMessage = ref('');

const handleSubmit = async (data) => {
  errorMessage.value = '';
  try {
    await addTransaction(data);
    router.push('/transactions');
  } catch (error) {
    console.error('Failed to add transaction:', error);
    handleError(error);
  }
};

const handleTransfer = async (data) => {
  errorMessage.value = '';
  try {
    await transfersApi.create(data);
    await sharedData.loadWallets(true);
    await refreshTransactions();
    router.push('/transactions');
  } catch (error) {
    console.error('Failed to create transfer:', error);
    handleError(error);
  }
};

const handleError = (error: any) => {
  const errors = error?.data?.errors;
  const hasErrors =
    errors && (Array.isArray(errors) ? errors.length > 0 : Object.keys(errors).length > 0);

  if (hasErrors) {
    errorMessage.value = Object.entries(errors)
      .map(
        ([field, messages]) =>
          `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`
      )
      .join('; ');
  } else if (error?.data?.message) {
    errorMessage.value = error.data.message;
  } else if (error?.message) {
    errorMessage.value = error.message;
  } else {
    errorMessage.value = t('Operation failed. Please check all fields.');
  }
};

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.error-message {
  max-width: 800px;
  margin: 20px auto;
  padding: 16px;
  background: rgba(var(--color-error-rgb), 0.1);
  border: 1px solid $error-color;
  border-radius: $radius-lg;
  color: $error-color;
}
</style>
