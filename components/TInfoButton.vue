<template>
  <div class="info-button">
    <InformationCircleIcon class="info-icon" />
  </div>
</template>

<script setup>
import { InformationCircleIcon } from '@heroicons/vue/24/outline';
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.info-button {
  width: 48px;
  height: 34px;
  top: 48px;
  border-radius: $radius-lg;
  background-color: #dfe1e4;
  padding: 8px 13px 8px 13px;
  gap: 8px;
}

.info-icon {
  width: 20px;
  height: 20px;
}
</style>
