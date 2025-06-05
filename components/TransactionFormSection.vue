<template>
  <div class="form-section">
    <FormSection />
    <TipsSection />
  </div>
</template>

<script setup>
import FormSection from './FormSection.vue';
import TipsSection from './TipsSection.vue';
</script>

<style lang="scss" scoped>
@use '~/assets/_variables' as *;

.form-section {
  display: flex;
  margin-top: 20px;
  gap: 60px;
}
</style>
