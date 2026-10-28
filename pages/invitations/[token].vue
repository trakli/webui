<template>
  <section class="invitation">
    <ComponentLoader :is-loading="loading" :has-data="!!preview" skeleton-variant="card">
      <template v-if="preview">
        <div v-if="declined" class="state">
          <h1>{{ t('Invitation declined') }}</h1>
          <p>{{ t('Nothing was shared. You can close this page.') }}</p>
          <TButton :text="t('Go to Trakli')" to="/dashboard" />
        </div>
        <template v-else>
          <span class="eyebrow">{{ t("You're invited") }}</span>
          <h1>{{ t('Join {name}', { name: preview.workspace.name }) }}</h1>
          <p>
            {{
              t('{inviter} invited {email} to join as {role}.', {
                inviter: preview.invited_by,
                email: preview.email,
                role: preview.role === 'admin' ? t('an admin') : t('a member')
              })
            }}
          </p>
          <ul class="facts">
            <li>{{ t('You see the wallets, budgets and spending shared in this space.') }}</li>
            <li>{{ t('Your personal finances stay private. You choose what to share.') }}</li>
          </ul>
          <p v-if="error" class="error" role="alert">{{ error }}</p>

          <div v-if="preview.status !== 'pending'" class="state">
            <h2>{{ statusTitle }}</h2>
            <p>
              {{
                t('Ask {inviter} to send you a new invitation.', { inviter: preview.invited_by })
              }}
            </p>
            <TButton :text="t('Go to Trakli')" :to="isAuthenticated ? '/dashboard' : '/login'" />
          </div>
          <div v-else-if="isAuthenticated" class="actions">
            <TButton
              variant="secondary"
              :disabled="busy"
              :text="t('Decline')"
              @click="respond(false)"
            />
            <TButton
              :loading="busy"
              :text="t('Accept and open the space')"
              @click="respond(true)"
            />
          </div>
          <div v-else class="actions">
            <TButton variant="secondary" :text="t('I have an account')" :to="loginLink" />
            <TButton :text="t('Create an account')" to="/register" />
          </div>
        </template>
      </template>
      <template #empty>
        <div class="state">
          <h1>{{ t('This invitation link does not work') }}</h1>
          <p>
            {{ error || t('It may have been mistyped or cancelled.') }}
            {{ t('Ask the person who invited you for a new link.') }}
          </p>
          <TButton :text="t('Go to Trakli')" :to="isAuthenticated ? '/dashboard' : '/login'" />
        </div>
      </template>
    </ComponentLoader>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import TButton from '@/components/TButton.vue';
import ComponentLoader from '@/components/ComponentLoader.vue';
import { extractApiErrors } from '~/utils/apiErrors';

definePageMeta({ layout: 'auth' });
const { t } = useI18n();
const route = useRoute();
const api = useApi();
const { isAuthenticated } = useAuth();
const { remember } = usePendingInvitation();
const { switchTo } = useActiveSpace();
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
const token = String(route.params.token);
const loginLink = `/login?returnTo=${encodeURIComponent(`/invitations/${token}`)}`;
const statusTitle = computed(() => {
  const status = preview.value?.status;
  if (status === 'accepted') return t('This invitation was already accepted');
  if (status === 'declined') return t('This invitation was declined');
  return t('This invitation has expired');
});

async function load() {
  loading.value = true;
  try {
    preview.value = (
      await api<{ data: NonNullable<typeof preview.value> }>(`/workspaces/invitations/${token}`)
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
    await api(`/workspaces/invitations/${token}/${accept ? 'accept' : 'decline'}`, {
      method: 'POST'
    });
    if (!accept) {
      declined.value = true;
      return;
    }
    await useWorkspaces().load();
    await switchTo(preview.value!.workspace.slug, '/dashboard');
  } catch (cause) {
    error.value = extractApiErrors(cause);
  } finally {
    busy.value = false;
  }
}

onMounted(() => {
  if (!isAuthenticated.value) remember(`/invitations/${token}`);
  load();
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.invitation {
  width: min(100%, 32rem);
  margin: $spacing-8 auto;
  padding: $spacing-8;
  background: $bg-white;
  border: 1px solid $border-light;
  border-radius: $radius-xl;
  box-shadow: $elevation-2;
  color: $text-primary;

  @media (max-width: $breakpoint-sm) {
    margin: $spacing-4 auto;
    padding: $spacing-5;
  }

  h1 {
    margin: $spacing-2 0;
    font-size: $font-size-2xl;
  }

  h2 {
    margin: 0;
    font-size: $font-size-lg;
  }

  p {
    margin: 0 0 $spacing-3;
    color: $text-secondary;
    line-height: 1.6;
  }
}

.eyebrow {
  display: inline-block;
  padding: 0 $spacing-3;
  border-radius: $radius-md;
  background: $primary-light;
  color: $primary-dark;
  font-size: $font-size-xs;
  font-weight: $font-semibold;
}

.facts {
  margin: 0 0 $spacing-5;
  padding-left: $spacing-5;
  color: $text-secondary;

  li {
    margin-bottom: $spacing-1;
  }
}

.error {
  color: $error-color !important;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: $spacing-3;

  :deep(.button) {
    width: auto;
  }

  @media (max-width: $breakpoint-sm) {
    flex-direction: column-reverse;

    :deep(.button) {
      width: 100%;
    }
  }
}

.state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: $spacing-2;
}
</style>
