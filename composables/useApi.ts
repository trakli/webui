let isRedirectingToLogin = false;

export const useApi = () => {
  const config = useRuntimeConfig();
  const tokenCookie = useCookie('auth.token');
  const localeCookie = useCookie('i18n_redirected');

  return $fetch.create({
    baseURL: config.public.apiBase as string,
    headers: {
      ...(tokenCookie.value ? { Authorization: `Bearer ${tokenCookie.value}` } : {}),
      'Accept-Language': localeCookie.value || 'en'
    },

    onResponseError({ response }) {
      if (response.status === 401) {
        const userState = useState('auth.user');
        const tokenState = useState('auth.token');
        const userCookie = useCookie('auth.user');
        const tokenCookieRef = useCookie('auth.token');

        userState.value = null;
        tokenState.value = null;
        userCookie.value = null;
        tokenCookieRef.value = null;

        if (
          import.meta.client &&
          !isRedirectingToLogin &&
          !window.location.pathname.includes('/login')
        ) {
          isRedirectingToLogin = true;
          window.location.href = '/login';
        }
      }

      console.error('API Error:', response._data);
    }
  });
};
