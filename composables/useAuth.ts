export const useAuth = () => {
  const router = useRouter();

  const userCookie = useCookie('auth.user', {
    default: () => null,
    serialize: JSON.stringify,
    deserialize: JSON.parse
  });
  const tokenCookie = useCookie('auth.token', {
    default: () => null,
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7
  });
  const user = useState('auth.user', () => userCookie.value);
  const token = useState('auth.token', () => tokenCookie.value);

  const isAuthenticated = computed(() => !!user.value && !!token.value);

  const login = async (credentials: { email: string; password: string }) => {
    try {
      const api = useApi();
      const response = await api('/login', {
        method: 'POST',
        body: credentials
      });

      if (response.data) {
        user.value = response.data.user;
        token.value = response.data.token;
        userCookie.value = response.data.user;
        tokenCookie.value = response.data.token;
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
        user.value = response.data.user;
        token.value = response.data.token;
        userCookie.value = response.data.user;
        tokenCookie.value = response.data.token;
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
      userCookie.value = null;
      tokenCookie.value = null;
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
      userCookie.value = null;
      tokenCookie.value = null;
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
