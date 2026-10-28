import { PERSONAL_SPACE, resolveSpace, spaceSupports } from '~/utils/activeSpace';

const ANY_SPACE = [
  '/workspaces',
  '/invitations',
  '/login',
  '/register',
  '/onboarding',
  '/auth',
  '/admin',
  '/billing'
];

export default defineNuxtRouteMiddleware(async (to) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated.value) return;

  const stored = useCookie<string | null>('trakli.space');
  const legacy = to.path.match(/^\/workspaces\/([^/]+)$/);
  if (legacy) {
    stored.value = legacy[1];
    return navigateTo({ path: '/dashboard', query: to.query });
  }

  const { workspaces, load } = useWorkspaces();
  const wantsShared = !!stored.value && stored.value !== PERSONAL_SPACE;
  let known = workspaces.value.length > 0;
  if (wantsShared && !known) {
    known = await load().then(
      () => true,
      () => false
    );
  }
  const space = resolveSpace(stored.value, workspaces.value);
  if (wantsShared && !space && known) stored.value = PERSONAL_SPACE;

  const anywhere = ANY_SPACE.some((path) => to.path === path || to.path.startsWith(path + '/'));
  if (anywhere || to.path === '/') return;
  if (!space && (to.path === '/people' || to.path === '/space-billing'))
    return navigateTo('/dashboard');
  if (space && !spaceSupports(to.path)) return navigateTo('/dashboard');
});
