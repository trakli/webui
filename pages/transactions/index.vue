<template>
  <div>
    <TTopCard />
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
  layout: 'dashboard'
});
/* eslint-enable no-undef */
</script>

<style lang="scss" scoped>
.table-wrapper {
  margin-top: 40px;
}
</style>
