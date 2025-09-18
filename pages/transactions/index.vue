<template>
  <div>
    <TTopCard pageName="Transaction" pageNamePlural="Transactions" />
    <div class="table-wrapper">
      <TTableComponent />
    </div>
  </div>
</template>

<script setup>
import TTopCard from '@/components/TTopCard.vue';
import TTableComponent from '@/components/TTableComponent.vue';

/* eslint-disable no-undef */
definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});
/* eslint-enable no-undef */
</script>

<style lang="scss" scoped>
.table-wrapper {
  margin-top: 40px;
}
</style>
