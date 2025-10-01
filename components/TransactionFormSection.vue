<template>
  <div class="form-section">
    <FormSection @submit="handleSubmit" />
    <TipsSection pageName="Transaction" />
  </div>
</template>

<script setup>
import FormSection from './FormSection.vue';
import TipsSection from './TipsSection.vue';
import { defineEmits } from 'vue';

const emit = defineEmits(['submit']);

const handleSubmit = (data) => {
  emit('submit', data);
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.form-section {
  display: flex;
  margin-top: 20px;
  gap: 60px;
  width: 100%;
  max-width: 1400px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 20px;

  @media (max-width: $breakpoint-lg) {
    gap: 40px;
  }

  @media (max-width: $breakpoint-md) {
    flex-direction: column;
    gap: 30px;
    padding: 0 15px;
  }

  @media (max-width: $breakpoint-sm) {
    gap: 20px;
    padding: 0 10px;
  }
}
</style>
