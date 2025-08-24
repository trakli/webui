import { $fetch } from 'ofetch';
import { useRuntimeConfig } from '#imports';

export const useApi = () => {
  const config = useRuntimeConfig();

  return $fetch.create({
    baseURL: config.public.apiBase as string,
    onRequest({ options }) {
      const token = useCookie('token');
      if (token.value) {
        options.headers = (options.headers || {}) as Record<string, string>;
        options.headers.Authorization = `Bearer ${token.value}`;
      }
    },
    onResponseError({ response }) {
      // Handle errors globally
      console.error('API Error:', response._data);
    }
  });
};
