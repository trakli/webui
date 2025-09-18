import { useAuth } from '@/composables/useAuth';

export default defineNuxtPlugin(() => {
  const { user } = useAuth();

  addRouteMiddleware(
    'global-auth',
    (to) => {
      const guestRoutes = ['/login', '/register'];

      // The auth callback route should also be treated as a guest route
      const isGuestRoute = guestRoutes.includes(to.path) || to.path.startsWith('/auth/');

      if (user.value && isGuestRoute) {
        // Authenticated users should not access guest routes
        return navigateTo('/dashboard');
      }

      if (!user.value && !isGuestRoute) {
        // Unauthenticated users should be redirected to login from protected routes
        return navigateTo('/login');
      }
    },
    { global: true }
  );
});
