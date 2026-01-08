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
  </div>
</template>

<script setup>
import { Sun, Moon } from 'lucide-vue-next';
import { useTheme } from '~/composables/useTheme';

const { t } = useI18n();
const { isDark, toggleTheme } = useTheme();
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
