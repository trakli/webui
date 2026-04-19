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

        <div v-if="hasNewEntities" class="dialog__auto-create">
          <p class="dialog__auto-create-label">
            {{ t("Some transactions reference items that don't exist yet:") }}
          </p>

          <label v-if="newWalletCount > 0" class="dialog__toggle">
            <input v-model="autoCreateWallets" type="checkbox" />
            <span>
              {{ t('Create {count} new wallets', { count: newWalletCount }) }}
            </span>
          </label>

          <label v-if="newPartyCount > 0" class="dialog__toggle">
            <input v-model="autoCreateParties" type="checkbox" />
            <span>
              {{ t('Create {count} new parties', { count: newPartyCount }) }}
            </span>
          </label>

          <label v-if="newCategoryCount > 0" class="dialog__toggle">
            <input v-model="autoCreateCategories" type="checkbox" />
            <span>
              {{ t('Create {count} new categories', { count: newCategoryCount }) }}
            </span>
          </label>

          <p class="dialog__auto-create-hint">
            {{ t('Unchecked items will be skipped and not linked to the transaction.') }}
          </p>

          <p v-if="walletRequired" class="dialog__auto-create-warning">
            {{
              t(
                'Wallets are required. Check "Create new wallets" or go back and assign existing ones.'
              )
            }}
          </p>
        </div>
      </div>

      <div class="dialog__actions">
        <button class="btn btn--secondary" @click="$emit('cancel')">
          {{ t('Cancel') }}
        </button>
        <button
          class="btn btn--primary"
          :disabled="isConfirming || walletRequired"
          @click="handleConfirm"
        >
          {{ isConfirming ? t('Importing...') : t('Confirm import') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AutoCreateOptions } from '~/types/import';

const { t } = useI18n();

const props = defineProps<{
  show: boolean;
  acceptedCount: number;
  rejectedCount: number;
  duplicatesInAccepted: number;
  isConfirming: boolean;
  newWalletCount: number;
  newPartyCount: number;
  newCategoryCount: number;
}>();

const emit = defineEmits<{
  confirm: [autoCreate: AutoCreateOptions];
  cancel: [];
}>();

const autoCreateWallets = ref(false);
const autoCreateParties = ref(false);
const autoCreateCategories = ref(false);

const hasNewEntities = computed(
  () => props.newWalletCount > 0 || props.newPartyCount > 0 || props.newCategoryCount > 0
);

const walletRequired = computed(() => props.newWalletCount > 0 && !autoCreateWallets.value);

const handleConfirm = () => {
  emit('confirm', {
    wallets: autoCreateWallets.value,
    parties: autoCreateParties.value,
    categories: autoCreateCategories.value
  });
};
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

  &__auto-create {
    margin-top: 12px;
    padding: 12px;
    background-color: $bg-slate;
    border-radius: $radius-lg;
    border: 1px solid $border-light;
  }

  &__auto-create-label {
    font-weight: 600;
    margin: 0 0 8px;
    color: $text-primary;
    font-size: $font-size-sm;
  }

  &__auto-create-hint {
    margin: 8px 0 0;
    font-size: $font-size-xs;
    color: $text-muted;
  }

  &__auto-create-warning {
    margin: 8px 0 0;
    font-size: $font-size-xs;
    font-weight: 600;
    color: $error-color;
  }

  &__toggle {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 0;
    cursor: pointer;
    font-size: $font-size-sm;
    color: $text-secondary;

    input[type='checkbox'] {
      cursor: pointer;
    }
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
