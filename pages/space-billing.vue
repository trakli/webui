<template>
  <div v-if="space" class="space-page">
    <header class="page-head">
      <div>
        <h1>{{ t('Billing') }}</h1>
        <p>
          {{
            t('{name} has its own subscription, separate from your personal plan.', {
              name: space.name
            })
          }}
        </p>
      </div>
    </header>
    <component
      :is="billing"
      v-if="billing && isOwner"
      :key="space.slug"
      :workspace="space"
      @changed="refresh"
    />
    <div v-else class="empty">
      <h2>
        {{ billing ? t('Only the owner manages billing') : t('Billing is not available here') }}
      </h2>
      <p>
        {{
          billing
            ? t('Ask the owner of {name} if the space needs more people or has stopped working.', {
                name: space.name
              })
            : t('This installation does not charge for shared spaces.')
        }}
      </p>
      <TButton
        :full-width="false"
        variant="secondary"
        :text="t('Back to the dashboard')"
        to="/dashboard"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import TButton from '@/components/TButton.vue';

definePageMeta({ layout: 'dashboard', middleware: 'auth' });
const { t } = useI18n();
const { space, isOwner } = useActiveSpace();
const { resolveComponent } = useExtensionSlots();
const { load } = useWorkspaces();
const { load: loadFinance } = useSpaceFinance();
const billing = resolveComponent('cloud.workspace.billing');

async function refresh() {
  await load();
  await loadFinance(1);
}
</script>

<style lang="scss" scoped>
@use '@/components/space/space-page' as *;
</style>
