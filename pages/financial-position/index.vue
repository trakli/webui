<template>
  <div class="financial-position-page">
    <FinancialPositionView />
  </div>
</template>

<script setup lang="ts">
import FinancialPositionView from '@/components/financial-position/FinancialPositionView.vue';

definePageMeta({ layout: 'dashboard', middleware: 'auth' });
</script>

<style lang="scss" scoped>
.financial-position-page {
  width: 100%;
}
</style>
