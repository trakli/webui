<template>
  <div>
    <TTopCard
      pageName="Transaction"
      pageNamePlural="Transactions"
      :showAddButton="false"
      :breadcrumbItems="[
        { text: 'Home', clickable: false },
        { text: 'Transactions', clickable: true, action: 'back' },
        { text: 'New Transaction', current: true }
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
      <strong>Error:</strong> {{ errorMessage }}
    </div>
    <TransactionFormSection @submit="handleSubmit" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'nuxt/app';
import { useTransactions } from '@/composables/useTransactions';
import TTopCard from '@/components/TTopCard.vue';
import TransactionFormSection from '@/components/TransactionFormSection.vue';

const router = useRouter();
const { addTransaction } = useTransactions();

const errorMessage = ref('');

const handleSubmit = async (data) => {
  errorMessage.value = '';
  try {
    await addTransaction(data);
    router.push('/transactions');
  } catch (error) {
    console.error('Failed to add transaction:', error);
    if (error?.data?.errors) {
      const errors = error.data.errors;
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
      errorMessage.value = 'Failed to create transaction. Please check all fields.';
    }
  }
};

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});
</script>
