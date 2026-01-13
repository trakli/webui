<template>
  <button
    type="button"
    class="theme-toggle-btn"
    :title="isDark ? t('Switch to light mode') : t('Switch to dark mode')"
    @click="toggleTheme"
  >
    <Sun v-if="isDark" class="theme-icon" />
    <Moon v-else class="theme-icon" />
  </button>
</template>

<script setup>
import { Sun, Moon } from 'lucide-vue-next';
import { useTheme } from '~/composables/useTheme';

const { t } = useI18n();
const { isDark, toggleTheme } = useTheme();
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.theme-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid $border-light;
  background: $bg-white;
  color: $text-secondary;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: $bg-light;
    color: $primary;
    border-color: $primary;
  }
}

.theme-icon {
  width: 20px;
  height: 20px;
}
</style>
