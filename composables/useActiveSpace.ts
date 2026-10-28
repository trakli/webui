import { computed } from 'vue';
import { PERSONAL_SPACE, landingAfterSwitch, resolveSpace } from '~/utils/activeSpace';

export function useActiveSpace() {
  const stored = useCookie<string | null>('trakli.space', {
    default: () => PERSONAL_SPACE,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30
  });
  const { workspaces } = useWorkspaces();
  const space = computed(() => resolveSpace(stored.value, workspaces.value));
  const isShared = computed(() => !!space.value);
  const canManage = computed(() => !!space.value?.can_manage);
  const canWrite = computed(() => !!space.value && !space.value.read_only);
  const isOwner = computed(() => space.value?.role === 'owner');

  async function switchTo(slug: string, path?: string) {
    stored.value = slug;
    const route = useRoute();
    await navigateTo(path ?? landingAfterSwitch(route.path, slug !== PERSONAL_SPACE));
  }

  function clear() {
    stored.value = PERSONAL_SPACE;
  }

  return { space, isShared, canManage, canWrite, isOwner, switchTo, clear };
}
