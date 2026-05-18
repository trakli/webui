<template>
  <div v-if="isMobile && isSidebarOpen" class="sidebar-overlay" @click="closeSidebar" />

  <div
    class="sidebar"
    :class="{
      'sidebar--compact': isCompact,
      'sidebar--mobile-open': isMobile && isSidebarOpen,
      'sidebar--mobile-closed': isMobile && !isSidebarOpen
    }"
  >
    <div class="sidebar-header">
      <NuxtLink to="/dashboard" class="sidebar-brand" :aria-label="t('Home')">
        <img v-if="isCompact" src="/logo-mark.svg" alt="Trakli" class="sidebar-brand__mark" />
        <Logo v-else size="small" alt="Trakli Logo" />
      </NuxtLink>

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
        <li v-for="item in primary" :key="item.to">
          <NuxtLink
            :to="item.to"
            class="nav-button"
            :class="{
              'nav-button--with-subtext': !isCompact && item.hint,
              'nav-button--compact': isCompact
            }"
            active-class="selected"
            :title="isCompact ? `${t(item.label)} — ${t(item.hint ?? '')}` : undefined"
            @click="handleNavClick"
          >
            <component :is="item.icon" class="icon" />
            <div v-if="!isCompact && item.hint" class="nav-copy">
              <span class="text">{{ t(item.label) }}</span>
              <span class="subtext">{{ t(item.hint) }}</span>
            </div>
            <span v-else-if="!isCompact" class="text">{{ t(item.label) }}</span>
            <span v-else class="compact-label">{{ t(item.label) }}</span>
          </NuxtLink>

          <ul v-if="!isCompact && item.subItems && isActive(item.to)" class="sub-list">
            <li v-for="sub in item.subItems" :key="sub.label">
              <NuxtLink
                :to="sub.query ? { path: item.to, query: sub.query } : item.to"
                class="sub-link"
                :class="{ selected: isSubActive(item.to, sub) }"
                @click="handleNavClick"
              >
                <span class="dot" :class="`dot--${sub.tone}`" />
                <span>{{ t(sub.label) }}</span>
              </NuxtLink>
            </li>
          </ul>
        </li>
      </ul>
    </nav>

    <hr v-if="!isCompact" class="divider" />

    <div class="nav-footer">
      <ul>
        <li v-for="item in footer" :key="item.to">
          <button
            class="nav-footer-button"
            :class="{
              selected: $route.path === item.to,
              'nav-footer-button--compact': isCompact
            }"
            :title="isCompact ? t(item.label) : undefined"
            @click="handleButtonNavClick(item.to)"
          >
            <component :is="item.icon" class="icon" />
            <span v-if="!isCompact" class="text">{{ t(item.label) }}</span>
            <span v-else class="compact-label">{{ t(item.shortLabel ?? item.label) }}</span>
          </button>
        </li>
      </ul>
    </div>

    <button
      v-if="!isMobile"
      type="button"
      class="collapse-toggle"
      :class="{ 'collapse-toggle--compact': isCompact }"
      :aria-label="t(isCompact ? 'Expand sidebar' : 'Collapse sidebar')"
      @click="toggleCollapse"
    >
      <ChevronDoubleLeftIcon v-if="!isCompact" class="icon" />
      <ChevronDoubleRightIcon v-else class="icon" />
      <span v-if="!isCompact" class="text">{{ t('Collapse sidebar') }}</span>
    </button>
  </div>
</template>

<script setup>
import {
  ArrowUpTrayIcon,
  BellIcon,
  ChartBarIcon,
  ChartPieIcon,
  ChatBubbleLeftRightIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  Cog8ToothIcon,
  HomeIcon,
  RectangleGroupIcon,
  TagIcon,
  UserGroupIcon,
  UsersIcon,
  WalletIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline';
import { computed } from 'vue';
import Logo from './Logo.vue';
import { useSidebar } from '@/composables/useSidebar';
import { useRoute, useRouter } from 'vue-router';

const { t } = useI18n();
const {
  isSidebarOpen,
  isMobile,
  sidebarCollapsed: desktopCollapsed,
  closeSidebar,
  toggleCollapse
} = useSidebar();
const router = useRouter();
const route = useRoute();

// Compact mode only applies on desktop. Mobile always shows the full drawer
// content (icons + labels + subtexts) when the drawer is open.
const isCompact = computed(() => desktopCollapsed.value && !isMobile.value);

const primary = [
  { to: '/dashboard', label: 'Home', icon: HomeIcon },
  {
    to: '/transactions',
    label: 'Transactions',
    hint: 'All money movements in one place',
    icon: RectangleGroupIcon
  },
  {
    to: '/categories',
    label: 'Categories',
    hint: 'Organize transactions by type',
    icon: TagIcon
  },
  {
    to: '/groups',
    label: 'Groups',
    hint: 'Bundle related transactions',
    icon: UserGroupIcon
  },
  {
    to: '/parties',
    label: 'Parties',
    hint: 'People and organizations you transact with',
    icon: UsersIcon
  },
  {
    to: '/wallets',
    label: 'Wallets',
    hint: 'Accounts money moves through',
    icon: WalletIcon
  },
  {
    to: '/budgets',
    label: 'Budgets',
    hint: 'Set spending limits and track progress',
    icon: ChartPieIcon,
    subItems: [
      { label: 'All Budgets', tone: 'neutral' },
      { query: { scope: 'active' }, label: 'Active', tone: 'success' },
      { query: { scope: 'archived' }, label: 'Archived', tone: 'muted' }
    ]
  },
  {
    to: '/reminders',
    label: 'Reminders',
    hint: 'Track upcoming or expected transactions',
    icon: BellIcon
  },
  {
    to: '/imports',
    label: 'Import',
    hint: 'Import transactions from documents',
    icon: ArrowUpTrayIcon
  }
];

const footer = [
  { to: '/reports', label: 'Reports & Stats', shortLabel: 'Reports', icon: ChartBarIcon },
  { to: '/ai-insights', label: 'AI Insights', shortLabel: 'AI', icon: ChatBubbleLeftRightIcon },
  { to: '/settings', label: 'Settings', icon: Cog8ToothIcon }
];

const isActive = (path) => route.path === path || route.path.startsWith(path + '/');

const isSubActive = (parentTo, sub) => {
  if (route.path !== parentTo) return false;
  if (!sub.query) return !route.query.scope;
  const key = Object.keys(sub.query)[0];
  return String(route.query[key] ?? '') === String(sub.query[key]);
};

const handleNavClick = () => {
  if (isMobile.value) closeSidebar();
};

const handleButtonNavClick = (path) => {
  router.push(path);
  if (isMobile.value) closeSidebar();
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
  overflow: hidden;
  box-sizing: border-box;
  transition:
    width 0.25s ease,
    transform 0.3s ease;
  display: flex;
  flex-direction: column;
  z-index: $z-index-fixed;

  &--compact {
    width: $sidebar-rail-width;
  }

  @media (min-width: $breakpoint-md) {
    transform: translateX(0);
  }

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
    margin: 12px 16px;
    width: calc(100% - 32px);
    padding: 0;
    flex-shrink: 0;
  }

  &--compact .sidebar-header {
    margin: 16px 0;
    justify-content: center;
    width: 100%;
  }

  .sidebar-brand {
    display: flex;
    align-items: center;
    text-decoration: none;

    &__mark {
      width: 38px;
      height: 46px;
      display: block;
    }

    :deep(img.logo-small) {
      width: 115px !important;
    }
  }

  &-nav {
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding-bottom: 8px;
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
    min-height: 44px;
    border-radius: $radius-xl;
    padding: 8px 10px;
    gap: 12px;
    background-color: transparent;
    border: none;
    color: $text-secondary;
    text-align: left;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-left: 10px;
    position: relative;
    text-decoration: none;

    &:hover:not(.selected) {
      background-color: rgba(var(--color-primary-rgb), 0.15);
    }

    &.selected {
      background-color: $primary-light;

      .subtext {
        color: $text-secondary;
      }
    }
  }

  .nav-button--with-subtext {
    align-items: flex-start;
  }

  .nav-copy {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .text {
    font-size: $font-size-sm;
    line-height: 1.2;
    color: inherit;
  }

  .subtext {
    font-size: $font-size-xs;
    line-height: 1.35;
    color: $text-muted;
  }

  .icon {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    margin-top: 2px;
  }

  &--compact .nav-button,
  &--compact .nav-footer-button {
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 2px;
    padding: 8px 4px;
    margin-left: 6px;
    margin-right: 6px;
    width: calc(100% - 12px);
    min-height: 56px;

    .icon {
      width: 22px;
      height: 22px;
      margin-top: 0;
    }

    .compact-label {
      font-size: 10px;
      line-height: 1.1;
      font-weight: $font-medium;
      text-align: center;
      color: inherit;
      white-space: nowrap;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
    }
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
    margin-top: 8px;
    margin-bottom: 0;
    flex-shrink: 0;

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
    flex-shrink: 0;

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
    min-height: 40px;
    border-radius: $radius-xl;
    padding: 8px 14px;
    gap: 12px;
    background-color: transparent;
    border: none;
    color: $text-secondary;
    text-align: left;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-left: 10px;
    margin-top: 2px;

    &:hover:not(.selected) {
      background-color: rgba(var(--color-primary-rgb), 0.15);
    }

    &.selected {
      background-color: $primary-light;
    }
  }

  .sub-list {
    list-style: none;
    margin: 4px 10px 8px 46px;
    padding: 0 0 0 10px;
    border-left: 2px solid $border-color;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .sub-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: $radius-md;
    font-size: $font-size-sm;
    color: $text-secondary;
    text-decoration: none;
    transition: background-color 0.15s ease;

    .dot {
      width: 5px;
      height: 5px;
      border-radius: 50%;
      flex-shrink: 0;

      &--success {
        background: var(--color-success);
      }
      &--error {
        background: var(--color-error);
      }
      &--info {
        background: var(--color-info);
      }
      &--muted {
        background: $text-muted;
        opacity: 0.4;
      }
      &--neutral {
        background: $primary-muted;
      }
    }

    &:hover:not(.selected) {
      background-color: rgba(var(--color-primary-rgb), 0.08);
      color: $primary;
    }

    &.selected {
      background-color: $bg-white;
      color: $primary;
      font-weight: $font-semibold;
      box-shadow: var(--shadow-sm);
    }
  }
}

.sidebar .collapse-toggle {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px;
  width: calc(100% - 20px);
  margin: 2px 10px 10px;
  padding: 8px 14px;
  background: transparent;
  border: 1px solid $border-color;
  border-radius: $radius-xl;
  color: $text-muted;
  cursor: pointer;
  font-size: $font-size-sm;
  font-weight: $font-medium;
  transition: all 0.15s ease;
  flex-shrink: 0;

  .icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  &:hover {
    background: rgba(var(--color-primary-rgb), 0.08);
    color: $primary;
    border-color: $primary-muted;
  }

  &--compact {
    justify-content: center;
    width: calc(100% - 12px);
    margin: 4px 6px 10px;
    padding: 10px 4px;

    .icon {
      width: 18px;
      height: 18px;
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
