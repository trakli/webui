<template>
  <div ref="rootRef" class="theme-selector">
    <button class="icon-button" :aria-label="t('Theme')" :title="t('Theme')" @click="toggle">
      <component :is="triggerIcon" class="icon" />
    </button>

    <Transition name="dropdown">
      <div v-if="isOpen" class="theme-dropdown">
        <div class="dropdown-header">
          <h3>{{ t('Theme') }}</h3>
        </div>
        <div class="theme-list">
          <button
            v-for="option in options"
            :key="option.value"
            class="theme-item"
            :class="{ active: theme === option.value }"
            @click="selectTheme(option.value)"
          >
            <component :is="option.icon" class="theme-icon" />
            <span class="theme-name">{{ t(option.label) }}</span>
            <Check v-if="theme === option.value" class="check-icon" />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Sun, Moon, Monitor, Check } from 'lucide-vue-next';
import { useTheme, type ThemeMode } from '@/composables/useTheme';
import { useDropdown } from '@/composables/useDropdown';

const { t } = useI18n();
const { theme, isDark, setTheme } = useTheme();

const { isOpen, rootRef, toggle, close } = useDropdown();

const options: Array<{ value: ThemeMode; label: string; icon: typeof Sun }> = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor }
];

const triggerIcon = computed(() => {
  if (theme.value === 'system') return Monitor;
  return isDark.value ? Moon : Sun;
});

const selectTheme = (value: ThemeMode) => {
  setTheme(value);
  close();
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;
@use '@/assets/scss/_utilities.scss' as *;

.theme-selector {
  position: relative;
  display: inline-block;
}

.icon {
  width: 16px;
  height: 16px;
  color: currentColor;
}

.theme-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 220px;
  background: $bg-white;
  border: 1px solid $border-color;
  border-radius: $radius-xl;
  box-shadow: $shadow-md;
  overflow: hidden;
  z-index: $z-index-dropdown;

  @media (max-width: $breakpoint-sm) {
    width: calc(100vw - 32px);
    right: -8px;
  }
}

.dropdown-header {
  padding: 1rem;
  border-bottom: 1px solid $border-color;

  h3 {
    margin: 0;
    font-size: $font-size-base;
    font-weight: $font-semibold;
    color: $text-primary;
  }
}

.theme-list {
  padding: 0.25rem 0;
}

.theme-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: $font-size-sm;
  color: $text-primary;
  text-align: left;
  transition: background-color 0.2s;

  &:hover {
    background: $bg-gray;
  }

  &.active {
    background: rgba(var(--color-primary-rgb), 0.08);
    color: $primary;
    font-weight: $font-semibold;

    .theme-icon {
      color: $primary;
    }
  }

  .theme-icon {
    width: 18px;
    height: 18px;
    color: $text-secondary;
  }

  .theme-name {
    flex: 1;
  }

  .check-icon {
    width: 16px;
    height: 16px;
    color: $primary;
  }
}

.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
