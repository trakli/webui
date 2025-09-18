<template>
  <div class="card-container">
    <h1 v-if="user" class="card-title">
      Welcome, <span class="card-title-username">{{ user.first_name }} {{ user.last_name }}</span>
    </h1>
    <span class="card-subtitle">Are you ready to start track your money?</span>
  </div>
</template>

<script setup>
import { useAuth } from '@/composables/useAuth';

const { user } = useAuth();
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.card-container {
  width: 100%;
  background-color: #e6f2ec;
  border-radius: $radius-xl;
  padding: 0.75rem 1rem;
  margin: 0;
  box-sizing: border-box;
}

.card-title {
  color: #1d3229;
  font-size: $font-size-lg;
  font-weight: $font-bold;
  margin: 0 0 4px 0;
}

.card-title-username {
  color: $primary-hover;
  font-size: $font-size-lg;
  font-weight: $font-bold;
}

.card-subtitle {
  color: $text-muted;
  font-weight: $font-normal;
  font-size: $font-size-sm;
}
</style>
