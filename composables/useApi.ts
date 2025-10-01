export const useApi = () => {
  const config = useRuntimeConfig();
  const token = useState('auth.token', () => null);

  return $fetch.create({
    baseURL: config.public.apiBase as string,
    headers: {
      ...(token.value ? { Authorization: `Bearer ${token.value}` } : {})
    },

    onResponseError({ response }) {
      if (response.status === 401) {
        const userState = useState('auth.user');
        const tokenState = useState('auth.token');
        userState.value = null;
        tokenState.value = null;

        if (process.client && !window.location.pathname.includes('/login')) {
          navigateTo('/login');
        }
      }

      console.error('API Error:', response._data);
    }
  });
};
