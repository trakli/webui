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
@use '@/assets/scss/_variables.scss' as *;

.navbar {
  --sidebar-width: min(300px, 30vw);
  --sidebar-min-width: 200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 65px;
  padding: 0 5rem;
  background-color: $bg-gray;
  border-bottom: 1px solid #e9ecef;
  position: fixed;
  top: 0;
  right: 0;
  left: var(--sidebar-width, 300px);
  z-index: 10;
  transition: left 0.3s ease;

  @media (max-width: 1200px) {
    left: 250px;
  }

  @media (max-width: 992px) {
    left: 200px;
  }

  @media (max-width: 768px) {
    left: 0;
    padding: 0 1rem;
  }
}

.navbar-right {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;

  @media (max-width: 768px) {
    gap: 0.75rem;
  }
}

.avatar-container {
  @media (max-width: 480px) {
    display: none;
  }
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
