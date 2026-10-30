import { ref } from 'vue';
import type { WorkspaceTransaction } from '~/types/workspace';

const open = ref(false);
const editing = ref<WorkspaceTransaction | null>(null);

export function useSpaceComposer() {
  function compose(transaction: WorkspaceTransaction | null = null) {
    editing.value = transaction;
    open.value = true;
  }

  return { open, editing, compose };
}
