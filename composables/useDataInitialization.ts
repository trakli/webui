import { onMounted } from 'vue';

/**
 * Centralized composable for handling data initialization in components
 * Ensures data is loaded when components mount if user is authenticated
 */
export const useDataInitialization = () => {
  const { isAuthenticated } = useAuth();
  const { isInitialized, isLoading, initializeData } = useDataManager();

  onMounted(async () => {
    if (isAuthenticated.value && !isInitialized.value && !isLoading.value) {
      await initializeData();
    }
  });

  return {
    isAuthenticated,
    isInitialized,
    isLoading
  };
};
