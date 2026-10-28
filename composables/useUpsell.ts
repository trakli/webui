import { ref } from 'vue';
import { upsellReason, type UpsellReason } from '~/utils/upsell';

const reason = ref<UpsellReason>(null);

export function useUpsell() {
  function handle(error: unknown): boolean {
    const found = upsellReason(error);
    if (found) reason.value = found;
    return !!found;
  }

  function prompt(kind: Exclude<UpsellReason, null>) {
    reason.value = kind;
  }

  function dismiss() {
    reason.value = null;
  }

  return { reason, handle, prompt, dismiss };
}
