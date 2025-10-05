<template>
  <div>
    <div class="notifications-container">
      <div
        v-for="notification in notifications"
        :key="notification.id"
        class="notification"
        :class="`notification--${notification.type}`"
        @click="removeNotification(notification.id)"
      >
        <div class="notification-icon">
          <CheckCircleIcon v-if="notification.type === 'success'" />
          <XCircleIcon v-else-if="notification.type === 'error'" />
          <AlertTriangleIcon v-else-if="notification.type === 'warning'" />
          <InfoIcon v-else />
        </div>
        <div class="notification-content">
          <h4 class="notification-title">{{ notification.title }}</h4>
          <p v-if="notification.message" class="notification-message">{{ notification.message }}</p>
        </div>
        <button class="notification-close" @click.stop="removeNotification(notification.id)">
          <XIcon />
        </button>
      </div>
    </div>

    <ConfirmModal
      :is-open="isConfirmModalOpen"
      :title="confirmModalData.title"
      :message="confirmModalData.message"
      :confirm-text="confirmModalData.confirmText"
      :cancel-text="confirmModalData.cancelText"
      :type="confirmModalData.type"
      @confirm="handleConfirmResponse(true)"
      @cancel="handleConfirmResponse(false)"
    />
  </div>
</template>

<script setup>
import {
  CheckCircle as CheckCircleIcon,
  XCircle as XCircleIcon,
  AlertTriangle as AlertTriangleIcon,
  Info as InfoIcon,
  X as XIcon
} from 'lucide-vue-next';
import { useNotifications } from '~/composables/useNotifications';
import ConfirmModal from '~/components/modals/ConfirmModal.vue';

const {
  notifications,
  isConfirmModalOpen,
  confirmModalData,
  removeNotification,
  handleConfirmResponse
} = useNotifications();
</script>

<style lang="scss" scoped>
@use '~/assets/scss/_variables' as *;

.notifications-container {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 1050;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-width: 400px;

  @media (max-width: $breakpoint-sm) {
    top: 0.5rem;
    right: 0.5rem;
    left: 0.5rem;
    max-width: none;
  }
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
  border-left: 4px solid;
  cursor: pointer;
  transition: all 0.2s ease;
  animation: slideIn 0.3s ease-out;

  &:hover {
    transform: translateX(-2px);
    box-shadow:
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04);
  }

  &--success {
    border-left-color: #10b981;

    .notification-icon {
      color: #10b981;
    }
  }

  &--error {
    border-left-color: #ef4444;

    .notification-icon {
      color: #ef4444;
    }
  }

  &--warning {
    border-left-color: #f59e0b;

    .notification-icon {
      color: #f59e0b;
    }
  }

  &--info {
    border-left-color: #3b82f6;

    .notification-icon {
      color: #3b82f6;
    }
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.notification-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;

  svg {
    width: 20px;
    height: 20px;
  }
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 0.25rem 0;
  line-height: 1.25;
}

.notification-message {
  font-size: 0.8rem;
  color: $text-secondary;
  margin: 0;
  line-height: 1.4;
}

.notification-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: $text-secondary;
  cursor: pointer;
  padding: 0.125rem;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    color: $text-primary;
  }

  svg {
    width: 16px;
    height: 16px;
  }
}

@media (max-width: $breakpoint-sm) {
  .notification {
    padding: 0.75rem;
  }

  .notification-title {
    font-size: 0.8rem;
  }

  .notification-message {
    font-size: 0.75rem;
  }
}
</style>
