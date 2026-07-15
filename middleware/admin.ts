export default defineNuxtRouteMiddleware(async () => {
  const { user, isAuthenticated, fetchUser } = useAuth();

  if (!isAuthenticated.value) {
    return navigateTo('/login');
  }

  await fetchUser();

  if (!isAuthenticated.value) {
    return navigateTo('/login');
  }

  if (!user.value?.is_admin) {
    return navigateTo('/dashboard');
  }
});
