<template>
  <div>
    <div class="toggle-row">
      <div class="toggle-label">
        <component :is="isDark ? Sun : Moon" class="inline-icon" />
        <span>{{ isDark ? t('Light') : t('Dark') }} {{ t('Mode') }}</span>
      </div>
      <button type="button" class="toggle" :class="{ 'toggle--on': isDark }" @click="toggleTheme">
        <span class="toggle-circle" />
      </button>
    </div>

    <div class="toggle-row" style="margin-top: 0.75rem">
      <div class="toggle-label">
        <MessageSquare class="inline-icon" />
        <span>{{ t('Chat-first landing') }}</span>
      </div>
      <button
        type="button"
        class="toggle"
        :class="{ 'toggle--on': chatFirst }"
        :disabled="savingLanding"
        @click="toggleLanding"
      >
        <span class="toggle-circle" />
      </button>
    </div>
    <p class="hint">{{ t('Open the AI chat as your home screen instead of the dashboard.') }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { Sun, Moon, MessageSquare } from 'lucide-vue-next';
import { useTheme } from '~/composables/useTheme';
import { useNotifications } from '~/composables/useNotifications';
import configurationsApi from '@/services/api/configurationsApi';
import { CONFIGURATION_KEYS } from '@/utils/configurationKeys';

const { t } = useI18n();
const { isDark, toggleTheme } = useTheme();
const { showError } = useNotifications();

const chatFirst = ref(true);
const savingLanding = ref(false);

onMounted(async () => {
  try {
    const res = await configurationsApi.fetchAll();
    const items = res?.data || res || [];
    const item = (Array.isArray(items) ? items : []).find(
      (i) => i.key === CONFIGURATION_KEYS.LANDING_MODE
    );
    chatFirst.value = item ? item.value === 'chat' : false;
  } catch {
    chatFirst.value = false;
  }
});

const toggleLanding = async () => {
  savingLanding.value = true;
  const next = !chatFirst.value;
  try {
    await configurationsApi.update(CONFIGURATION_KEYS.LANDING_MODE, {
      value: next ? 'chat' : 'dashboard',
      type: 'string'
    });
    chatFirst.value = next;
  } catch {
    // Leave the toggle on its previous value and tell the user it didn't save.
    showError(t('Could not save that setting. Please try again.'));
  } finally {
    savingLanding.value = false;
  }
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.toggle-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-radius: $radius-lg;
  background: $bg-gray;
}

.toggle-label {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: $font-semibold;
  color: $text-primary;
}

.toggle {
  position: relative;
  display: inline-flex;
  align-items: center;
  height: 24px;
  width: 44px;
  border-radius: 999px;
  background: $primary-toggle;
  transition: $transition-base;

  &--on {
    background: $primary;
  }
}

.toggle-circle {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: $bg-white;
  border-radius: 50%;
  box-shadow: $shadow-sm;
  transition: transform 0.2s ease-in-out;
}

.toggle.toggle--on .toggle-circle {
  transform: translateX(20px);
}

.inline-icon {
  width: 18px;
  height: 18px;
}

.hint {
  margin: 0.5rem 0 0;
  padding: 0 1rem;
  font-size: $font-size-xs;
  color: $text-muted;
}

.toggle:disabled {
  opacity: 0.6;
  cursor: default;
}

.actions {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.success-text {
  margin-top: 0.75rem;
  color: $primary;
  font-weight: $font-semibold;
}
</style>
