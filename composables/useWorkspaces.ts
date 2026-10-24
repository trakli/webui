import type { Workspace, Page } from '~/types/workspace';

export function useWorkspaces() {
  const workspaces = useState<Workspace[]>('workspaces', () => []);
  const canCreate = useState('workspaces.canCreate', () => false);
  const api = useApi();

  async function load() {
    const response = await api<{ data: Page<Workspace> & { can_create: boolean } }>('/workspaces');
    workspaces.value = response.data.data;
    canCreate.value = response.data.can_create;
  }

  function clear() {
    workspaces.value = [];
    canCreate.value = false;
  }

  return { workspaces, canCreate, load, clear };
}
