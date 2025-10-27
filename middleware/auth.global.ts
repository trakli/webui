export default defineNuxtRouteMiddleware(() => {
  // Ensure auth state is synced between cookies and reactive state on every route
  // This prevents SSR/CSR hydration mismatches
  const { syncAuthState } = useAuth();

  // Only sync on client-side to avoid SSR issues
  if (typeof window !== 'undefined') {
    syncAuthState();
  }
});
