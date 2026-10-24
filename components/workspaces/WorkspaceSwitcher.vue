<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { DsWorkspaceMenu, DsMenuItem } from '@whilesmart/design';
const route = useRoute();
const { workspaces, load } = useWorkspaces();
const options = computed(() => [
  { id: 'personal', name: 'Personal', kind: 'Private' },
  ...workspaces.value.map((workspace) => ({
    id: workspace.slug,
    name: workspace.name,
    kind: workspace.kind === 'family' ? 'Family' : 'Group'
  }))
]);
const active = computed(() =>
  typeof route.params.slug === 'string' && route.path.startsWith('/workspaces/')
    ? route.params.slug
    : 'personal'
);
onMounted(() => load().catch(() => {}));
function choose(option: { id: string | number }) {
  navigateTo(option.id === 'personal' ? '/dashboard' : `/workspaces/${option.id}`);
}
</script>

<template>
  <DsWorkspaceMenu :options="options" :active="active" heading="Your spaces" @choose="choose">
    <DsMenuItem @click="navigateTo('/workspaces')">Manage families and groups</DsMenuItem>
  </DsWorkspaceMenu>
</template>
