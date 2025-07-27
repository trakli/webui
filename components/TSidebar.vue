<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <Logo size="small" alt="Trakli Logo" />
    </div>
    <nav class="sidebar-nav">
      <ul>
        <li>
          <NuxtLink to="/dashboard" class="nav-button" active-class="selected">
            <HomeIcon class="icon" />
            <span class="text">Home</span>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/transactions" class="nav-button" active-class="selected">
            <RectangleGroupIcon class="icon" />
            <span class="text">Transactions</span>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/categories" class="nav-button" active-class="selected">
            <BuildingLibraryIcon class="icon" />
            <span class="text">Categories</span>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/groups" class="nav-button" active-class="selected">
            <UserGroupIcon class="icon" />
            <span class="text">Groups</span>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/parties" class="nav-button" active-class="selected">
            <BuildingLibraryIcon class="icon" />
            <span class="text">Parties</span>
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/wallets" class="nav-button" active-class="selected">
            <WalletIcon class="icon" />
            <span class="text">Wallets</span>
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
            :class="{ selected: $route.path === '/settings' }"
            @click="$router.push('/settings')"
          >
            <Cog8ToothIcon class="icon" />
            <span class="text">Settings</span>
          </button>
        </li>
        <li>
          <button
            class="nav-footer-button"
            :class="{ selected: $route.path === '/support' }"
            @click="$router.push('/support')"
          >
            <ChatBubbleLeftRightIcon class="icon" />
            <span class="text">Support</span>
          </button>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import {
  BuildingLibraryIcon,
  ChatBubbleLeftRightIcon,
  Cog8ToothIcon,
  HomeIcon,
  RectangleGroupIcon,
  UserGroupIcon,
  WalletIcon
} from '@heroicons/vue/24/outline';
import Logo from './Logo.vue';
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.sidebar {
  width: var(--sidebar-width);
  min-width: var(--sidebar-min-width);
  height: 100vh;
  background-color: $bg-gray;
  border-right: 1px solid #e9ecef;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
  overflow-x: hidden;
  box-sizing: border-box;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;

  &-header {
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    margin: 16px;
    width: 100%;
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
    width: 100%;
    height: 56px;
    border-radius: 12px;
    padding: 16px 8px;
    gap: 12px;
    background-color: transparent;
    border: none;
    color: #495057;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.3s;
    margin-left: 10px;

    &:hover {
      width: calc(var(--sidebar-width) - 20px);
      background-color: #bcdccc;
    }

    &.selected {
      width: calc(var(--sidebar-width) - 20px);
      background-color: #bcdccc;
    }
  }

  .icon {
    width: 24px;
    height: 24px;
  }

  .divider {
    display: flex;
    justify-items: center;
    border: 1px solid #b9b1bf;
    width: 296px;
    margin-left: 10px;
    margin-top: 20px;
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
    width: 100%;
    min-height: 56px;
    border-radius: 12px;
    padding: 12px 16px;
    gap: 12px;
    background-color: transparent;
    border: none;
    color: #495057;
    text-align: left;
    cursor: pointer;
    transition: background-color 0.3s;
    margin-left: 10px;
    margin-top: 10px;

    &:hover {
      background-color: #bcdccc;
    }
  }
}
</style>