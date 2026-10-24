<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import {
  DsCard,
  DsButton,
  DsChip,
  DsInput,
  DsDropdown,
  DsModal,
  DsStatePanel,
  DsAvatar
} from '@whilesmart/design';
import type { Workspace, WorkspaceMember, WorkspaceInvitation } from '~/types/workspace';
import { extractApiErrors } from '~/utils/apiErrors';
const props = defineProps<{ workspace: Workspace }>();
const emit = defineEmits<{ changed: [] }>();
const api = useApi();
const members = ref<WorkspaceMember[]>([]);
const invitations = ref<WorkspaceInvitation[]>([]);
const loading = ref(true);
const error = ref('');
const busy = ref(false);
const inviteOpen = ref(false);
const invitationUrl = ref('');
const form = reactive({ email: '', role: 'member' });
const confirmation = ref<{
  title: string;
  description: string;
  action: () => Promise<void>;
} | null>(null);
const base = `/workspaces/${props.workspace.slug}`;
async function load() {
  loading.value = true;
  error.value = '';
  try {
    members.value = (await api<{ data: WorkspaceMember[] }>(`${base}/members`)).data;
    const currentSpace = (await api<{ data: Workspace }>(base)).data;
    invitations.value = currentSpace.can_manage
      ? (await api<{ data: WorkspaceInvitation[] }>(`${base}/invitations`)).data
      : [];
  } catch (cause) {
    error.value = extractApiErrors(cause);
  } finally {
    loading.value = false;
  }
}
async function run(action: () => Promise<void>) {
  busy.value = true;
  error.value = '';
  try {
    await action();
    confirmation.value = null;
    await load();
    emit('changed');
  } catch (cause) {
    error.value = extractApiErrors(cause);
  } finally {
    busy.value = false;
  }
}
async function invite() {
  await run(async () => {
    const response = await api<{ data: { url: string } }>(`${base}/members/invite`, {
      method: 'POST',
      body: form
    });
    invitationUrl.value = response.data.url;
    form.email = '';
    inviteOpen.value = false;
  });
}
function changeRole(member: WorkspaceMember) {
  const role = member.role === 'admin' ? 'member' : 'admin';
  confirmation.value = {
    title: role === 'admin' ? `Make ${member.name} an admin?` : `Make ${member.name} a member?`,
    description:
      role === 'admin'
        ? 'Admins manage budgets, shared wallets, and membership. They can promote other members to admin.'
        : 'Members can record transactions and edit their own workspace entries.',
    action: async () => {
      await api(`${base}/members/${member.id}`, { method: 'PATCH', body: { role } });
    }
  };
}
function remove(member: WorkspaceMember) {
  confirmation.value = {
    title: `Remove ${member.name}?`,
    description:
      'Their personal wallet and transaction shares will be revoked. Entries recorded in workspace wallets stay with the space.',
    action: async () => {
      await api(`${base}/members/${member.id}`, { method: 'DELETE' });
    }
  };
}
onMounted(load);
</script>

<template>
  <section class="members">
    <header>
      <div>
        <h2>Your people</h2>
        <p>One plan, with clear responsibilities.</p>
      </div>
      <DsButton v-if="workspace.can_manage && !workspace.read_only" @click="inviteOpen = true"
        >Invite someone</DsButton
      >
    </header>
    <DsStatePanel v-if="loading" state="loading" title="Loading members" />
    <p v-if="error" role="alert">{{ error }}</p>
    <DsCard v-for="member in members" :key="member.id" padding="sm" class="member-row">
      <div class="member-info">
        <DsAvatar :name="member.name" />
        <div>
          <strong>{{ member.name }}</strong>
          <p>{{ member.email }}</p>
        </div>
        <DsChip>{{ member.role }}</DsChip>
      </div>
      <div v-if="workspace.can_manage && member.role !== 'owner'" class="actions">
        <DsButton
          v-if="!workspace.read_only"
          variant="ghost"
          size="sm"
          :disabled="busy"
          @click="changeRole(member)"
          >{{ member.role === 'admin' ? 'Make member' : 'Make admin' }}</DsButton
        ><DsButton variant="ghost" size="sm" :disabled="busy" @click="remove(member)"
          >Remove</DsButton
        >
      </div>
    </DsCard>
    <template v-if="workspace.can_manage"
      ><h3>Pending invitations</h3>
      <DsStatePanel
        v-if="!loading && !invitations.length"
        title="Everyone is accounted for"
        description="Invitations you send will appear here until they are accepted or expire."
        :action-label="workspace.read_only ? '' : 'Invite someone'"
        @action="inviteOpen = true"
      />
      <DsCard v-for="invitation in invitations" :key="invitation.id" padding="sm" class="member-row"
        ><div>
          <strong>{{ invitation.email }}</strong>
          <p>
            {{ invitation.role }} · Expires
            {{ new Date(invitation.expires_at).toLocaleDateString() }}
          </p>
        </div>
        <div class="actions">
          <DsButton
            v-if="!workspace.read_only"
            variant="ghost"
            :disabled="busy"
            @click="
              run(async () => {
                const result = await api<{ data: { url: string } }>(
                  `${base}/invitations/${invitation.id}/resend`,
                  { method: 'POST' }
                );
                invitationUrl = result.data.url;
              })
            "
            >Resend</DsButton
          ><DsButton
            variant="ghost"
            :disabled="busy"
            @click="
              run(async () => {
                await api(`${base}/invitations/${invitation.id}`, { method: 'DELETE' });
              })
            "
            >Cancel</DsButton
          >
        </div></DsCard
      >
    </template>
    <DsCard v-if="invitationUrl"
      ><strong>Invitation sent</strong>
      <p>You can also copy this invitation link:</p>
      <input
        class="ds-field__control"
        :value="invitationUrl"
        aria-label="Invitation link"
        readonly
        @focus="($event.target as HTMLInputElement).select()"
    /></DsCard>
    <DsModal
      v-model="inviteOpen"
      title="Invite someone"
      description="Invite them using the email address they use for Trakli."
      ><form class="invite-form" @submit.prevent="invite">
        <DsInput v-model="form.email" label="Email address" type="email" required /><DsDropdown
          v-model="form.role"
          label="Role"
          :options="[
            { value: 'member', label: 'Member' },
            { value: 'admin', label: 'Admin' }
          ]"
        />
        <p v-if="error" role="alert">{{ error }}</p>
        <DsButton type="submit" :loading="busy">Send invitation</DsButton>
      </form></DsModal
    >
    <DsModal
      :model-value="!!confirmation"
      :title="confirmation?.title || 'Confirm'"
      :description="confirmation?.description"
      @update:model-value="!$event && (confirmation = null)"
      ><p v-if="error" role="alert">{{ error }}</p>
      <div class="actions">
        <DsButton variant="ghost" @click="confirmation = null">Cancel</DsButton
        ><DsButton :loading="busy" @click="confirmation && run(confirmation.action)"
          >Confirm</DsButton
        >
      </div></DsModal
    >
  </section>
</template>

<style scoped>
.members,
.invite-form {
  display: grid;
  gap: var(--ds-space-4);
}
header,
.member-row,
.member-info,
.actions {
  display: flex;
  align-items: center;
  gap: var(--ds-space-3);
}
header,
.member-row {
  justify-content: space-between;
}
h2,
h3,
p {
  margin: 0;
}
p {
  color: var(--ds-text-secondary);
  font-size: var(--ds-text-sm);
}
.member-info {
  flex-wrap: wrap;
}
.actions {
  justify-content: flex-end;
}
input {
  margin-top: var(--ds-space-3);
}
@media (max-width: 600px) {
  header,
  .member-row {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
