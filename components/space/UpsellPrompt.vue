<template>
  <TModal
    :model-value="!!reason"
    size="small"
    :title="title"
    :description="description"
    @update:model-value="dismiss"
  >
    <template #actions>
      <TButton variant="secondary" :text="t('Not now')" @click="dismiss" />
      <TButton v-if="target" :text="actionLabel" @click="go" />
    </template>
  </TModal>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import TModal from '@/components/TModal.vue';
import TButton from '@/components/TButton.vue';

const { t } = useI18n();
const { reason, dismiss } = useUpsell();
const { space, isOwner } = useActiveSpace();
const { resolveComponent } = useExtensionSlots();
const hasSpaceBilling = computed(() => !!resolveComponent('cloud.workspace.billing'));

const title = computed(() =>
  reason.value === 'personal'
    ? t('You have reached your plan limit')
    : t('Activate {name} to make changes', { name: space.value?.name ?? t('this space') })
);
const description = computed(() => {
  if (reason.value === 'personal') return t('Upgrade your plan to keep adding records.');
  return isOwner.value
    ? t(
        'A shared space becomes editable once its subscription is active. Everyone in it can then record, budget and invite.'
      )
    : t('Only the owner can activate this space. Ask them to complete checkout, then try again.');
});
const target = computed(() => {
  if (reason.value === 'personal') return '/billing';
  return isOwner.value && hasSpaceBilling.value ? '/space-billing' : null;
});
const actionLabel = computed(() =>
  reason.value === 'personal' ? t('View plans') : t('Activate space')
);

async function go() {
  const to = target.value;
  dismiss();
  if (to) await navigateTo(to);
}
</script>
