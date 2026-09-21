import { createEngagementClient } from '@whilesmart/engagement';

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig();
  const siteKey = config.public.engagementSiteKey as string;

  if (!siteKey) return;

  const engagement = createEngagementClient({
    endpoint: `${config.public.apiBase}/engagement/events`,
    siteKey
  });

  const router = useRouter();
  let currentPage = useRoute().fullPath;
  router.afterEach((to) => {
    if (to.fullPath === currentPage) return;
    currentPage = to.fullPath;
    engagement.page();
  });
  nuxtApp.hook('app:beforeUnmount', () => engagement.destroy());

  return { provide: { engagement } };
});
