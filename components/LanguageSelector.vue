<template>
  <div class="language-selector">
    <button class="selector-button" @click="toggleDropdown">
      <img :src="currentLanguage.flagUrl" :alt="currentLanguage.name" class="flag-icon" />
      <ChevronDownIcon class="dropdown-arrow" />
    </button>
    <div v-if="isOpen" class="dropdown-menu">
      <ul>
        <li
          v-for="lang in languages"
          :key="lang.code"
          :class="{ selected: locale === lang.code }"
          @click="selectLanguage(lang.code)"
        >
          <img :src="lang.flagUrl" :alt="lang.name" class="flag-icon" />
          <span>{{ lang.name }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { ChevronDownIcon } from '@heroicons/vue/24/outline';

const { locale, setLocale } = useI18n();

const isOpen = ref(false);

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

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectLanguage = (code) => {
  setLocale(code);
  isOpen.value = false;
};

const closeDropdown = (event) => {
  if (!event.target.closest('.language-selector')) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', closeDropdown);
});

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown);
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.language-selector {
  position: relative;
  display: inline-block;
}

.selector-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  height: $navbar-icon-button-height;
  padding: 0 0.75rem;
  background-color: #dee1e0;
  border: none;
  border-radius: $radius-lg;
  cursor: pointer;
}

.flag-icon {
  width: 20px;
  height: 15px;
  border-radius: 2px;
}

.language-name {
  color: #000000;
  font-size: 14px;
}

.dropdown-arrow {
  width: 16px;
  height: 16px;
  color: #1d3229;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 5px);
  right: 0;
  background-color: $bg-white;
  border: 1px solid $border-light;
  border-radius: $radius-md;
  box-shadow: $shadow-md;
  z-index: $z-index-dropdown;
  width: 160px;

  ul {
    list-style: none;
    padding: 0.5rem 0;
    margin: 0;

    li {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 1rem;
      cursor: pointer;
      font-size: 14px;

      &:hover {
        background-color: $bg-light;
      }

      &.selected {
        background-color: rgba($primary, 0.1);
        color: $primary;
        font-weight: 500;
      }
    }
  }
}
</style>
