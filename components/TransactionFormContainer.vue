<template>
  <div class="form-container">
    <TransactionForm
      :is-outcome-selected="isOutcomeSelected"
      :editing-item="editingItem"
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
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
  background: $bg-white;
  border-radius: $radius-xl;
  border: 1px solid $border-color;
  box-shadow: $shadow-md;
  padding: 1.5rem;

  @media (max-width: $breakpoint-md) {
    padding: 1.25rem;
  }

  @media (max-width: $breakpoint-sm) {
    padding: 1rem;
    border-radius: $radius-lg;
  }
}
</style>
