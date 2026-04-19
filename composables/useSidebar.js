import { ref, onMounted, onUnmounted, readonly, watch } from 'vue';

const STORAGE_KEY = 'trakli-sidebar';

// Mobile drawer — transient, tied to viewport state.
const isSidebarOpen = ref(false);
const isMobile = ref(false);
const isTabletOrBelow = ref(false);

// Desktop collapse — persisted across reloads, mirrors the `theme` pattern.
const sidebarCollapsed = ref(false);
let hydrated = false;

const loadCollapseState = () => {
  if (typeof window === 'undefined' || hydrated) return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (typeof parsed.collapsed === 'boolean') {
      sidebarCollapsed.value = parsed.collapsed;
    }
  } catch {
    // ignore
  }
};

const persistCollapseState = () => {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ collapsed: sidebarCollapsed.value }));
  } catch {
    // ignore
  }
};

export const useSidebar = () => {
  const checkMobile = () => {
    isMobile.value = window.innerWidth < 768;
    isTabletOrBelow.value = window.innerWidth <= 1280;
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

  const toggleCollapse = () => {
    sidebarCollapsed.value = !sidebarCollapsed.value;
  };

  const collapseSidebar = () => {
    sidebarCollapsed.value = true;
  };

  const expandSidebar = () => {
    sidebarCollapsed.value = false;
  };

  watch(sidebarCollapsed, persistCollapseState);

  onMounted(() => {
    loadCollapseState();
    checkMobile();
    window.addEventListener('resize', checkMobile);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', checkMobile);
  });

  return {
    isSidebarOpen: readonly(isSidebarOpen),
    isMobile: readonly(isMobile),
    isTabletOrBelow: readonly(isTabletOrBelow),
    sidebarCollapsed: readonly(sidebarCollapsed),
    toggleSidebar,
    closeSidebar,
    openSidebar,
    toggleCollapse,
    collapseSidebar,
    expandSidebar
  };
};
