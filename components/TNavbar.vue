<template>
  <div class="navbar">
    <div class="navbar-left">
      <HamburgerMenu v-if="isMobile" :is-open="isSidebarOpen" @toggle="toggleSidebar" />
    </div>
    <div class="navbar-right">
      <div class="navbar-actions">
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
        <LanguageSelector />
        <button
          class="icon-button info-btn"
          aria-label="Open learning modal"
          title="Learn how to use Trakli"
          @click="openLearningModal"
          @keydown.enter="openLearningModal"
          @keydown.space.prevent="openLearningModal"
        >
          <InformationCircleIcon class="icon" />
        </button>
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
import { PlusIcon, InformationCircleIcon } from '@heroicons/vue/24/outline';
import { useAuth } from '@/composables/useAuth';
import { useAvatar } from '@/composables/useAvatar';
import { useSidebar } from '@/composables/useSidebar';

import { inject } from 'vue';

const { user } = useAuth();
const { getAvatarUrl } = useAvatar();
const { isSidebarOpen, isMobile, toggleSidebar } = useSidebar();

const learningModal = inject('learningModal', null);

const openLearningModal = () => {
  if (learningModal?.open) {
    learningModal.open();
  } else {
    console.warn('Learning modal not available in this layout');
  }
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;
@use '@/assets/scss/_utilities.scss' as *;

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

  .navbar-actions {
    display: flex;
    align-items: center;
    gap: 0.5rem;

    @media (max-width: $breakpoint-sm) {
      .add-transaction-btn {
        display: none;
      }
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

  .info-btn {
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: -2px;
      right: -2px;
      width: 8px;
      height: 8px;
      background: $primary;
      border-radius: 50%;
      border: 2px solid $bg-gray;
    }

    &:hover {
      .icon {
        color: $primary;
      }
    }
  }
}
</style>
