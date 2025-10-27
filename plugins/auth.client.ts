export default defineNuxtPlugin(async () => {
  if (import.meta.client) {
    const { isAuthenticated, fetchUser } = useAuth();
    const { initializeData } = useDataManager();

    if (isAuthenticated.value) {
      try {
        console.log('[Auth Plugin] Validating user session...');
        await fetchUser(); // Validate token and refresh user data

        console.log('[Auth Plugin] Initializing user data...');
        await initializeData(); // Load user data
      } catch (error) {
        console.error('[Auth Plugin] Auth initialization failed:', error);
        // fetchUser will handle clearing invalid auth state
      }
    }
  }
});
