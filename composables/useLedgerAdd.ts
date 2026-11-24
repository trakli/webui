import { ref } from 'vue';

const open = ref(false);
const hosts = ref(0);

export function useLedgerAdd() {
  function start() {
    const wide = typeof window !== 'undefined' && window.matchMedia('(min-width: 1100px)').matches;
    if (hosts.value > 0 && wide) open.value = true;
    else navigateTo('/transactions/new');
  }
  return { open, hosts, start, close: () => (open.value = false) };
}
