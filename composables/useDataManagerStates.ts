/**
 * Centralized composable for accessing data manager states
 * Provides common loading/error states used across components
 */
export const useDataManagerStates = () => {
  const { isLoading, error, isInitialized } = useDataManager();

  return {
    isLoading,
    error,
    isInitialized
  };
};
