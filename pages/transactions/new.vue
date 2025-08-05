<template>
  <div>
    <TTopCard pageName="Transaction" pageNamePlural="Transactions" />
    <TransactionFormSection />
  </div>
</template>

<script setup>
import TTopCard from '@/components/TTopCard.vue';
import TransactionFormSection from '@/components/TransactionFormSection.vue';

/* eslint-disable no-undef */
definePageMeta({
  layout: 'dashboard'
});
/* eslint-enable no-undef */
</script>
