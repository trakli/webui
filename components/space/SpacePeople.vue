<template>
  <div class="space-page">
    <header class="page-head">
      <div>
        <h1>{{ t('People') }}</h1>
        <p>
          {{
            t('Everyone here sees shared wallets, budgets and spending in {name}.', {
              name: space?.name ?? ''
            })
          }}
        </p>
      </div>
      <div class="page-actions">
        <TButton
          variant="secondary"
          :full-width="false"
          :text="space?.role === 'owner' ? t('Manage spaces') : t('Leave space')"
          @click="space?.role === 'owner' ? navigateTo('/workspaces') : confirmLeave()"
        />
        <TButton
          v-if="canManage"
          :full-width="false"
          :text="t('Invite someone')"
          @click="openInvite"
        />
      </div>
    </header>

    <section v-if="invitationUrl" class="link-card tone-card surface surface--brand-soft">
      <div>
        <h2>{{ t('Invitation sent') }}</h2>
        <p>{{ t('We emailed the invitation. You can also send this link yourself.') }}</p>
      </div>
      <div class="link-row">
        <input
          class="link-input"
          :value="invitationUrl"
          readonly
          :aria-label="t('Invitation link')"
        />
        <TButton :full-width="false" :text="copied ? t('Copied') : t('Copy link')" @click="copy" />
      </div>
    </section>

    <ComponentLoader
      :is-loading="loading"
      :error="error"
      :has-data="members.length > 0"
      skeleton-variant="list"
      :on-retry="load"
    >
      <section class="panel">
        <h2>{{ t('Members') }}</h2>
        <ul class="people">
          <li v-for="member in members" :key="member.id" class="person">
            <span class="avatar" aria-hidden="true">{{ initials(member.name) }}</span>
            <span class="person-main">
              <span class="name">{{ member.name }}</span>
              <span class="muted">{{ member.email }}</span>
            </span>
            <span class="role">{{ roleLabel(member.role) }}</span>
            <SpaceRowActions :items="memberActions(member)" />
          </li>
        </ul>
      </section>

      <section v-if="canManage" class="panel">
        <h2>{{ t('Pending invitations') }}</h2>
        <ul v-if="invitations.length" class="people">
          <li v-for="invitation in invitations" :key="invitation.id" class="person">
            <span class="avatar avatar--pending" aria-hidden="true">@</span>
            <span class="person-main">
              <span class="name">{{ invitation.email }}</span>
              <span class="muted">
                {{ t('Expires {date}', { date: formatDate(invitation.expires_at) }) }}
              </span>
            </span>
            <span class="role">{{ roleLabel(invitation.role) }}</span>
            <SpaceRowActions :items="invitationActions(invitation)" />
          </li>
        </ul>
        <p v-else class="muted">
          {{ t('No one is waiting to join. Invitations you send appear here until accepted.') }}
        </p>
      </section>
    </ComponentLoader>

    <TModal
      v-model="inviteOpen"
      size="small"
      :title="t('Invite someone')"
      :description="t('They get an email with a link to join {name}.', { name: space?.name ?? '' })"
      :error="inviteError"
    >
      <form id="space-invite" class="fields" @submit.prevent="invite">
        <label class="form-group">
          <span class="form-label">{{ t('Email') }}</span>
          <input
            v-model="form.email"
            class="form-input"
            type="email"
            required
            autocomplete="email"
          />
        </label>
        <label class="form-group">
          <span class="form-label">{{ t('Role') }}</span>
          <select v-model="form.role" class="form-select">
            <option value="member">{{ t('Member: records and shares spending') }}</option>
            <option value="admin">
              {{ t('Admin: also manages budgets, wallets and people') }}
            </option>
          </select>
        </label>
      </form>
      <template #actions>
        <TButton variant="secondary" :text="t('Cancel')" @click="inviteOpen = false" />
        <TButton type="submit" form="space-invite" :loading="busy" :text="t('Send invitation')" />
      </template>
    </TModal>

    <ConfirmModal
      :is-open="!!confirming"
      :title="confirming?.title ?? ''"
      :message="confirming?.message ?? ''"
      :confirm-text="confirming?.confirm"
      type="warning"
      @confirm="runConfirm"
      @cancel="confirming = null"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, watch } from 'vue';
import TButton from '@/components/TButton.vue';
import TModal from '@/components/TModal.vue';
import ComponentLoader from '@/components/ComponentLoader.vue';
import ConfirmModal from '@/components/modals/ConfirmModal.vue';
import SpaceRowActions from './SpaceRowActions.vue';
import type { WorkspaceInvitation, WorkspaceMember } from '~/types/workspace';
import { extractApiErrors } from '~/utils/apiErrors';

const { t } = useI18n();
const route = useRoute();
const api = useApi();
const { space, canManage, switchTo } = useActiveSpace();
const { load: reloadSpaces } = useWorkspaces();
const { handle } = useUpsell();
const { confirming, ask, runConfirm } = useSpaceConfirm();
const members = ref<WorkspaceMember[]>([]);
const invitations = ref<WorkspaceInvitation[]>([]);
const loading = ref(true);
const error = ref<unknown>(null);
const inviteOpen = ref(false);
const inviteError = ref('');
const busy = ref(false);
const invitationUrl = ref('');
const copied = ref(false);
const form = reactive({ email: '', role: 'member' });
const base = () => `/workspaces/${space.value?.slug}`;

async function load() {
  if (!space.value) return;
  loading.value = true;
  error.value = null;
  try {
    members.value = (await api<{ data: WorkspaceMember[] }>(`${base()}/members`)).data;
    invitations.value = canManage.value
      ? (await api<{ data: WorkspaceInvitation[] }>(`${base()}/invitations`)).data
      : [];
  } catch (cause) {
    error.value = cause;
  } finally {
    loading.value = false;
  }
}

async function changed() {
  await Promise.all([load(), reloadSpaces()]);
}

function openInvite() {
  form.email = '';
  form.role = 'member';
  inviteError.value = '';
  inviteOpen.value = true;
}

async function invite() {
  busy.value = true;
  inviteError.value = '';
  try {
    const response = await api<{ data: { url: string } }>(`${base()}/members/invite`, {
      method: 'POST',
      body: form
    });
    invitationUrl.value = response.data.url;
    copied.value = false;
    inviteOpen.value = false;
    await changed();
  } catch (cause) {
    if (handle(cause)) inviteOpen.value = false;
    else inviteError.value = extractApiErrors(cause);
  } finally {
    busy.value = false;
  }
}

async function copy() {
  await navigator.clipboard.writeText(invitationUrl.value);
  copied.value = true;
}

function roleLabel(role: string) {
  return { owner: t('Owner'), admin: t('Admin'), member: t('Member') }[role] ?? role;
}

function memberActions(member: WorkspaceMember) {
  if (!canManage.value || member.role === 'owner') return [];
  const promote = member.role !== 'admin';
  return [
    {
      label: promote ? t('Make admin') : t('Make member'),
      run: () =>
        ask({
          title: promote
            ? t('Make {name} an admin?', { name: member.name })
            : t('Make {name} a member?', { name: member.name }),
          message: promote
            ? t('Admins manage budgets, shared wallets and people.')
            : t('Members record and share spending.'),
          confirm: t('Change role'),
          action: async () => {
            await api(`${base()}/members/${member.id}`, {
              method: 'PATCH',
              body: { role: promote ? 'admin' : 'member' }
            });
            await changed();
          }
        })
    },
    {
      label: t('Remove'),
      danger: true,
      run: () =>
        ask({
          title: t('Remove {name}?', { name: member.name }),
          message: t(
            'Their shared personal records leave the space. Entries in shared wallets stay.'
          ),
          confirm: t('Remove'),
          action: async () => {
            await api(`${base()}/members/${member.id}`, { method: 'DELETE' });
            await changed();
          }
        })
    }
  ];
}

function invitationActions(invitation: WorkspaceInvitation) {
  return [
    {
      label: t('Resend'),
      run: async () => {
        await api(`${base()}/invitations/${invitation.id}/resend`, { method: 'POST' });
        await load();
      }
    },
    {
      label: t('Cancel invitation'),
      danger: true,
      run: () =>
        ask({
          title: t('Cancel the invitation for {email}?', { email: invitation.email }),
          message: t('The link stops working.'),
          confirm: t('Cancel invitation'),
          action: async () => {
            await api(`${base()}/invitations/${invitation.id}`, { method: 'DELETE' });
            await load();
          }
        })
    }
  ];
}

function confirmLeave() {
  ask({
    title: t('Leave {name}?', { name: space.value?.name ?? '' }),
    message: t('Your shared personal records leave the space. Entries in shared wallets stay.'),
    confirm: t('Leave'),
    action: async () => {
      await api(`${base()}/leave`, { method: 'POST' });
      await reloadSpaces();
      await switchTo('personal', '/dashboard');
    }
  });
}

function initials(name: string) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
}

watch(() => space.value?.slug, load);
onMounted(async () => {
  await load();
  if (route.query.invite === '1' && canManage.value) openInvite();
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;
@use '@/assets/scss/_form-styles.scss';
@use './space-page' as *;
@use './space-form' as *;

.link-card {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-4;
  margin-bottom: $spacing-5;
  border-radius: $radius-xl;

  h2 {
    margin: 0;
    font-size: $font-size-lg;
  }

  p {
    margin: $spacing-1 0 0;
    color: $text-secondary;
  }
}

.link-row {
  display: flex;
  gap: $spacing-2;
  width: min(32rem, 100%);

  @media (max-width: $breakpoint-sm) {
    flex-direction: column;

    :deep(.button) {
      width: 100%;
    }
  }
}

.link-input {
  flex: 1;
  min-width: 0;
  padding: $spacing-2 $spacing-3;
  border: 1px solid $border-medium;
  border-radius: $radius-md;
  background: $bg-white;
  color: $text-primary;
  font: inherit;
  font-size: $font-size-sm;
}

.panel {
  margin-bottom: $spacing-5;
  padding: $spacing-5;
  background: $bg-white;
  border: 1px solid $border-light;
  border-radius: $radius-xl;
  box-shadow: $elevation-1;

  h2 {
    margin: 0 0 $spacing-3;
    font-size: $font-size-lg;
    color: $text-primary;
  }

  @media (max-width: $breakpoint-sm) {
    padding: $spacing-4;
  }
}

.people {
  margin: 0;
  padding: 0;
  list-style: none;
}

.person {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto auto;
  align-items: center;
  gap: $spacing-3;
  padding: 6px 10px;
  border-bottom: 1px solid $border-light;

  &:last-child {
    border-bottom: 0;
  }

  @media (max-width: $breakpoint-sm) {
    grid-template-columns: auto minmax(0, 1fr) auto;

    .role {
      grid-column: 2;
      grid-row: 2;
      justify-self: start;
    }
  }
}

.avatar {
  display: grid;
  place-items: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  background: $primary-light;
  color: $primary-dark;
  font-size: $font-size-sm;
  font-weight: $font-semibold;

  &--pending {
    background: $bg-light;
    color: $text-secondary;
  }
}

.person-main {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.name {
  overflow: hidden;
  color: $text-primary;
  font-weight: $font-medium;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.muted {
  overflow: hidden;
  font-size: $font-size-sm;
  color: $text-secondary;
  text-overflow: ellipsis;
}

.role {
  padding: 0 $spacing-2;
  border-radius: $radius-md;
  background: $bg-light;
  font-size: $font-size-xs;
  font-weight: $font-semibold;
  color: $text-secondary;
}
</style>
