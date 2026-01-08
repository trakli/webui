<template>
  <div v-if="isOpen" class="modal-overlay" @click="handleCancel">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">{{ title }}</h3>
        <button class="close-button" @click="handleCancel">
          <XIcon />
        </button>
      </div>

      <div class="modal-body">
        <div class="icon-container" :class="`type-${type}`">
          <AlertTriangleIcon v-if="type === 'warning'" />
          <TrashIcon v-else-if="type === 'danger'" />
          <InfoIcon v-else />
        </div>
        <p class="message">{{ message }}</p>
      </div>

      <div class="modal-actions">
        <button class="cancel-button" @click="handleCancel">
          {{ cancelText || t('Cancel') }}
        </button>
        <button class="confirm-button" :class="`type-${type}`" @click="handleConfirm">
          {{ confirmText || t('Confirm') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import {
  X as XIcon,
  AlertTriangle as AlertTriangleIcon,
  Trash as TrashIcon,
  Info as InfoIcon
} from 'lucide-vue-next';

const { t } = useI18n();

defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: ''
  },
  cancelText: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'warning',
    validator: (value) => ['warning', 'danger', 'info'].includes(value)
  }
});

const emit = defineEmits(['confirm', 'cancel']);

const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<style lang="scss" scoped>
@use '~/assets/scss/_variables' as *;

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-content {
  background: $bg-white;
  border-radius: $radius-xl;
  max-width: 400px;
  width: 100%;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  animation: modalEnter 0.2s ease-out;
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 1.5rem 0 1.5rem;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: $text-primary;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  color: $text-secondary;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: $radius-sm;
  transition: all 0.2s ease;

  &:hover {
    background: $bg-light;
    color: $text-primary;
  }

  svg {
    width: 20px;
    height: 20px;
  }
}

.modal-body {
  padding: 1.5rem;
  text-align: center;
}

.icon-container {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;

  svg {
    width: 24px;
    height: 24px;
  }

  &.type-warning {
    background: $warning-bg;
    color: $warning;
  }

  &.type-danger {
    background: rgba(var(--color-error-rgb), 0.15);
    color: $error-color;
  }

  &.type-info {
    background: rgba(var(--color-primary-rgb), 0.15);
    color: $primary;
  }
}

.message {
  color: $text-secondary;
  font-size: 1rem;
  line-height: 1.5;
  margin: 0;
}

.modal-actions {
  display: flex;
  gap: 0.75rem;
  padding: 0 1.5rem 1.5rem 1.5rem;
  justify-content: flex-end;
}

.cancel-button,
.confirm-button {
  padding: 0.5rem 1rem;
  border-radius: $radius-md;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  min-width: 80px;
}

.cancel-button {
  background: $bg-white;
  color: $text-secondary;
  border-color: $border-light;

  &:hover {
    background: $bg-light;
    border-color: $border-medium;
  }
}

.confirm-button {
  &.type-warning {
    background: $warning;
    color: $text-primary;
    border-color: $warning;

    &:hover {
      background: $warning-text;
      border-color: $warning-text;
      color: $bg-white;
    }
  }

  &.type-danger {
    background: $error-color;
    color: white;
    border-color: $error-color;

    &:hover {
      background: $error-dark;
      border-color: $error-dark;
    }
  }

  &.type-info {
    background: $primary;
    color: white;
    border-color: $primary;

    &:hover {
      background: $primary-dark;
      border-color: $primary-dark;
    }
  }
}

@media (max-width: $breakpoint-sm) {
  .modal-content {
    margin: 1rem;
    max-width: calc(100vw - 2rem);
  }

  .modal-header {
    padding: 1rem 1rem 0 1rem;
  }

  .modal-title {
    font-size: 1.125rem;
  }

  .modal-body {
    padding: 1rem;
  }

  .modal-actions {
    padding: 0 1rem 1rem 1rem;
    flex-direction: column-reverse;

    .cancel-button,
    .confirm-button {
      width: 100%;
      justify-content: center;
    }
  }
}
</style>
