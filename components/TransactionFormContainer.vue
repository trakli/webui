<template>
  <div class="form-container">
    <TransactionForm
      :is-outcome-selected="isOutcomeSelected"
      :editingItem="editingItem"
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import TransactionForm from './TransactionForm.vue';

defineProps({
  editingItem: { type: Object, default: null },
  isOutcomeSelected: { type: Boolean, default: false }
});

const emit = defineEmits(['submit']);

const handleSubmit = (data) => {
  emit('submit', data);
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.form-container {
  width: 100%;
  min-height: 600px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  background-color: $bg-gray;
  border-radius: $radius-xl;
  padding: 24px;

  @media (max-width: $breakpoint-lg) {
    padding: 20px;
  }

  @media (max-width: $breakpoint-md) {
    padding: 16px;
    min-height: auto;
  }

  @media (max-width: $breakpoint-sm) {
    padding: 12px;
    border-radius: $radius-lg;
  }
}
</style>
