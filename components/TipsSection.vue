<template>
  <div class="tips-container">
    <div class="tips-content">
      <div class="tips-header">
        <h2 class="tips-title">Tips for adding {{ pageName.toLowerCase() }}</h2>
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
  width: 380px;
  min-height: 500px;
  background-color: #fff4e6;
  padding: 2rem;
  border-radius: $radius-lg;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: sticky;
  top: 2rem;
  margin: 0;
  align-self: flex-start;

  // Hide on tablet and below
  @media (max-width: $breakpoint-lg) {
    display: none;
  }

  @media (max-width: 1200px) {
    width: 340px;
  }

  @media (max-width: $breakpoint-lg) {
    width: 320px;
    min-height: 450px;
    padding: 1.5rem;
  }

  @media (max-width: $breakpoint-md) {
    width: 100%;
    min-height: auto;
    position: static;
    padding: 1.25rem;
  }
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

  @media (max-width: $breakpoint-lg) {
    font-size: 1.5rem;
  }

  @media (max-width: $breakpoint-md) {
    font-size: 1.25rem;
  }
}

.tips-text-content {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.tips-text {
  color: #4a5253;
  line-height: 1.4;
  font-size: $font-size-lg;
  font-weight: $font-normal;

  @media (max-width: $breakpoint-lg) {
    font-size: $font-size-base;
  }
}

.tips-footer {
  display: flex;
  justify-content: right;
  align-items: flex-end;
  margin-top: 2rem;

  @media (max-width: $breakpoint-md) {
    margin-top: 1.5rem;
  }
}

.bulb-image {
  width: 160px;
  height: auto;
  object-fit: contain;

  @media (max-width: $breakpoint-lg) {
    width: 140px;
  }

  @media (max-width: $breakpoint-md) {
    width: 120px;
  }
}
</style>
