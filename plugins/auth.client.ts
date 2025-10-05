export default defineNuxtPlugin(() => {
  if (import.meta.client) {
    const { fetchUser } = useAuth();
    fetchUser();
  }
});
