import { ref } from 'vue';
import { extractApiErrors } from '~/utils/apiErrors';

interface Confirmation {
  title: string;
  message: string;
  confirm: string;
  action: () => Promise<unknown>;
}

export function useSpaceConfirm() {
  const confirming = ref<Confirmation | null>(null);
  const { handle } = useUpsell();
  const { showError } = useNotifications();
  const { t } = useI18n();

  function ask(confirmation: Confirmation) {
    confirming.value = confirmation;
  }

  async function runConfirm() {
    const current = confirming.value;
    confirming.value = null;
    if (!current) return;
    try {
      await current.action();
    } catch (cause) {
      if (!handle(cause)) showError(t('Something went wrong'), extractApiErrors(cause));
    }
  }

  return { confirming, ask, runConfirm };
}
