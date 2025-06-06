<template>
  <div class="transaction-content">
    <TTopCard />
    <TransactionFormSection />
    <div class="footer-section">
      <TFooter />
    </div>
  </div>
</template>

<script setup>
import TTopCard from './TTopCard.vue';
import TransactionFormSection from './TransactionFormSection.vue';
</script>

<style lang="scss" scoped>
@use '~/assets/_variables' as *;

.transaction-content {
  width: calc(100% - 1.5rem);
  max-width: 1200px;
  min-height: 100vh;
  background-color: $bg-white;
  border-radius: 2rem;
  border: 1px solid $bg-gray;
  margin: 0 1.5rem 1rem;
  padding: 1.5rem;
  box-sizing: border-box;
  overflow: hidden;

  @media (min-width: 768px) {
    padding: 1.25rem;
  }

  &-container {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 0.5rem;
    margin: 0;
    padding: 0;
  }
}

.footer-section {
  display: flex;
  justify-content: center;
  margin-top: 10rem;
}
</style>
