<template>
  <div class="sidebar">
    <div class="sidebar-header">
      <img src="~/public/logo.svg" alt="Trakli Logo" class="logo" />
    </div>
    <nav class="sidebar-nav">
      <ul>
        <li>
          <button
            class="nav-button"
            :class="{ selected: $route.path === '/home' }"
            @click="$router.push('/home')"
          >
            <HomeIcon class="icon" />
            <span class="text">Home</span>
          </button>
        </li>
        <li>
          <button
            class="nav-button"
            :class="{ selected: $route.path === '/groups' }"
            @click="$router.push('/groups')"
          >
            <RectangleGroupIcon class="icon" />
            <span class="text">Groups</span>
          </button>
        </li>
        <li>
          <button
            class="nav-button"
            :class="{ selected: $route.path === '/income' }"
            @click="$router.push('/income')"
          >
            <BuildingLibraryIcon class="icon" />
            <span class="text">Parties</span>
          </button>
        </li>
        <li>
          <button
            class="nav-button"
            :class="{ selected: $route.path === '/expenses' }"
            @click="$router.push('/expenses')"
          >
            <UserGroupIcon class="icon" />
            <span class="text">Parties</span>
          </button>
        </li>
        <li>
          <button
            class="nav-button"
            :class="{ selected: $route.path === '/parties' }"
            @click="$router.push('/parties')"
          >
            <WalletIcon class="icon" />
            <span class="text">Wallets</span>
          </button>
        </li>
        <li>
          <button
            class="nav-button"
            :class="{ selected: $route.path === '/wallets' }"
            @click="$router.push('/wallets')"
          >
            <ArrowPathIcon class="icon" />
            <span class="text">Transaction tracking</span>
          </button>
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
        <li>
          <TAvatar />
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowPathIcon,
  BuildingLibraryIcon,
  ChatBubbleLeftRightIcon,
  Cog8ToothIcon,
  HomeIcon,
  RectangleGroupIcon,
  UserGroupIcon,
  WalletIcon
} from '@heroicons/vue/24/outline';
import TAvatar from './TAvatar.vue';
</script>

<style lang="scss" scoped>
@use '~/assets/_variables' as *;

.sidebar {
  width: 300px;
  height: 1440px;
  background-color: $bg-gray;
  border-right: 1px solid #e9ecef;
  position: fixed;
  left: 0;
  top: 0;
  overflow-y: auto;
}

.sidebar-header {
  display: flex;
  justify-items: start;
  padding-top: 2px;
  text-align: center;
}

.logo {
  width: 90px;
  height: 62px;
  margin-left: 5px;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-button {
  display: flex;
  align-items: center;
  width: 250px;
  height: 56px;
  border-radius: 12px;
  padding: 16px 8px 16px 1px;
  gap: 12px;
  background-color: transparent;
  border: none;
  color: #495057;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-left: 10px;
}

.nav-button:hover {
  width: 250px;
  background-color: #bcdccc;
}

.nav-button.selected {
  background-color: #bcdccc;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 15px 20px;
  color: #495057;
  text-decoration: none;
  transition: background-color 0.3s;
  gap: 12px;
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
  width: 296px;
  height: 204px;
  gap: 8px;
  flex-direction: column;
}

.nav-footer-button {
  display: flex;
  align-items: center;
  width: 267px;
  height: 56px;
  border-radius: 12px;
  padding: 16px 8px 16px 1px;
  gap: 12px;
  background-color: transparent;
  border: none;
  color: #495057;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.3s;
  margin-left: 10px;
  margin-top: 10px;
}

.nav-footer-button:hover {
  background-color: #bcdccc;
}
</style>
