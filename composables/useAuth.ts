import { useDataManager } from './useDataManager';

export const useAuth = () => {
  // Cookie management for persistence
  const userCookie = useCookie('auth.user', {
    default: () => null,
    serialize: JSON.stringify,
    deserialize: JSON.parse,
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });

  const tokenCookie = useCookie('auth.token', {
    default: () => null,
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7
  });

  // Reactive state using useState (SSR-friendly)
  const user = useState('auth.user', () => userCookie.value);
  const token = useState('auth.token', () => tokenCookie.value);

  const isAuthenticated = computed(() => !!user.value && !!token.value);

  // Sync auth state between cookies and reactive state
  const syncAuthState = () => {
    if (userCookie.value && !user.value) {
      user.value = userCookie.value;
    }
    if (tokenCookie.value && !token.value) {
      token.value = tokenCookie.value;
    }
  };

  // Auto-sync auth state on client-side
  if (typeof window !== 'undefined') {
    syncAuthState();
  }

  const login = async (credentials: { email: string; password: string }) => {
    try {
      //clear data before new login
      const { clearData } = useDataManager();
      clearData();

      const api = useApi();
      const response = await api('/login', {
        method: 'POST',
        body: credentials
      });

      if (response.data) {
        // Update reactive state
        user.value = response.data.user;
        token.value = response.data.token;

        // Sync to cookies
        userCookie.value = response.data.user;
        tokenCookie.value = response.data.token;

        const { initializeData } = useDataManager();
        initializeData();
      }

      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (details: {
    email: string;
    password: string;
    name: string;
    phone?: string;
  }) => {
    try {
      const api = useApi();
      const response = await api('/register', {
        method: 'POST',
        body: details
      });

      if (response.data) {
        // Update reactive state
        user.value = response.data.user;
        token.value = response.data.token;

        // Sync to cookies
        userCookie.value = response.data.user;
        tokenCookie.value = response.data.token;

        const { initializeData } = useDataManager();
        initializeData();
      }

      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    const { clear: clearOnboardingStatus } = useOnboardingStatus();

    try {
      const api = useApi();
      await api('/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      user.value = null;
      token.value = null;
      userCookie.value = null;
      tokenCookie.value = null;
      clearOnboardingStatus();

      const { clearData } = useDataManager();
      clearData();

      await navigateTo('/login');
    }
  };

  const fetchUser = async () => {
    try {
      if (!token.value) {
        user.value = null;
        return;
      }

      const api = useApi();
      const response = await api('/user');

      if (response?.data) {
        user.value = response.data;
        // Sync updated user data to cookie
        userCookie.value = response.data;
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      // Clear invalid auth state
      user.value = null;
      token.value = null;
      userCookie.value = null;
      tokenCookie.value = null;

      // Clear data since auth is invalid
      const { clearData } = useDataManager();
      clearData();
    }
  };

  return {
    user: readonly(user),
    token: readonly(token),
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser,
    syncAuthState
  };
};
