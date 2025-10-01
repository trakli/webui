import { ref, onMounted, onUnmounted, readonly } from 'vue';

const isSidebarOpen = ref(false);
const isMobile = ref(false);

export const useSidebar = () => {
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 768;
    // Auto-close sidebar on mobile when screen size changes
    if (!isMobile.value) {
      isSidebarOpen.value = false;
    }
  };

  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
  };

  const closeSidebar = () => {
    isSidebarOpen.value = false;
  };

  const openSidebar = () => {
    isSidebarOpen.value = true;
  };

  onMounted(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile);
  });

  return {
    isSidebarOpen: readonly(isSidebarOpen),
    isMobile: readonly(isMobile),
    toggleSidebar,
    closeSidebar,
    openSidebar
  };
};
