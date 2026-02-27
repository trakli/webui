<template>
  <div v-if="isOpen" class="modal-overlay" @click="handleCancel">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3 class="modal-title">
          {{ isCurrentlyRecurring ? t('Update recurrence') : t('Make recurring') }}
        </h3>
        <button class="close-button" @click="handleCancel">
          <XIcon />
        </button>
      </div>

      <div class="modal-body">
        <div v-if="isCurrentlyRecurring" class="current-status">
          <RefreshCwIcon class="status-icon" />
          <span class="status-text">
            {{ t('Repeat every') }} {{ transaction?.recurrenceInterval || 1 }}
            {{ periodLabel(transaction?.recurrencePeriod) }}
          </span>
        </div>

        <form @submit.prevent="handleSave">
          <div class="form-group">
            <label class="form-label">{{ t('Recurrence period') }}</label>
            <select v-model="form.period" class="form-input">
              <option value="daily">{{ t('Daily') }}</option>
              <option value="weekly">{{ t('Weekly') }}</option>
              <option value="monthly">{{ t('Monthly') }}</option>
              <option value="yearly">{{ t('Yearly') }}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">{{ t('Repeat every') }}</label>
            <div class="interval-row">
              <input
                v-model.number="form.interval"
                type="number"
                class="form-input interval-input"
                min="1"
                required
              />
              <span class="interval-unit">{{ unitLabel }}</span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">{{ t('End date') }}</label>
            <div class="end-date-row">
              <label class="checkbox-label">
                <input v-model="hasEndDate" type="checkbox" />
                <span>{{ t('No end date') }}</span>
              </label>
              <input v-if="!hasEndDate" v-model="form.endsAt" type="date" class="form-input" />
            </div>
          </div>

          <div class="form-actions">
            <button
              v-if="isCurrentlyRecurring"
              type="button"
              class="btn btn-danger"
              @click="handleRemove"
            >
              {{ t('Remove recurrence') }}
            </button>
            <div class="actions-right">
              <button type="button" class="btn btn-secondary" @click="handleCancel">
                {{ t('Cancel') }}
              </button>
              <button type="submit" class="btn btn-primary">
                {{ isCurrentlyRecurring ? t('Update recurrence') : t('Make recurring') }}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { X as XIcon, RefreshCw as RefreshCwIcon } from 'lucide-vue-next';

const { t } = useI18n();

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  transaction: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['save', 'remove', 'cancel']);

const form = ref({
  period: 'monthly',
  interval: 1,
  endsAt: ''
});

const hasEndDate = ref(true); // true = no end date (checkbox checked)

const isCurrentlyRecurring = computed(() => {
  return props.transaction?.isRecurring && props.transaction?.recurrencePeriod;
});

const unitLabel = computed(() => {
  return periodLabel(form.value.period);
});

function periodLabel(period) {
  const labels = {
    daily: t('day(s)'),
    weekly: t('week(s)'),
    monthly: t('month(s)'),
    yearly: t('year(s)')
  };
  return labels[period] || period || '';
}

watch(
  () => props.isOpen,
  (open) => {
    if (open && props.transaction) {
      if (isCurrentlyRecurring.value) {
        form.value.period = props.transaction.recurrencePeriod || 'monthly';
        form.value.interval = props.transaction.recurrenceInterval || 1;
        if (props.transaction.recurrenceEndsAt) {
          hasEndDate.value = false;
          form.value.endsAt = props.transaction.recurrenceEndsAt.split('T')[0];
        } else {
          hasEndDate.value = true;
          form.value.endsAt = '';
        }
      } else {
        form.value.period = 'monthly';
        form.value.interval = 1;
        hasEndDate.value = true;
        form.value.endsAt = '';
      }
    }
  }
);

function handleSave() {
  const config = {
    is_recurring: true,
    recurrence_period: form.value.period,
    recurrence_interval: form.value.interval,
    recurrence_ends_at: hasEndDate.value ? null : form.value.endsAt || null
  };
  emit('save', config);
}

function handleRemove() {
  emit('remove');
}

function handleCancel() {
  emit('cancel');
}
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
  max-width: 480px;
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
}

.current-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(var(--color-primary-rgb), 0.1);
  border-radius: $radius-md;
  margin-bottom: 1.25rem;

  .status-icon {
    width: 16px;
    height: 16px;
    color: $primary;
    flex-shrink: 0;
  }

  .status-text {
    font-size: $font-size-sm;
    color: $primary;
  }
}

.form-group {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: $font-size-sm;
  font-weight: 500;
  color: $text-primary;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: 1px solid $border-light;
  border-radius: $radius-md;
  font-size: $font-size-sm;
  transition: border-color 0.2s;
  background: $bg-white;

  &:focus {
    outline: none;
    border-color: $primary;
  }
}

.interval-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  .interval-input {
    width: 100px;
    flex-shrink: 0;
  }

  .interval-unit {
    font-size: $font-size-sm;
    color: $text-secondary;
  }
}

.end-date-row {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: $font-size-sm;
  color: $text-secondary;

  input[type='checkbox'] {
    width: 16px;
    height: 16px;
    cursor: pointer;
  }
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid $border-light;
}

.actions-right {
  display: flex;
  gap: 0.75rem;
  margin-left: auto;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: $radius-md;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid;
  transition: all 0.2s ease;
  font-size: 0.875rem;
  min-width: 80px;
  justify-content: center;
}

.btn-secondary {
  background: $bg-white;
  color: $text-secondary;
  border-color: $border-light;

  &:hover {
    background: $bg-light;
    border-color: $border-medium;
  }
}

.btn-primary {
  background: $primary;
  color: white;
  border-color: $primary;

  &:hover {
    background: $primary-dark;
    border-color: $primary-dark;
  }
}

.btn-danger {
  background: transparent;
  color: $error-color;
  border-color: $error-color;

  &:hover {
    background: rgba(var(--color-error-rgb), 0.1);
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

  .form-actions {
    flex-direction: column;
    gap: 0.75rem;

    .actions-right {
      width: 100%;
    }

    .btn {
      flex: 1;
    }

    .btn-danger {
      width: 100%;
    }
  }
}
</style>
