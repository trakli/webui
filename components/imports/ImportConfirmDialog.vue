<template>
  <div v-if="show" class="dialog-overlay" @click.self="$emit('cancel')">
    <div class="dialog">
      <h3 class="dialog__title">{{ t('Confirm import') }}</h3>

      <div class="dialog__body">
        <p>{{ t('You are about to import {count} transactions.', { count: acceptedCount }) }}</p>

        <div v-if="duplicatesInAccepted > 0" class="dialog__warning">
          {{
            t('{count} of these may be duplicates of existing transactions.', {
              count: duplicatesInAccepted
            })
          }}
        </div>

        <div v-if="rejectedCount > 0" class="dialog__info">
          {{ t('{count} suggestions will be skipped.', { count: rejectedCount }) }}
        </div>
      </div>

      <div class="dialog__actions">
        <button class="btn btn--secondary" @click="$emit('cancel')">
          {{ t('Cancel') }}
        </button>
        <button class="btn btn--primary" :disabled="isConfirming" @click="$emit('confirm')">
          {{ isConfirming ? t('Importing...') : t('Confirm import') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n();

defineProps<{
  show: boolean;
  acceptedCount: number;
  rejectedCount: number;
  duplicatesInAccepted: number;
  isConfirming: boolean;
}>();

defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: $z-index-modal;
}

.dialog {
  background-color: $bg-white;
  border-radius: $radius-xl;
  padding: 24px;
  max-width: 440px;
  width: 100%;
  box-shadow: $shadow-xl;

  &__title {
    margin: 0 0 16px;
    font-size: $font-size-lg;
    color: $text-primary;
  }

  &__body {
    margin-bottom: 20px;

    p {
      margin: 0 0 8px;
      color: $text-secondary;
      font-size: $font-size-sm;
    }
  }

  &__warning {
    padding: 8px 12px;
    background-color: $warning-bg;
    color: $warning-text;
    border-radius: $radius-lg;
    font-size: $font-size-sm;
    margin-top: 8px;
  }

  &__info {
    padding: 8px 12px;
    background-color: $bg-slate;
    color: $text-muted;
    border-radius: $radius-lg;
    font-size: $font-size-sm;
    margin-top: 8px;
  }

  &__actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
  }
}

.btn {
  padding: 8px 20px;
  border-radius: $radius-lg;
  font-size: $font-size-sm;
  cursor: pointer;
  border: none;
  transition: all 0.2s;

  &--secondary {
    background-color: $bg-gray;
    color: $text-secondary;

    &:hover {
      background-color: $border-color;
    }
  }

  &--primary {
    background-color: $primary;
    color: $text-inverse;

    &:hover:not(:disabled) {
      background-color: $primary-hover;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}
</style>
