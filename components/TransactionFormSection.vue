<template>
  <div class="form-section">
    <FormSection
      :editing-item="editingItem"
      :is-submitting="isSubmitting"
      @submit="handleSubmit"
      @transfer="handleTransfer"
    />
    <TipsSection page-name="Transaction" />
  </div>
</template>

<script setup>
import FormSection from './FormSection.vue';
import TipsSection from './TipsSection.vue';

defineProps({
  editingItem: {
    type: Object,
    default: null
  },
  isSubmitting: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['submit', 'transfer']);

const handleSubmit = (data) => {
  emit('submit', data);
};

const handleTransfer = (data) => {
  emit('transfer', data);
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.form-section {
  display: flex;
  margin-top: 20px;
  gap: 60px;
  width: 100%;
  padding: 0;

  @media (max-width: $breakpoint-lg) {
    gap: 40px;
  }

  @media (max-width: $breakpoint-md) {
    flex-direction: column;
    gap: 30px;
  }

  @media (max-width: $breakpoint-sm) {
    gap: 20px;
  }
}
</style>
