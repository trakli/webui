<template>
  <div class="reminders-page">
    <ContentTopCard
      page-name="Reminder"
      page-name-plural="Reminders"
      @add="handleOpenFormForCreation"
    />

    <div class="content-area">
      <div v-if="showForm" class="form-section">
        <div class="form-wrapper">
          <ReminderForm
            :editing-item="editingItem"
            :api-error="submitError"
            :is-submitting="isSubmitting"
            @created="handleCreate"
            @updated="handleUpdate"
            @close="handleFormClose"
          />
        </div>
      </div>

      <div v-if="isLoading" class="loading-state">
        <Loader2 class="spinner" />
        <p>{{ t('Loading reminders...') }}</p>
      </div>

      <div v-else-if="error" class="error-state">
        <AlertCircle />
        <p>{{ error }}</p>
      </div>

      <div v-else-if="!showForm && reminders.length === 0" class="empty-state">
        <Clock class="empty-icon" />
        <h3>{{ t('No reminders yet') }}</h3>
        <p>{{ t('Create reminders to stay on top of your finances') }}</p>
        <button class="add-btn" @click="handleOpenFormForCreation">
          <Plus />
          <span>{{ t('Create your first reminder') }}</span>
        </button>
      </div>

      <div v-else-if="!showForm" class="reminders-list">
        <div
          v-for="reminder in reminders"
          :key="reminder.id"
          class="reminder-card"
          :class="{
            'is-paused': reminder.status === 'paused',
            'is-completed': reminder.status === 'completed'
          }"
        >
          <div class="reminder-icon">
            <component :is="getReminderIcon(reminder.type)" />
          </div>

          <div class="reminder-content">
            <div class="reminder-header">
              <h3 class="reminder-title">{{ reminder.title }}</h3>
              <span class="reminder-type">{{ formatType(reminder.type) }}</span>
            </div>

            <p v-if="reminder.description" class="reminder-desc">{{ reminder.description }}</p>

            <div class="reminder-meta">
              <span class="meta-item">
                <Calendar />
                {{ formatDate(reminder.next_trigger_at || reminder.trigger_at) }}
              </span>
              <span v-if="reminder.repeat_rule" class="meta-item">
                <Repeat />
                {{ formatRepeat(reminder.repeat_rule) }}
              </span>
              <span class="meta-item status" :class="reminder.status">
                {{ formatStatus(reminder.status) }}
              </span>
            </div>
          </div>

          <div class="reminder-actions">
            <button
              v-if="reminder.status === 'active'"
              class="action-btn"
              :title="t('Pause')"
              @click="handlePause(reminder)"
            >
              <Pause />
            </button>
            <button
              v-if="reminder.status === 'paused'"
              class="action-btn"
              :title="t('Resume')"
              @click="handleResume(reminder)"
            >
              <Play />
            </button>
            <button class="action-btn" :title="t('Edit')" @click="handleEdit(reminder)">
              <Pencil />
            </button>
            <button
              class="action-btn action-btn--danger"
              :title="t('Delete')"
              @click="handleDelete(reminder)"
            >
              <Trash2 />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  Bell,
  Clock,
  Calendar,
  Repeat,
  Pause,
  Play,
  Pencil,
  Trash2,
  Loader2,
  AlertCircle,
  TrendingUp,
  Receipt,
  PiggyBank,
  Star,
  Plus
} from 'lucide-vue-next';
import { useReminders } from '@/composables/useReminders';
import { useNotifications } from '@/composables/useNotifications';
import { extractApiErrors } from '@/utils/apiErrors';
import ContentTopCard from '@/components/TTopCard.vue';
import ReminderForm from '@/components/reminders/ReminderForm.vue';

const { t } = useI18n();

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});

const showForm = ref(false);
const editingItem = ref(null);
const isSubmitting = ref(false);
const submitError = ref('');

const {
  reminders,
  isLoading,
  error,
  fetchReminders,
  createReminder,
  updateReminder,
  deleteReminder,
  pauseReminder,
  resumeReminder
} = useReminders();

const { confirmDelete, showSuccess, showError } = useNotifications();

function handleOpenFormForCreation() {
  editingItem.value = null;
  submitError.value = '';
  showForm.value = true;
}

function handleFormClose() {
  submitError.value = '';
  showForm.value = false;
  editingItem.value = null;
}

async function handleCreate(data) {
  if (isSubmitting.value) return;

  isSubmitting.value = true;
  submitError.value = '';
  try {
    await createReminder(data);
    showSuccess(t('Reminder created'), t('Your reminder has been created successfully'));
    handleFormClose();
  } catch (err) {
    submitError.value = extractApiErrors(err);
    showError(t('Error'), t('Failed to create reminder'));
    console.error('Failed to create reminder:', err);
  } finally {
    isSubmitting.value = false;
  }
}

async function handleUpdate(data) {
  if (isSubmitting.value || !data.id) return;

  isSubmitting.value = true;
  submitError.value = '';
  try {
    const { id, ...updateData } = data;
    await updateReminder(id, updateData);
    showSuccess(t('Reminder updated'), t('Your reminder has been updated successfully'));
    handleFormClose();
  } catch (err) {
    submitError.value = extractApiErrors(err);
    showError(t('Error'), t('Failed to update reminder'));
    console.error('Failed to update reminder:', err);
  } finally {
    isSubmitting.value = false;
  }
}

function handleEdit(item) {
  submitError.value = '';
  editingItem.value = item;
  showForm.value = true;
}

async function handleDelete(item) {
  const confirmed = await confirmDelete('reminder');
  if (!confirmed) return;

  try {
    await deleteReminder(item.id);
    showSuccess(t('Reminder deleted'), t('{name} has been deleted', { name: item.title }));
  } catch (err) {
    showError(t('Error'), t('Failed to delete reminder'));
    console.error('Failed to delete reminder:', err);
  }
}

async function handlePause(item) {
  try {
    await pauseReminder(item.id);
    showSuccess(t('Reminder paused'), t('{name} has been paused', { name: item.title }));
  } catch {
    showError(t('Error'), t('Failed to pause reminder'));
  }
}

async function handleResume(item) {
  try {
    await resumeReminder(item.id);
    showSuccess(t('Reminder resumed'), t('{name} has been resumed', { name: item.title }));
  } catch {
    showError(t('Error'), t('Failed to resume reminder'));
  }
}

function getReminderIcon(type) {
  const icons = {
    daily_tracking: Clock,
    weekly_review: TrendingUp,
    monthly_summary: Calendar,
    bill_due: Receipt,
    budget_alert: PiggyBank,
    custom: Star
  };
  return icons[type] || Bell;
}

function formatType(type) {
  const types = {
    daily_tracking: t('Daily Tracking'),
    weekly_review: t('Weekly Review'),
    monthly_summary: t('Monthly Summary'),
    bill_due: t('Bill Due'),
    budget_alert: t('Budget Alert'),
    custom: t('Custom')
  };
  return types[type] || type;
}

function formatDate(dateString) {
  if (!dateString) return t('Not scheduled');
  const date = new Date(dateString);
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function formatRepeat(rule) {
  if (!rule) return '';
  if (rule.includes('DAILY')) return t('Daily');
  if (rule.includes('WEEKLY')) return t('Weekly');
  if (rule.includes('MONTHLY')) return t('Monthly');
  return t('Recurring');
}

function formatStatus(status) {
  const statuses = {
    active: t('Active'),
    paused: t('Paused'),
    snoozed: t('Snoozed'),
    completed: t('Completed'),
    cancelled: t('Cancelled')
  };
  return statuses[status] || status;
}

onMounted(() => {
  fetchReminders();
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.reminders-page {
  width: 100%;
}

.content-area {
  margin-top: 1rem;
}

.form-section {
  display: flex;
  gap: 1.5rem;
  align-items: flex-start;
  margin-bottom: 2rem;

  @media (max-width: $breakpoint-md) {
    flex-direction: column;
  }
}

.form-wrapper {
  flex: 0 1 auto;
  min-width: 0;
}

.add-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: $primary;
  color: white;
  border: none;
  border-radius: $radius-lg;
  font-weight: $font-semibold;
  cursor: pointer;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  svg {
    width: 18px;
    height: 18px;
  }
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: $text-secondary;
}

.spinner {
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.empty-icon {
  width: 64px;
  height: 64px;
  color: $border-color;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: $font-size-lg;
  font-weight: $font-semibold;
  color: $text-primary;
  margin: 0 0 0.5rem;
}

.empty-state p {
  margin: 0 0 1.5rem;
}

.reminders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.reminder-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.25rem;
  background: $bg-white;
  border-radius: $radius-xl;
  box-shadow: $shadow-sm;
  border: 1px solid $border-color;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: $shadow-md;
  }

  &.is-paused {
    opacity: 0.7;
  }

  &.is-completed {
    opacity: 0.5;
  }
}

.reminder-icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--color-primary-rgb), 0.1);
  border-radius: $radius-lg;

  svg {
    width: 22px;
    height: 22px;
    color: $primary;
  }
}

.reminder-content {
  flex: 1;
  min-width: 0;
}

.reminder-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.25rem;
  flex-wrap: wrap;
}

.reminder-title {
  font-size: $font-size-base;
  font-weight: $font-semibold;
  color: $text-primary;
  margin: 0;
}

.reminder-type {
  font-size: $font-size-xs;
  padding: 0.25rem 0.5rem;
  background: $bg-gray;
  border-radius: $radius-md;
  color: $text-secondary;
}

.reminder-desc {
  font-size: $font-size-sm;
  color: $text-secondary;
  margin: 0.25rem 0 0.5rem;
  line-height: 1.4;
}

.reminder-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  font-size: $font-size-sm;
  color: $text-muted;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;

  svg {
    width: 14px;
    height: 14px;
  }

  &.status {
    font-weight: $font-medium;

    &.active {
      color: $success;
    }

    &.paused {
      color: $warning;
    }

    &.completed {
      color: $text-muted;
    }
  }
}

.reminder-actions {
  display: flex;
  gap: 0.5rem;
  flex-shrink: 0;
}

.action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: $bg-gray;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all 0.2s;

  svg {
    width: 16px;
    height: 16px;
    color: $text-secondary;
  }

  &:hover {
    background: $border-color;

    svg {
      color: $text-primary;
    }
  }

  &--danger:hover {
    background: rgba(var(--color-error-rgb), 0.1);

    svg {
      color: $error-color;
    }
  }
}

@media (max-width: $breakpoint-sm) {
  .reminder-card {
    flex-direction: column;
  }

  .reminder-actions {
    width: 100%;
    justify-content: flex-end;
    margin-top: 0.5rem;
    padding-top: 0.75rem;
    border-top: 1px solid $border-color;
  }
}
</style>
