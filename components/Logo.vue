<template>
  <img :src="logoPath" :alt="alt" :class="['logo', `logo-${size}`]" @error="handleImageError" />
</template>

<script setup>
import { ref } from 'vue';

defineProps({
  alt: {
    type: String,
    default: 'Trakli Logo'
  },
  size: {
    type: String,
    default: 'medium',
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
});

const logoPath = ref('/logo.svg');

const handleImageError = (e) => {
  console.error('Failed to load logo from path:', e.target.src);
  // Try alternative path if the first one fails
  if (e.target.src.endsWith('logo.svg')) {
    logoPath.value = '/_nuxt/logo.svg';
  } else {
    console.error('All logo paths failed to load');
  }
};
</script>

<style lang="scss" scoped>
@use '~/assets/_variables' as *;

img.logo {
  display: block;
  height: auto;
  margin: 0;
  padding: 0;
  line-height: 1;
}

img.logo-small {
  width: 80px !important;
}

img.logo-medium {
  width: 120px !important;
}

img.logo-large {
  width: 195px !important;
  margin-bottom: $spacing-8 !important;
}
</style>
