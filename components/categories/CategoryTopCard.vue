<template>
  <div class="card-container">
    <div class="card-header">
      <div class="card-content">
        <h1 class="card-title">Add Category</h1>
        <div class="card-subtitle-text">
          <span class="card-subtitle-green-text">Home </span>
          <span class="arrow-text"> > </span>
          <span class="card-subtitle-green-text">Categories </span>
          <span class="arrow-text"> > </span>
          <span class="card-subtitle-black-text"> Add Category</span>
        </div>
      </div>
      <div class="card-button-container">
        <TInfoButton />
        <TButton text="Add Category +" class="add-category-button" @click="$emit('add')" />
      </div>
    </div>
  </div>
</template>

<script setup>
import TInfoButton from './../TInfoButton.vue';
import TButton from './../TButton.vue';
</script>

<style lang="scss" scoped>
@use '~/assets/_variables' as *;

.card-container {
  width: 100%;
  background-color: #e6f2ec;
  border-radius: $radius-xl;
  padding: 0.75rem 1rem;
  margin: 0;
  box-sizing: border-box;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.card-content {
  flex: 1;
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

.card-subtitle-text {
  display: flex;
  flex-direction: row;
  gap: 4px;
}

.card-subtitle-green-text {
  color: $primary;
  font-weight: $font-normal;
  font-size: $font-size-sm;
}

.arrow-text {
  color: $text-secondary;
  font-weight: $font-normal;
  font-size: $font-size-sm;
}

.card-subtitle-black-text {
  color: $text-primary;
  font-weight: $font-normal;
  font-size: $font-size-sm;
}

.card-button-container {
  display: flex;
  gap: 8px;
}

.add-category-button {
  width: 162px;
  height: 34px;
  font-size: $font-size-sm;
  font-weight: $font-semibold;
}
</style>
 