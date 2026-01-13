<template>
  <div class="notifications-page">
    <div class="page-header">
      <div class="header-left">
        <Bell class="header-icon" />
        <h1>{{ t('Notifications') }}</h1>
      </div>
      <button v-if="notifications.length > 0" class="mark-all-btn" @click="handleMarkAllRead">
        <CheckCheck />
        <span>{{ t('Mark all read') }}</span>
      </button>
    </div>

    <div class="content-area">
      <div v-if="isLoading" class="loading-state">
        <Loader2 class="spinner" />
        <p>{{ t('Loading notifications...') }}</p>
      </div>

      <div v-else-if="error" class="error-state">
        <AlertCircle />
        <p>{{ error }}</p>
      </div>

      <div v-else-if="notifications.length === 0" class="empty-state">
        <BellOff class="empty-icon" />
        <h3>{{ t('No notifications') }}</h3>
        <p>{{ t("You're all caught up! Check back later for new notifications.") }}</p>
      </div>

      <div v-else class="notifications-list">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-card"
          :class="{ unread: !notification.read_at }"
          @click="handleNotificationClick(notification)"
        >
          <div class="notification-icon">
            <component :is="getNotificationIcon(notification.type)" />
          </div>

          <div class="notification-content">
            <div class="notification-header">
              <h3 class="notification-title">{{ notification.title }}</h3>
              <span class="notification-time">{{ formatTime(notification.created_at) }}</span>
            </div>

            <p class="notification-body">{{ notification.body }}</p>

            <span v-if="notification.type" class="notification-type">
              {{ formatType(notification.type) }}
            </span>
          </div>

          <div class="notification-actions">
            <button
              v-if="!notification.read_at"
              class="action-btn mark-read"
              :title="t('Mark as read')"
              @click.stop="handleMarkAsRead(notification)"
            >
              <Check />
            </button>
            <button
              class="action-btn delete"
              :title="t('Delete')"
              @click.stop="handleDelete(notification)"
            >
              <Trash2 />
            </button>
          </div>
        </div>
      </div>

      <div v-if="hasMore && !isLoading" class="load-more">
        <button class="load-more-btn" @click="loadMore">
          {{ t('Load more') }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import {
  Bell,
  BellOff,
  Check,
  CheckCheck,
  Trash2,
  Loader2,
  AlertCircle,
  Clock,
  TrendingUp,
  Award
} from 'lucide-vue-next';
import { notificationsApi } from '@/services/api';

const { t } = useI18n();

definePageMeta({
  layout: 'dashboard',
  middleware: 'auth'
});

const notifications = ref([]);
const isLoading = ref(true);
const error = ref('');
const page = ref(1);
const hasMore = ref(false);

const fetchNotifications = async (pageNum = 1) => {
  isLoading.value = true;
  error.value = '';
  try {
    const response = await notificationsApi.fetchAll({ page: pageNum, limit: 20 });
    if (pageNum === 1) {
      notifications.value = response.data || [];
    } else {
      notifications.value = [...notifications.value, ...(response.data || [])];
    }
    hasMore.value = response.meta?.has_more || false;
    page.value = pageNum;
  } catch (e) {
    console.error('Failed to fetch notifications', e);
    error.value = t('Failed to load notifications. Please try again.');
  } finally {
    isLoading.value = false;
  }
};

const loadMore = () => {
  fetchNotifications(page.value + 1);
};

const handleMarkAsRead = async (notification) => {
  try {
    await notificationsApi.markAsRead(notification.id);
    notification.read_at = new Date().toISOString();
  } catch (e) {
    console.error('Failed to mark notification as read', e);
  }
};

const handleMarkAllRead = async () => {
  try {
    await notificationsApi.markAllAsRead();
    notifications.value.forEach((n) => {
      if (!n.read_at) {
        n.read_at = new Date().toISOString();
      }
    });
  } catch (e) {
    console.error('Failed to mark all notifications as read', e);
  }
};

const handleDelete = async (notification) => {
  try {
    await notificationsApi.delete(notification.id);
    notifications.value = notifications.value.filter((n) => n.id !== notification.id);
  } catch (e) {
    console.error('Failed to delete notification', e);
  }
};

const handleNotificationClick = async (notification) => {
  if (!notification.read_at) {
    await handleMarkAsRead(notification);
  }
};

const getNotificationIcon = (type) => {
  switch (type) {
    case 'reminder':
      return Clock;
    case 'system':
      return TrendingUp;
    case 'alert':
      return AlertCircle;
    case 'achievement':
      return Award;
    default:
      return Bell;
  }
};

const formatType = (type) => {
  const types = {
    reminder: t('Reminder'),
    system: t('System'),
    alert: t('Alert'),
    achievement: t('Achievement')
  };
  return types[type] || type;
};

const formatTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return t('Just now');
  if (diffMins < 60) return t('{n} min ago', { n: diffMins });
  if (diffHours < 24) return t('{n}h ago', { n: diffHours });
  if (diffDays < 7) return t('{n}d ago', { n: diffDays });
  return date.toLocaleDateString();
};

onMounted(() => {
  fetchNotifications();
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.notifications-page {
  width: 100%;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;

  @media (max-width: $breakpoint-sm) {
    margin-bottom: 1rem;
  }
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;

  h1 {
    font-size: $font-size-lg;
    font-weight: $font-semibold;
    color: $text-primary;
    margin: 0;

    @media (max-width: $breakpoint-sm) {
      font-size: $font-size-base;
    }
  }
}

.header-icon {
  width: 24px;
  height: 24px;
  color: $primary;

  @media (max-width: $breakpoint-sm) {
    width: 20px;
    height: 20px;
  }
}

.mark-all-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: $primary;
  color: #ffffff;
  border: none;
  border-radius: $radius-lg;
  font-weight: $font-medium;
  cursor: pointer;
  transition: background-color 0.2s;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    background: $primary-hover;
  }
}

.content-area {
  width: 100%;
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

  h3 {
    font-size: $font-size-lg;
    font-weight: $font-semibold;
    color: $text-primary;
    margin: 1rem 0 0.5rem;
  }

  p {
    margin: 0;
  }
}

.spinner {
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
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
  color: $text-muted;
  opacity: 0.5;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.notification-card {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: $bg-white;
  border: 1px solid $border-light;
  border-radius: $radius-xl;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: $border-medium;
    box-shadow: $shadow-sm;
  }

  &.unread {
    background: rgba(var(--color-primary-rgb), 0.05);
    border-left: 3px solid $primary;
  }
}

.notification-icon {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $bg-light;
  border-radius: 50%;

  svg {
    width: 20px;
    height: 20px;
    color: $primary;
  }
}

.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.notification-title {
  font-size: $font-size-base;
  font-weight: $font-semibold;
  color: $text-primary;
  margin: 0;
}

.notification-time {
  font-size: $font-size-xs;
  color: $text-muted;
  white-space: nowrap;
}

.notification-body {
  font-size: $font-size-sm;
  color: $text-secondary;
  margin: 0 0 0.5rem;
  line-height: 1.5;
}

.notification-type {
  display: inline-block;
  font-size: $font-size-xs;
  font-weight: $font-medium;
  color: $primary;
  background: rgba(var(--color-primary-rgb), 0.1);
  padding: 0.125rem 0.5rem;
  border-radius: $radius-md;
}

.notification-actions {
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
  background: transparent;
  border: 1px solid $border-light;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all 0.2s;

  svg {
    width: 16px;
    height: 16px;
    color: $text-secondary;
  }

  &.mark-read {
    &:hover {
      background: $primary;
      border-color: $primary;

      svg {
        color: #ffffff;
      }
    }
  }

  &.delete {
    &:hover {
      background: rgba(var(--color-error-rgb), 0.1);
      border-color: $error-color;

      svg {
        color: $error-color;
      }
    }
  }
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 1.5rem;
}

.load-more-btn {
  padding: 0.75rem 2rem;
  background: $bg-light;
  color: $text-secondary;
  border: 1px solid $border-light;
  border-radius: $radius-lg;
  font-weight: $font-medium;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: $bg-white;
    border-color: $primary;
    color: $primary;
  }
}
</style>
