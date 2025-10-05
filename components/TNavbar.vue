<template>
  <div class="navbar">
    <div class="navbar-left">
      <HamburgerMenu v-if="isMobile" :is-open="isSidebarOpen" @toggle="toggleSidebar" />
    </div>
    <div class="navbar-right">
      <div class="search-container">
        <TButton
          class="add-transaction-btn"
          size="small"
          text="Add transaction"
          to="/transactions/new"
        >
          <template #left-icon>
            <PlusIcon />
          </template>
        </TButton>
        <button class="icon-button">
          <BellIcon class="icon" />
        </button>
        <button class="icon-button">
          <MagnifyingGlassIcon class="icon" />
        </button>
        <LanguageSelector />
      </div>
      <div class="avatar-container">
        <TAvatar v-if="user" :image-url="getAvatarUrl(user)" :show-dropdown="true" />
      </div>
    </div>
  </div>
</template>

<script setup>
import TAvatar from './TAvatar.vue';
import TButton from './TButton.vue';
import LanguageSelector from './LanguageSelector.vue';
import HamburgerMenu from './HamburgerMenu.vue';
import { MagnifyingGlassIcon, BellIcon, PlusIcon } from '@heroicons/vue/24/outline';
import { useAuth } from '@/composables/useAuth';
import { useAvatar } from '@/composables/useAvatar';
import { useSidebar } from '@/composables/useSidebar';

const { user } = useAuth();
const { getAvatarUrl } = useAvatar();
const { isSidebarOpen, isMobile, toggleSidebar } = useSidebar();
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: $navbar-height;
  padding: 0 2rem;
  background-color: $bg-gray;
  border-bottom: 1px solid #e9ecef;
  position: fixed;
  top: 0;
  right: 0;
  z-index: $z-index-sticky;
  transition: left 0.3s ease;

  // Desktop - account for sidebar
  @media (min-width: $breakpoint-md) {
    left: $sidebar-width;
    padding: 0 2rem;
  }

  // Mobile - full width
  @media (max-width: #{$breakpoint-md - 1px}) {
    left: 0;
    padding: 0 1rem;
  }

  @media (max-width: $breakpoint-sm) {
    padding: 0 0.75rem;
  }

  .navbar-left {
    display: flex;
    align-items: center;

    @media (min-width: $breakpoint-md) {
      display: none;
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

  .search-container {
    display: flex;
    flex-direction: row;
    gap: 16px;
    position: relative;
    width: 396px;

    @media (max-width: #{$breakpoint-lg - 1px}) {
      width: auto;
      gap: 8px;
    }

    @media (max-width: #{$breakpoint-md - 1px}) {
      width: auto;
      gap: 6px;
    }

    @media (max-width: $breakpoint-sm) {
      gap: 8px;

      // Hide Add Transaction button and search icon on mobile
      .add-transaction-btn,
      .icon-button:last-child {
        display: none;
      }
    }
  }

  .icon {
    width: 20px;
    height: 20px;
    color: #1d3229;
  }

  .icon-button {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 8px;
    width: 36px;
    height: $navbar-icon-button-height;
    border-radius: $radius-lg;
    background-color: #dee1e0;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease;

    @media (max-width: $breakpoint-sm) {
      width: 32px;
      height: 32px;
      padding: 6px;
    }

    &:hover {
      background-color: #d0d3d2;
    }
  }

  .avatar-container {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-shrink: 0;
  }

  .add-transaction-btn {
    text-decoration: none !important;

    &:hover {
      text-decoration: none !important;
    }
  }
}
</style>
