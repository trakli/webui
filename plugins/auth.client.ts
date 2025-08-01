export default defineNuxtPlugin(() => {
  if (process.client) {
    const { fetchUser } = useAuth();
    fetchUser();
  }
});
