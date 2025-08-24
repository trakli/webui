import { useState, useCookie, useRouter, useApi } from '#imports';

export const useAuth = () => {
  const router = useRouter();
  const userCookie = useCookie('user');
  const user = useState('user', () => userCookie.value || null);
  const api = useApi();

    const login = async (credentials: Record<string, any>) => {
    try {
      const response = await api('/login', {
        method: 'POST',
        body: credentials,
      });

      if (response.data) {
        const cookieOptions: { path: string; maxAge?: number } = {
          path: '/',
        };

        if (credentials.remember) {
          cookieOptions.maxAge = 7 * 24 * 60 * 60; // 7 days
        }

        const token = useCookie('token', cookieOptions);
        token.value = response.data.token;

        userCookie.value = response.data.user;
        user.value = response.data.user;
      }

      return response;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const register = async (details: Record<string, any>) => {
    try {
      const response = await api('/register', {
        method: 'POST',
        body: details,
      });

      if (response.data) {
        const token = useCookie('token');
        token.value = response.data.token;
        userCookie.value = response.data.user;
        user.value = response.data.user;
      }

      return response;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  };

  const logout = () => {
    const token = useCookie('token');
    token.value = null;
    userCookie.value = null;
    user.value = null;
    router.push('/login');
  };

  return { user, login, register, logout };
};
