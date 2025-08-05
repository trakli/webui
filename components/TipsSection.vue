<template>
  <div class="tips-container">
    <div class="tips-content">
      <div class="tips-header">
        <h1 class="tips-title">Tips for adding {{ pageName.toLowerCase() }}</h1>
      </div>
      <div class="tips-text-content">
        <p class="tips-text">
          Always check everything before submitting a new {{ pageName.toLowerCase() }}.
        </p>
      </div>
    </div>
    <div class="tips-footer">
      <img src="/bulbIcon.svg" alt="Bulb Icon" class="bulb-image" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  pageName: {
    type: String,
    required: true
  }
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.tips-container {
  width: 500px;
  min-height: 500px;
  background-color: #fff4e6;
  padding: 2rem;
  border-radius: $radius-lg;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: sticky;
  top: 2rem;
  margin: 0 $spacing-12;
  align-self: flex-start;
}

.tips-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.tips-title {
  color: #ff9500;
  font-weight: $font-bold;
  font-size: 1.75rem;
  line-height: 120%;
}

.tips-text-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.tips-text {
  color: #4a5253;
  line-height: 120%;
  font-size: $font-size-lg;
  font-weight: $font-normal;
}

.tips-footer {
  display: flex;
  justify-content: right;
  align-items: flex-end;
  margin-top: 2rem;
}

.bulb-image {
  width: 180px;
  height: auto;
  object-fit: contain;
}
</style>
