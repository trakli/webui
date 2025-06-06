<template>
  <div class="tips-container">
    <div class="tips-header">
      <h1 class="tips-title">Tip of adding transaction</h1>
    </div>
    <div class="tips-content">
      <p class="tips-text">Always check</p>
      <p class="tips-text">everything before</p>
      <p class="tips-text">choose to submit a Trip</p>
      <p class="tips-text">or not.</p>
    </div>
    <div class="tips-footer">
      <img src="/public/bulbIcon.svg" alt="Bulb Icon" class="bulb-image" />
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss" scoped>
@use '~/assets/_variables' as *;

.tips-container {
  width: 350px;
  height: 570px;
  background-color: #fff4e6;
  padding: 32px;
  border-radius: $radius-lg;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tips-header {
  width: 233px;
  height: 58px;
}

.tips-title {
  color: #ff9500;
  font-weight: $font-bold;
  font-size: 30px;
  line-height: 120%;
}

.tips-content {
  margin-top: 20px;
}

.tips-text {
  color: #4a5253;
  line-height: 100%;
  font-size: $font-size-xl;
  font-weight: $font-normal;
}

.tips-footer {
  display: flex;
  justify-content: center;
}

.bulb-image {
  width: 223px;
  height: 234.7px;
  gap: 8px;
}
</style>
