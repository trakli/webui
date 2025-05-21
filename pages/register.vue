<script setup>
import RegisterCard from '@/components/RegisterCard.vue';
import { onMounted, onBeforeUnmount } from 'vue';

// Use JavaScript to modify the footer specifically for this page
onMounted(() => {
  const footerElement =
    document.querySelector('.app-container > footer') ||
    document.querySelector('.app-container > .footer');
  if (footerElement) {
    footerElement.style.width = '273px';
    footerElement.style.left = '50%';
    footerElement.style.transform = 'translateX(-50%)';
    footerElement.style.position = 'fixed';
    footerElement.style.bottom = '0';
    footerElement.style.height = '45px';
    footerElement.style.zIndex = '100';
    footerElement.style.backgroundColor = 'white';
    footerElement.style.display = 'flex';
    footerElement.style.alignItems = 'center';
    footerElement.style.justifyContent = 'center';
  }

  // Prevent scrolling on the body when on register page
  document.body.style.overflow = 'hidden';
});

// Reset the footer styles and scrolling when leaving this page
onBeforeUnmount(() => {
  const footerElement =
    document.querySelector('.app-container > footer') ||
    document.querySelector('.app-container > .footer');
  if (footerElement) {
    footerElement.style = '';
  }

  // Restore normal scrolling behavior
  document.body.style.overflow = '';
});
</script>

<template>
  <div class="register-container">
    <div class="register-grid">
      <div class="sidebar">
        <img src="/SidebarImage.svg" alt="Side Bar Image" class="sidebar-image" />
      </div>
      <div class="login-container">
        <RegisterCard />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.register-container {
  background-color: white;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.register-grid {
  display: grid;
  grid-template-columns: 1fr;
  width: 100%;
  height: 100%;
  gap: 0;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
}

.sidebar {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #047844;
  height: 100vh;
  overflow: hidden;
}

.sidebar-image {
  width: 100%;
  max-width: 525.96px;
  height: auto;
  max-height: 496.72px;
  padding: 1rem;
}

.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding-left: 0;
  padding-right: 30px;
  padding-top: 30px;
  padding-bottom: 75px;
  overflow: hidden;
}
</style>
