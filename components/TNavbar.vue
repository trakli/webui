<template>
  <div class="navbar">
    <div class="navbar-right">
      <div class="search-container">
        <TButton size="small" text="Add Transaction +" type="button" />
        <button class="search-button">
          <BellIcon class="search-icon" />
        </button>
        <button class="search-button">
          <MagnifyingGlassIcon class="search-icon" />
        </button>
        <button class="language-button">
          <span class="language-text">English</span>
          <img src="~/public/greatBritain.svg" alt="Language Icon" />
          <ChevronDownIcon class="search-icon" />
        </button>
      </div>
      <div class="avatar-container">
        <TAvatar width="266px" height="44px" />
      </div>
    </div>
  </div>
</template>

<script setup>
import TAvatar from './TAvatar.vue';
import TButton from './TButton.vue';
import { MagnifyingGlassIcon, BellIcon, ChevronDownIcon } from '@heroicons/vue/24/outline';
</script>

<style lang="scss" scoped>
@use '~/assets/_variables' as *;

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
  padding: 0 24px;
  background-color: $bg-gray;
  border-bottom: 1px solid #e9ecef;
  position: fixed;
  top: 0;
  right: 0;
  left: 328px;
  z-index: 10;
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-left: auto;
}

.search-container {
  display: flex;
  flex-direction: row;
  gap: 16px;
  position: relative;
  width: 396px;
}

.search-icon {
  width: 20px;
  height: 20px;
  color: #1d3229;
}

.search-button {
  display: flex;
  justify-content: center;
  padding: 8px;
  width: 36px;
  height: 36px;
  border-radius: $radius-lg;
  background-color: #dee1e0;
}

.language-button {
  display: flex;
  justify-content: center;
  padding: 8px;
  width: 114px;
  height: 36px;
  border-radius: $radius-lg;
  gap: 8px;
  background-color: #dee1e0;
}

.language-text {
  color: #000000;
  font-size: 14px;
  font-weight: $font-bold;
  text-align: center;
}

.avatar-container {
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
