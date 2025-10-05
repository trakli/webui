export const useApi = () => {
  const config = useRuntimeConfig();
  const tokenCookie = useCookie('auth.token');

  return $fetch.create({
    baseURL: config.public.apiBase as string,
    headers: {
      ...(tokenCookie.value ? { Authorization: `Bearer ${tokenCookie.value}` } : {})
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

        if (process.client && !window.location.pathname.includes('/login')) {
          navigateTo('/login');
        }
      }

      console.error('API Error:', response._data);
    }
  });
};
