<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import {
  DsPageHeader,
  DsButton,
  DsCard,
  DsChip,
  DsModal,
  DsInput,
  DsTextarea,
  DsStatePanel
} from '@whilesmart/design';
import { extractApiErrors } from '~/utils/apiErrors';
import type { Workspace } from '~/types/workspace';

definePageMeta({ layout: 'dashboard', middleware: 'auth' });
const { workspaces, canCreate, load } = useWorkspaces();
const api = useApi();
const loading = ref(true);
const error = ref('');
const formError = ref('');
const creating = ref(false);
const saving = ref(false);
const form = reactive({ name: '', description: '' });
async function reload() {
  loading.value = true;
  error.value = '';
  try {
    await load();
  } catch (cause) {
    error.value = extractApiErrors(cause);
  } finally {
    loading.value = false;
  }
}
async function create() {
  saving.value = true;
  formError.value = '';
  try {
    const response = await api<{ data: Workspace }>('/workspaces', { method: 'POST', body: form });
    await load();
    await navigateTo(`/workspaces/${response.data.slug}`);
  } catch (cause) {
    formError.value = extractApiErrors(cause);
  } finally {
    saving.value = false;
  }
}
onMounted(reload);
</script>

<template>
  <main class="spaces-page">
    <DsPageHeader
      title="Better together"
      eyebrow="Families and groups"
      description="Plan the things you share. Keep the rest personal."
    >
      <template #actions
        ><DsButton v-if="canCreate" icon="solar:add-circle-linear" @click="creating = true"
          >Create a space</DsButton
        ></template
      >
    </DsPageHeader>
    <DsStatePanel v-if="loading" state="loading" title="Loading your spaces" />
    <DsStatePanel
      v-else-if="error"
      state="error"
      title="Could not load your spaces"
      :description="error"
      action-label="Try again"
      @action="reload"
    />
    <template v-else>
      <DsStatePanel
        v-if="!workspaces.length"
        title="A shared plan starts here"
        description="Create a family or group, invite your people, and set your first spending limit."
        :action-label="canCreate ? 'Create a space' : ''"
        @action="creating = true"
      />
      <DsCard v-if="!canCreate" class="plan-notice"
        ><p>Creating shared spaces is currently unavailable. You can still join an invitation.</p>
      </DsCard>
      <div class="spaces-grid">
        <DsCard v-for="workspace in workspaces" :key="workspace.id" class="space-card">
          <div class="space-card__top">
            <DsChip variant="primary">Shared space</DsChip
            ><DsChip v-if="workspace.read_only" variant="warning">Read-only</DsChip>
          </div>
          <h2>{{ workspace.name }}</h2>
          <p>{{ workspace.description || 'Your shared finances, in one place.' }}</p>
          <div class="space-card__bottom">
            <span
              >{{ workspace.member_count }}
              {{ workspace.member_count === 1 ? 'member' : 'members' }}</span
            ><DsButton :to="`/workspaces/${workspace.slug}`" variant="secondary"
              >Open space</DsButton
            >
          </div>
        </DsCard>
      </div>
    </template>
    <DsModal
      v-model="creating"
      title="Create a shared space"
      description="Your personal finances stay private. You choose what to share."
    >
      <form class="space-form" @submit.prevent="create">
        <DsInput v-model="form.name" label="Space name" placeholder="Our household" required />
        <DsTextarea v-model="form.description" label="Description" :rows="2" />
        <p v-if="formError" role="alert">{{ formError }}</p>
        <div class="space-actions">
          <DsButton variant="ghost" @click="creating = false">Cancel</DsButton
          ><DsButton type="submit" :loading="saving">Create space</DsButton>
        </div>
      </form>
    </DsModal>
  </main>
</template>

<style scoped>
.spaces-page {
  display: grid;
  gap: var(--ds-space-6);
  color: var(--ds-text-primary);
}
.spaces-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 20rem), 1fr));
  gap: var(--ds-space-5);
}
.space-card {
  display: flex;
  flex-direction: column;
  gap: var(--ds-space-3);
}
.space-card__top,
.space-card__bottom,
.space-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--ds-space-3);
}
h2,
p {
  margin: 0;
}
p,
.space-card__bottom > span {
  color: var(--ds-text-secondary);
}
.space-card__bottom {
  margin-top: auto;
  padding-top: var(--ds-space-5);
}
.space-form {
  display: grid;
  gap: var(--ds-space-4);
}
.space-actions {
  justify-content: flex-end;
}
.plan-notice {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--ds-space-4);
}
@media (max-width: 600px) {
  .space-actions {
    flex-direction: column-reverse;
    align-items: stretch;
  }
  .plan-notice {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
