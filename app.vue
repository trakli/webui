<template>
  <NuxtLayout :key="layoutKey">
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
import { onMounted } from 'vue';
import { useTheme } from '~/composables/useTheme';

const route = useRoute();
const layoutKey = computed(() => route.meta.layout || 'default');

const { initTheme } = useTheme();

onMounted(() => {
  initTheme();
});
</script>

<style lang="scss">
html,
body {
  margin: 0;
  padding: 0;
  height: 100%;
}

#__nuxt {
  height: 100%;
}

.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow-x: hidden;
  overflow-y: hidden;
  position: relative;
}
</style>
