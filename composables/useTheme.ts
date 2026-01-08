import { ref, computed } from 'vue';

export type ThemeMode = 'light' | 'dark' | 'system';

const theme = ref<ThemeMode>('light');
const isDark = ref(false);

const THEME_STORAGE_KEY = 'trakli-theme';

function applyTheme(dark: boolean) {
  if (typeof document === 'undefined') return;

  if (dark) {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  isDark.value = dark;
}

function getSystemPreference(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function resolveTheme(mode: ThemeMode): boolean {
  if (mode === 'system') {
    return getSystemPreference();
  }
  return mode === 'dark';
}

export function useTheme() {
  function setTheme(newTheme: ThemeMode) {
    theme.value = newTheme;
    const dark = resolveTheme(newTheme);
    applyTheme(dark);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    }
  }

  function toggleTheme() {
    const newTheme = isDark.value ? 'light' : 'dark';
    setTheme(newTheme);
  }

  function initTheme() {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    const initialTheme = saved || 'light';
    theme.value = initialTheme;

    const dark = resolveTheme(initialTheme);
    applyTheme(dark);

    if (initialTheme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', (e) => {
        if (theme.value === 'system') {
          applyTheme(e.matches);
        }
      });
    }
  }

  return {
    theme: computed(() => theme.value),
    isDark: computed(() => isDark.value),
    setTheme,
    toggleTheme,
    initTheme
  };
}
