<template>
  <div class="card-container">
    <h1 class="card-title">Welcome, <span class="card-title-username">Nde-Fru Che-boy </span></h1>
    <span class="card-subtitle">Are you ready to start track your money?</span>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
@use '~/assets/_variables' as *;

.card-container {
  width: 992px;
  height: 70px;
  background-color: #e6f2ec;
  border-radius: $radius-xl;
  padding: 16px;
  margin-top: 25px;
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
