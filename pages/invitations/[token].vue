<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { DsCard, DsButton, DsChip, DsStatePanel } from '@whilesmart/design';
import { extractApiErrors } from '~/utils/apiErrors';

definePageMeta({ layout: 'auth' });
const route = useRoute();
const api = useApi();
const { isAuthenticated } = useAuth();
const preview = ref<{
  workspace: { name: string; slug: string };
  email: string;
  invited_by: string;
  role: string;
  status: string;
} | null>(null);
const loading = ref(true);
const busy = ref(false);
const error = ref('');
const declined = ref(false);
async function load() {
  loading.value = true;
  try {
    preview.value = (
      await api<{ data: NonNullable<typeof preview.value> }>(
        `/workspaces/invitations/${String(route.params.token)}`
      )
    ).data;
  } catch (cause) {
    error.value = extractApiErrors(cause);
  } finally {
    loading.value = false;
  }
}
async function respond(accept: boolean) {
  busy.value = true;
  error.value = '';
  try {
    await api(
      `/workspaces/invitations/${String(route.params.token)}/${accept ? 'accept' : 'decline'}`,
      { method: 'POST' }
    );
    if (accept) {
      await useWorkspaces().load();
      await navigateTo(`/workspaces/${preview.value!.workspace.slug}`);
    } else {
      declined.value = true;
    }
  } catch (cause) {
    error.value = extractApiErrors(cause);
  } finally {
    busy.value = false;
  }
}
onMounted(load);
</script>

<template>
  <DsCard class="invitation">
    <DsStatePanel v-if="loading" state="loading" title="Opening your invitation" />
    <DsStatePanel
      v-else-if="!preview"
      state="error"
      title="Invitation unavailable"
      :description="error"
    />
    <DsStatePanel
      v-else-if="declined"
      title="Invitation declined"
      description="Your personal finances have not been shared."
      action-label="Back to Trakli"
      @action="navigateTo('/dashboard')"
    />
    <template v-else>
      <DsChip variant="primary">You're invited</DsChip>
      <h1>Join {{ preview.workspace.name }}</h1>
      <p>
        {{ preview.invited_by }} invited {{ preview.email }} to join as
        {{ preview.role === 'admin' ? 'an admin' : 'a member' }}.
      </p>
      <p>Your personal finances stay private. You choose which wallets or transactions to share.</p>
      <p v-if="error" role="alert">{{ error }}</p>
      <DsStatePanel
        v-if="preview.status !== 'pending'"
        :title="`This invitation is ${preview.status}`"
        description="Ask a workspace admin for a new invitation if needed."
      />
      <div v-else-if="isAuthenticated" class="actions">
        <DsButton variant="ghost" :disabled="busy" @click="respond(false)">Decline</DsButton
        ><DsButton :loading="busy" @click="respond(true)">Accept invitation</DsButton>
      </div>
      <DsButton v-else :to="`/login?returnTo=${encodeURIComponent(route.fullPath)}`"
        >Sign in to respond</DsButton
      >
    </template>
  </DsCard>
</template>

<style scoped>
.invitation {
  display: grid;
  gap: var(--ds-space-5);
  width: min(100%, 32rem);
  margin: var(--ds-space-6) auto;
  color: var(--ds-text-primary);
}
h1,
p {
  margin: 0;
}
p {
  color: var(--ds-text-secondary);
  line-height: 1.6;
}
.actions {
  display: flex;
  gap: var(--ds-space-3);
  justify-content: flex-end;
}
@media (max-width: 600px) {
  .actions {
    flex-direction: column-reverse;
  }
}
</style>
