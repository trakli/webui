<template>
  <div ref="rootRef" class="language-selector">
    <button
      class="icon-button"
      :aria-label="currentLanguage.name"
      :title="currentLanguage.name"
      @click="toggle"
    >
      <img :src="currentLanguage.flagUrl" :alt="currentLanguage.name" class="flag-icon" />
    </button>

    <Transition name="dropdown">
      <div v-if="isOpen" class="language-dropdown">
        <div class="dropdown-header">
          <h3>{{ t('Language') }}</h3>
        </div>
        <div class="language-list">
          <button
            v-for="lang in languages"
            :key="lang.code"
            class="language-item"
            :class="{ active: locale === lang.code }"
            @click="selectLanguage(lang.code)"
          >
            <img :src="lang.flagUrl" :alt="lang.name" class="flag-icon" />
            <span class="language-name">{{ lang.name }}</span>
            <Check v-if="locale === lang.code" class="check-icon" />
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { Check } from 'lucide-vue-next';
import { useDropdown } from '@/composables/useDropdown';

const { t, locale, setLocale } = useI18n();

const { isOpen, rootRef, toggle, close } = useDropdown();

const languages = [
  { code: 'en', name: 'English', flagUrl: '/flags/gb.svg' },
  { code: 'fr', name: 'Français', flagUrl: '/flags/fr.svg' },
  { code: 'de', name: 'Deutsch', flagUrl: '/flags/de.svg' },
  { code: 'es', name: 'Español', flagUrl: '/flags/es.svg' },
  { code: 'pt', name: 'Português', flagUrl: '/flags/pt.svg' },
  { code: 'it', name: 'Italiano', flagUrl: '/flags/it.svg' }
];

const currentLanguage = computed(() => {
  return languages.find((lang) => lang.code === locale.value) || languages[0];
});

const selectLanguage = (code) => {
  setLocale(code);
  close();
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;
@use '@/assets/scss/_utilities.scss' as *;

.language-selector {
  position: relative;
  display: inline-block;
}

.flag-icon {
  width: 20px;
  height: 15px;
  border-radius: 2px;
  object-fit: cover;
}

.language-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 240px;
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

.language-list {
  max-height: 320px;
  overflow-y: auto;
  padding: 0.25rem 0;
}

.language-item {
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
  transition: background-color 0.2s;

  &:hover {
    background: $bg-gray;
  }

  &.active {
    background: rgba(var(--color-primary-rgb), 0.08);
    color: $primary;
    font-weight: $font-semibold;
  }

  .language-name {
    flex: 1;
    text-align: left;
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
