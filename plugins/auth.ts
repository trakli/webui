export default defineNuxtPlugin(() => {
  addRouteMiddleware('global-auth', (to) => {
    const token = useCookie('token');
    const guestRoutes = ['/login', '/register'];

    const isGuestRoute = guestRoutes.includes(to.path);

    if (token.value && isGuestRoute) {
      // Authenticated users should not access guest routes
      return navigateTo('/dashboard');
    }

    if (!token.value && !isGuestRoute) {
      // Unauthenticated users should be redirected to login from protected routes
      return navigateTo('/login');
    }
  }, { global: true });
});
