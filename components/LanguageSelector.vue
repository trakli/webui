<template>
  <div class="language-selector">
    <button class="selector-button" @click="toggleDropdown">
      <img :src="selectedLanguage.flagUrl" :alt="selectedLanguage.name" class="flag-icon" />
      <ChevronDownIcon class="dropdown-arrow" />
    </button>
    <div v-if="isOpen" class="dropdown-menu">
      <ul>
        <li v-for="lang in languages" :key="lang.code" @click="selectLanguage(lang)">
          <img :src="lang.flagUrl" :alt="lang.name" class="flag-icon" />
          <span>{{ lang.name }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { ChevronDownIcon } from '@heroicons/vue/24/outline';

const isOpen = ref(false);
// To add more languages:
// 1. Find the 2-letter country code (e.g., 'US' for United States).
// 2. Add a new object to this 'languages' array below.
// 3. Copy the corresponding SVG file from 'node_modules/country-flag-icons/3x2/'
//    to the 'public/flags/' directory.
//    Example command: cp node_modules/country-flag-icons/3x2/US.svg public/flags/us.svg
const languages = ref([
  { code: 'GB', name: 'English', flagUrl: '/flags/gb.svg' },
  { code: 'FR', name: 'French', flagUrl: '/flags/fr.svg' },
  { code: 'DE', name: 'German', flagUrl: '/flags/de.svg' },
  { code: 'ES', name: 'Spanish', flagUrl: '/flags/es.svg' }
]);
const selectedLanguage = ref(languages.value[0]);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const selectLanguage = (lang) => {
  selectedLanguage.value = lang;
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
    }
  }
}
</style>
