export const useAuth = () => {
  const router = useRouter();
  const user = useState('auth.user', () => null);
  const token = useState('auth.token', () => null);

  const isAuthenticated = computed(() => !!user.value && !!token.value);

  const login = async (credentials: Record<string, any>) => {
    try {
      const api = useApi();
      const response = await api('/login', {
        method: 'POST',
        body: credentials
      });

      if (response.data) {
        user.value = response.data.user;
        token.value = response.data.token;
      }

      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (details: Record<string, any>) => {
    try {
      const api = useApi();
      const response = await api('/register', {
        method: 'POST',
        body: details
      });

      if (response.data) {
        user.value = response.data.user;
        token.value = response.data.token;
      }

      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
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
      router.push('/login');
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
      }
    } catch (error) {
      console.error('Failed to fetch user:', error);
      user.value = null;
      token.value = null;
    }
  };

  return {
    user: readonly(user),
    isAuthenticated,
    login,
    register,
    logout,
    fetchUser
  };
};
