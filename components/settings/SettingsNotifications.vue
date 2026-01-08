<template>
  <div>
    <div v-if="loading" class="loading-state">
      <p>{{ t('Loading preferences...') }}</p>
    </div>

    <div v-else>
      <h3 class="subsection-title">{{ t('Notification Channels') }}</h3>
      <div class="toggle-grid">
        <div class="toggle-item">
          <div class="toggle-info">
            <Mail class="toggle-icon" />
            <div>
              <p class="toggle-label">{{ t('Email Notifications') }}</p>
              <p class="toggle-desc">{{ t('Receive notifications via email') }}</p>
            </div>
          </div>
          <label class="toggle-switch">
            <input
              v-model="preferences.channels.email"
              type="checkbox"
              :disabled="!isEditMode"
              @change="handleChange"
            />
            <span class="slider"></span>
          </label>
        </div>

        <div class="toggle-item">
          <div class="toggle-info">
            <Smartphone class="toggle-icon" />
            <div>
              <p class="toggle-label">{{ t('Push Notifications') }}</p>
              <p class="toggle-desc">{{ t('Receive notifications on your device') }}</p>
            </div>
          </div>
          <label class="toggle-switch">
            <input
              v-model="preferences.channels.push"
              type="checkbox"
              :disabled="!isEditMode"
              @change="handleChange"
            />
            <span class="slider"></span>
          </label>
        </div>

        <div class="toggle-item">
          <div class="toggle-info">
            <Bell class="toggle-icon" />
            <div>
              <p class="toggle-label">{{ t('In-App Notifications') }}</p>
              <p class="toggle-desc">{{ t('See notifications in the app') }}</p>
            </div>
          </div>
          <label class="toggle-switch">
            <input
              v-model="preferences.channels.inapp"
              type="checkbox"
              :disabled="!isEditMode"
              @change="handleChange"
            />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <h3 class="subsection-title">{{ t('Notification Types') }}</h3>
      <div class="toggle-grid">
        <div class="toggle-item">
          <div class="toggle-info">
            <Clock class="toggle-icon" />
            <div>
              <p class="toggle-label">{{ t('Reminders') }}</p>
              <p class="toggle-desc">{{ t('Get notified about your reminders') }}</p>
            </div>
          </div>
          <label class="toggle-switch">
            <input
              v-model="preferences.types.reminders"
              type="checkbox"
              :disabled="!isEditMode"
              @change="handleChange"
            />
            <span class="slider"></span>
          </label>
        </div>

        <div class="toggle-item">
          <div class="toggle-info">
            <TrendingUp class="toggle-icon" />
            <div>
              <p class="toggle-label">{{ t('Financial Insights') }}</p>
              <p class="toggle-desc">{{ t('Weekly/monthly spending summaries') }}</p>
            </div>
          </div>
          <label class="toggle-switch">
            <input
              v-model="preferences.types.insights"
              type="checkbox"
              :disabled="!isEditMode"
              @change="handleChange"
            />
            <span class="slider"></span>
          </label>
        </div>

        <div class="toggle-item">
          <div class="toggle-info">
            <UserCheck class="toggle-icon" />
            <div>
              <p class="toggle-label">{{ t('Engagement Reminders') }}</p>
              <p class="toggle-desc">{{ t("Gentle nudges when you haven't tracked") }}</p>
            </div>
          </div>
          <label class="toggle-switch">
            <input
              v-model="preferences.types.inactivity"
              type="checkbox"
              :disabled="!isEditMode"
              @change="handleChange"
            />
            <span class="slider"></span>
          </label>
        </div>
      </div>

      <div v-if="isEditMode" class="actions">
        <button type="button" class="submit-btn" @click="handleSave">
          <Save class="inline-icon" />
          <span>{{ t('Save Preferences') }}</span>
        </button>
        <p v-if="message" class="success-text">{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { Save, Mail, Smartphone, Bell, Clock, TrendingUp, UserCheck } from 'lucide-vue-next';
import { notificationsApi } from '@/services/api';

const { t } = useI18n();

const props = defineProps({
  isEditMode: { type: Boolean, default: false }
});

const loading = ref(true);
const message = ref('');
const hasChanges = ref(false);

const preferences = reactive({
  channels: {
    email: true,
    push: true,
    inapp: true
  },
  types: {
    reminders: true,
    insights: true,
    inactivity: true
  }
});

watch(
  () => props.isEditMode,
  () => {
    message.value = '';
  }
);

onMounted(async () => {
  try {
    const data = await notificationsApi.getPreferences();
    if (data) {
      Object.assign(preferences.channels, data.channels);
      Object.assign(preferences.types, data.types);
    }
  } catch (e) {
    console.error('Failed to load notification preferences', e);
  } finally {
    loading.value = false;
  }
});

const handleChange = () => {
  hasChanges.value = true;
};

const handleSave = async () => {
  try {
    await notificationsApi.updatePreferences({
      channels: { ...preferences.channels },
      types: { ...preferences.types }
    });
    message.value = t('Notification preferences updated!');
    hasChanges.value = false;
  } catch (e) {
    console.error('Failed to update notification preferences', e);
    message.value = t('Failed to update preferences');
  } finally {
    setTimeout(() => {
      message.value = '';
    }, 2000);
  }
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.loading-state {
  text-align: center;
  padding: 2rem;
  color: $text-secondary;
}

.subsection-title {
  font-size: $font-size-base;
  font-weight: $font-semibold;
  color: $text-primary;
  margin-bottom: 1rem;
  margin-top: 1.5rem;

  &:first-child {
    margin-top: 0;
  }
}

.toggle-grid {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.toggle-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: $bg-gray;
  border-radius: $radius-lg;
}

.toggle-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.toggle-icon {
  width: 20px;
  height: 20px;
  color: $primary;
}

.toggle-label {
  font-weight: $font-medium;
  color: $text-primary;
  margin: 0;
}

.toggle-desc {
  font-size: $font-size-sm;
  color: $text-secondary;
  margin: 0;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;

  input {
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + .slider {
      background-color: $primary;
    }

    &:checked + .slider:before {
      transform: translateX(24px);
    }

    &:disabled + .slider {
      opacity: 0.6;
      cursor: not-allowed;
    }
  }

  .slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: $border-color;
    transition: 0.3s;
    border-radius: 24px;

    &:before {
      position: absolute;
      content: '';
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: 0.3s;
      border-radius: 50%;
    }
  }
}

.inline-icon {
  width: 18px;
  height: 18px;
}

.actions {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.submit-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: $primary;
  color: white;
  border-radius: $radius-lg;
  font-weight: $font-semibold;
  transition: $transition-base;

  &:hover {
    opacity: 0.9;
  }
}

.success-text {
  margin-top: 0.75rem;
  color: $primary;
  font-weight: $font-semibold;
}
</style>
