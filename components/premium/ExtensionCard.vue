<template>
  <NuxtLink v-if="contribution.slot === 'sidebar.nav'" :to="href">
    {{ t(contribution.ui.card?.title || contribution.integration.name) }}
  </NuxtLink>
  <TCard v-else>
    <h3>{{ t(contribution.ui.card?.title || contribution.integration.name) }}</h3>
    <p>{{ t(contribution.ui.card?.description || contribution.integration.description || '') }}</p>
    <TButton :to="href" :text="t(contribution.ui.card?.cta || 'Open')" :full-width="false" />
  </TCard>
</template>
<script setup lang="ts">
import type { SlotContribution } from '~/types/integration';
const props = defineProps<{ contribution: SlotContribution }>();
const { t } = useI18n();
const href = computed(() => props.contribution.ui.card?.href || '/settings');
</script>
