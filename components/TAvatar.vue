<template>
  <TDropdown>
    <template #trigger>
      <button class="t-avatar-button">
        <img :src="imageUrl" alt="User Avatar" class="avatar-image" />
        <div v-if="showName && userName" class="user-info">
          <span class="user-name-text">{{ userName }}</span>
        </div>
        <ChevronDownIcon v-if="showDropdown" class="dropdown-icon" />
      </button>
    </template>

    <div class="dropdown-content">
      <div v-if="user" class="user-details">
        <p class="user-name">{{ user.first_name }} {{ user.last_name }}</p>
        <p class="user-email">{{ user.email }}</p>
      </div>
      <hr class="divider" />
      <TDropdownItem @click="() => $router.push('/settings')"> {{ t('Settings') }} </TDropdownItem>
      <TDropdownItem @click="logout"> {{ t('Logout') }} </TDropdownItem>
    </div>
  </TDropdown>
</template>

<script setup>
import { ChevronDownIcon } from '@heroicons/vue/24/outline';
import TDropdown from './TDropdown.vue';
import TDropdownItem from './TDropdownItem.vue';
import { useAuth } from '@/composables/useAuth';

const { t } = useI18n();

const { user, logout } = useAuth();

defineProps({
  imageUrl: {
    type: String,
    required: true
  },
  userName: {
    type: String,
    default: ''
  },
  showName: {
    type: Boolean,
    default: false
  },
  showDropdown: {
    type: Boolean,
    default: true
  }
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.t-avatar-button {
  display: flex;
  align-items: center;
  background-color: transparent;
  border: none;
  border-radius: $radius-md;
  padding: 0.5rem;
  gap: 0.75rem;
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: $bg-light;
  }

  .avatar-image {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
  }

  .user-info {
    display: flex;
    align-items: center;
  }

  .user-name-text {
    color: $text-primary;
    font-weight: $font-semibold;
    font-size: 1rem;
  }

  .dropdown-icon {
    width: 20px;
    height: 20px;
    color: $text-secondary;
  }
}

.dropdown-content {
  .user-details {
    padding: 0.5rem 1rem;

    .user-name {
      font-weight: 600;
      color: $text-primary;
    }

    .user-email {
      font-size: 0.875rem;
      color: $text-muted;
    }
  }

  .divider {
    margin: 0.5rem 0;
    border-color: $border-light;
  }
}
</style>
