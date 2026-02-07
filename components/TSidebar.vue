<template>
  <div v-if="isMobile && isSidebarOpen" class="sidebar-overlay" @click="closeSidebar" />

  <div
    class="sidebar"
    :class="{
      'sidebar--mobile-open': isMobile && isSidebarOpen,
      'sidebar--mobile-closed': isMobile && !isSidebarOpen
    }"
  >
    <div class="sidebar-header">
      <Logo size="small" alt="Trakli Logo" />
      <button
        v-if="isMobile && isSidebarOpen"
        class="close-button"
        aria-label="Close navigation menu"
        @click="closeSidebar"
      >
        <XMarkIcon class="close-icon" />
      </button>
    </div>
    <nav class="sidebar-nav">
      <ul>
        <li>
          <NuxtLink
            to="/dashboard"
            class="nav-button"
            active-class="selected"
            @click="handleNavClick"
          >
            <HomeIcon class="icon" />
            <span class="text">{{ t('Home') }}</span>
          </NuxtLink>
        </li>

        <li>
          <NuxtLink
            to="/transactions"
            class="nav-button"
            active-class="selected"
            @click="handleNavClick"
          >
            <RectangleGroupIcon class="icon" />
            <span class="text">{{ t('Transactions') }}</span>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/categories"
            class="nav-button"
            active-class="selected"
            @click="handleNavClick"
          >
            <BuildingLibraryIcon class="icon" />
            <span class="text">{{ t('Categories') }}</span>
            <div class="nav-tooltip">{{ t('Organize your transactions') }}</div>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/groups" class="nav-button" active-class="selected" @click="handleNavClick">
            <UserGroupIcon class="icon" />
            <span class="text">{{ t('Groups') }}</span>
            <div class="nav-tooltip">{{ t('Group transactions into logical buckets') }}</div>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/parties"
            class="nav-button"
            active-class="selected"
            @click="handleNavClick"
          >
            <UserGroupIcon class="icon" />
            <span class="text">{{ t('Parties') }}</span>
            <div class="nav-tooltip">
              {{ t('People and organizations with whom you transact') }}
            </div>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/wallets"
            class="nav-button"
            active-class="selected"
            @click="handleNavClick"
          >
            <WalletIcon class="icon" />
            <span class="text">{{ t('Wallets') }}</span>
            <div class="nav-tooltip">{{ t('Accounts you spend from or receive into') }}</div>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink
            to="/reminders"
            class="nav-button"
            active-class="selected"
            @click="handleNavClick"
          >
            <BellIcon class="icon" />
            <span class="text">{{ t('Reminders') }}</span>
            <div class="nav-tooltip">{{ t('Accountability transactions') }}</div>
          </NuxtLink>
        </li>
      </ul>
    </nav>
    <hr class="divider" />
    <div class="nav-footer">
      <ul>
        <li>
          <button
            class="nav-footer-button"
            :class="{ selected: $route.path === '/reports' }"
            @click="handleButtonNavClick('/reports')"
          >
            <Cog8ToothIcon class="icon" />
            <span class="text">{{ t('Reports & Stats') }}</span>
          </button>
        </li>
        <li>
          <button
            class="nav-footer-button"
            :class="{ selected: $route.path === '/ai-insights' }"
            @click="handleButtonNavClick('/ai-insights')"
          >
            <ChatBubbleLeftRightIcon class="icon" />
            <span class="text">{{ t('AI Insights') }}</span>
          </button>
        </li>
        <li>
          <button
            class="nav-footer-button"
            :class="{ selected: $route.path === '/settings' }"
            @click="handleButtonNavClick('/settings')"
          >
            <Cog8ToothIcon class="icon" />
            <span class="text">{{ t('Settings') }}</span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import {
  BellIcon,
  BuildingLibraryIcon,
  ChatBubbleLeftRightIcon,
  Cog8ToothIcon,
  HomeIcon,
  RectangleGroupIcon,
  UserGroupIcon,
  WalletIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';
import Logo from './Logo.vue';
import { useSidebar } from '@/composables/useSidebar';
import { useRouter } from 'vue-router';

const { t } = useI18n();

const { isSidebarOpen, isMobile, closeSidebar } = useSidebar();
const router = useRouter();

// Handle navigation link clicks (NuxtLink components)
const handleNavClick = () => {
  // Only close sidebar on mobile
  if (isMobile.value) {
    closeSidebar();
  }
};

// Handle button navigation clicks
const handleButtonNavClick = (path) => {
  router.push(path);
  // Only close sidebar on mobile
  if (isMobile.value) {
    closeSidebar();
  }
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.sidebar {
  width: $sidebar-width;
  height: 100vh;
  background-color: $bg-gray;
  border-right: 1px solid $border-color;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  transition:
    transform 0.3s ease,
    width 0.3s ease;
  display: flex;
  flex-direction: column;
  z-index: $z-index-fixed;

  // Desktop behavior
  @media (min-width: $breakpoint-md) {
    transform: translateX(0);
  }

  // Mobile behavior
  @media (max-width: #{$breakpoint-md - 1px}) {
    width: $sidebar-mobile-width;
    transform: translateX(-100%);
    z-index: $z-index-modal;

    &--mobile-open {
      transform: translateX(0);
    }

    &--mobile-closed {
      transform: translateX(-100%);
    }
  }

  &-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 16px;
    width: calc(100% - 32px);
    padding: 0;
  }

  &-nav {
    flex-grow: 1;
    width: 100%;
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      width: 100%;
    }
    li {
      width: 100%;
    }
  }

  .nav-button {
    display: flex;
    align-items: center;
    width: calc(100% - 20px);
    height: 56px;
    border-radius: $radius-xl;
    padding: 16px 8px;
    gap: 12px;
    background-color: transparent;
    border: none;
    color: $text-secondary;
    text-align: left;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-left: 10px;
    position: relative;

    &:hover:not(.selected) {
      background-color: rgba(var(--color-primary-rgb), 0.15);
      margin: 2px 10px;
      height: 52px;
    }

    /* Show tooltip on hover */
    &:hover .nav-tooltip {
      opacity: 1;
      visibility: visible;
      transform: translateY(-50%) translateX(10px);
    }

    &.selected {
      background-color: $primary-light;
    }
  }

  .nav-tooltip {
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%) translateX(0);
    background: $bg-card;
    color: $text-primary;
    padding: 6px 12px;
    border-radius: 8px;
    font-size: 0.75rem;
    white-space: nowrap;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: $shadow-md;
    border: 1px solid $border-color;
    margin-left: 5px;
    z-index: 1000;

    &::after {
      content: '';
      position: absolute;
      left: -6px;
      top: 50%;
      transform: translateY(-50%);
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      border-right: 6px solid $border-color;
    }

    &::before {
      content: '';
      position: absolute;
      left: -5px;
      top: 50%;
      transform: translateY(-50%);
      border-top: 5px solid transparent;
      border-bottom: 5px solid transparent;
      border-right: 5px solid $bg-card;
      z-index: 1;
    }
  }

  .icon {
    width: 24px;
    height: 24px;
  }

  .close-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: $radius-lg;
    background-color: transparent;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba(var(--color-primary-rgb), 0.15);
    }

    &:focus {
      outline: none;
      background-color: rgba(var(--color-primary-rgb), 0.15);
    }
  }

  .close-icon {
    width: 20px;
    height: 20px;
    color: $text-primary;
  }

  .divider {
    display: flex;
    justify-items: center;
    border: 1px solid $border-light;
    width: calc(#{$sidebar-width} - 20px);
    margin-left: 10px;
    margin-top: 20px;

    @media (max-width: #{$breakpoint-md - 1px}) {
      width: calc(#{$sidebar-mobile-width} - 20px);
    }
  }

  .nav-footer {
    display: flex;
    width: calc(100% - 16px);
    padding: 8px;
    gap: 8px;
    flex-direction: column;

    ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
  }

  .nav-footer-button {
    display: flex;
    align-items: center;
    width: calc(100% - 20px);
    min-height: 56px;
    border-radius: $radius-xl;
    padding: 12px 16px;
    gap: 12px;
    background-color: transparent;
    border: none;
    color: $text-secondary;
    text-align: left;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-left: 10px;
    margin-top: 10px;

    &:hover:not(.selected) {
      background-color: rgba(var(--color-primary-rgb), 0.15);
      margin: 12px 10px 8px;
      min-height: 52px;
    }

    &.selected {
      background-color: $primary-light;
    }
  }
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: $z-index-modal-backdrop;
  backdrop-filter: blur(2px);
}
</style>
