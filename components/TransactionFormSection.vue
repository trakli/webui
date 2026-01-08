<template>
  <div class="form-section">
    <FormSection :editing-item="editingItem" @submit="handleSubmit" />
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
  }
});

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
