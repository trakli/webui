<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

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
