<template>
  <div class="space-page">
    <header class="page-head">
      <div>
        <h1>{{ t('Shared spaces') }}</h1>
        <p>
          {{
            t('Plan the money you share with family or a group. Everything else stays personal.')
          }}
        </p>
      </div>
      <div v-if="canCreate && workspaces.length" class="page-actions">
        <TButton :full-width="false" :text="t('Create a space')" @click="openCreate" />
      </div>
    </header>

    <ComponentLoader
      :is-loading="loading"
      :error="error"
      :has-data="workspaces.length > 0"
      skeleton-variant="card"
      :on-retry="reload"
    >
      <div class="spaces-grid">
        <article
          v-for="workspace in workspaces"
          :key="workspace.id"
          class="space-card tone-card"
          :class="`surface surface--${spaceTone(workspace.kind)}`"
        >
          <div class="space-card-top">
            <span class="chip">{{ workspace.kind === 'family' ? t('Family') : t('Group') }}</span>
            <span v-if="workspace.read_only" class="chip chip--warning">{{ t('Not active') }}</span>
          </div>
          <h2>{{ workspace.name }}</h2>
          <p>{{ workspace.description || t('Shared finances in one place.') }}</p>
          <div class="space-card-bottom">
            <span
              >{{
                t('{count} people', { count: workspace.member_count }, workspace.member_count)
              }}
              · {{ roleLabel(workspace.role) }}</span
            >
            <TButton
              :full-width="false"
              :variant="workspace.slug === space?.slug ? 'secondary' : 'primary'"
              :text="
                workspace.slug === space?.slug ? t('Current space') : t('Switch to this space')
              "
              :disabled="workspace.slug === space?.slug"
              @click="switchTo(workspace.slug, '/dashboard')"
            />
          </div>
        </article>
      </div>
      <template #empty>
        <div class="empty">
          <h2>{{ t('Share a budget with the people you live or plan with') }}</h2>
          <p>
            {{
              canCreate
                ? t(
                    'Create a family or group space, invite people, and track the money you spend together. Your personal finances stay private.'
                  )
                : t(
                    'Creating shared spaces is not available on this installation. You can still join one when someone invites you.'
                  )
            }}
          </p>
          <TButton
            v-if="canCreate"
            :full-width="false"
            :text="t('Create a space')"
            @click="openCreate"
          />
        </div>
      </template>
    </ComponentLoader>

    <TModal
      v-model="creating"
      :title="t('Create a shared space')"
      :description="t('It starts as a draft. You activate it before inviting people.')"
      :error="formError"
    >
      <form id="create-space" class="fields" @submit.prevent="create">
        <fieldset class="form-group kinds">
          <legend class="form-label">{{ t('Who is it for?') }}</legend>
          <label
            v-for="kind in kinds"
            :key="kind.value"
            class="kind"
            :class="{ active: form.kind === kind.value }"
          >
            <input v-model="form.kind" type="radio" name="kind" :value="kind.value" />
            <component :is="kind.icon" class="kind-icon" />
            <span>
              <strong>{{ kind.label }}</strong>
              <span class="hint">{{ kind.hint }}</span>
            </span>
          </label>
        </fieldset>
        <label class="form-group">
          <span class="form-label">{{ t('Name') }}</span>
          <input
            v-model="form.name"
            class="form-input"
            maxlength="255"
            required
            :placeholder="form.kind === 'family' ? t('The Fischer household') : t('Flat 4B')"
          />
        </label>
        <label class="form-group">
          <span class="form-label">{{ t('What is it for? (optional)') }}</span>
          <textarea v-model="form.description" class="form-textarea" rows="2" maxlength="500" />
        </label>
      </form>
      <template #actions>
        <TButton variant="secondary" :text="t('Cancel')" @click="creating = false" />
        <TButton type="submit" form="create-space" :loading="saving" :text="t('Create space')" />
      </template>
    </TModal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { HomeIcon, UsersIcon } from '@heroicons/vue/24/outline';
import TButton from '@/components/TButton.vue';
import TModal from '@/components/TModal.vue';
import ComponentLoader from '@/components/ComponentLoader.vue';
import { extractApiErrors } from '~/utils/apiErrors';
import { spaceTone } from '~/utils/activeSpace';
import type { Workspace } from '~/types/workspace';

definePageMeta({ layout: 'dashboard', middleware: 'auth' });
const { t } = useI18n();
const route = useRoute();
const api = useApi();
const { workspaces, canCreate, load } = useWorkspaces();
const { space, switchTo } = useActiveSpace();
const loading = ref(true);
const error = ref<unknown>(null);
const formError = ref('');
const creating = ref(false);
const saving = ref(false);
const form = reactive({ name: '', description: '', kind: 'family' as Workspace['kind'] });
const kinds = [
  { value: 'family' as const, label: t('Family'), hint: t('People you live with'), icon: HomeIcon },
  {
    value: 'group' as const,
    label: t('Group'),
    hint: t('Friends, flatmates or a team'),
    icon: UsersIcon
  }
];

function roleLabel(role: string) {
  return { owner: t('Owner'), admin: t('Admin'), member: t('Member') }[role] ?? role;
}

function openCreate() {
  Object.assign(form, { name: '', description: '', kind: 'family' });
  formError.value = '';
  creating.value = true;
}

async function reload() {
  loading.value = true;
  error.value = null;
  try {
    await load();
  } catch (cause) {
    error.value = cause;
  } finally {
    loading.value = false;
  }
}

async function create() {
  saving.value = true;
  formError.value = '';
  try {
    const response = await api<{ data: Workspace }>('/workspaces', { method: 'POST', body: form });
    creating.value = false;
    try {
      await load();
      await switchTo(response.data.slug, '/dashboard');
    } catch (cause) {
      error.value = cause;
    }
  } catch (cause) {
    formError.value = extractApiErrors(cause);
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  await reload();
  if (route.query.create === '1' && canCreate.value) openCreate();
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;
@use '@/assets/scss/_form-styles.scss';
@use '@/components/space/space-page' as *;
@use '@/components/space/space-form' as *;

.spaces-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
  gap: $spacing-4;
}

.space-card {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
  border-radius: $radius-xl;

  h2 {
    margin: 0;
    font-size: $font-size-lg;
    color: $text-primary;
  }

  p {
    margin: 0;
    color: $text-secondary;
  }
}

.space-card-top {
  display: flex;
  gap: $spacing-2;
}

.space-card-bottom {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-3;
  margin-top: auto;
  padding-top: $spacing-3;
  font-size: $font-size-sm;
  color: $text-secondary;

  @media (max-width: $breakpoint-sm) {
    :deep(.button) {
      width: 100%;
    }
  }
}

.chip {
  padding: 0 $spacing-2;
  border-radius: $radius-md;
  background: $bg-white;
  font-size: $font-size-xs;
  font-weight: $font-semibold;
  color: var(--surface-deep);

  &--warning {
    background: $warning-bg;
    color: $warning-text;
  }
}

.kinds {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-3;
  margin: 0;
  padding: 0;
  border: 0;

  legend {
    margin-bottom: $spacing-2;
  }

  @media (max-width: $breakpoint-sm) {
    grid-template-columns: 1fr;
  }
}

.kind {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-3;
  border: 1px solid $border-medium;
  border-radius: $radius-xl;
  cursor: pointer;

  input {
    position: absolute;
    opacity: 0;
  }

  &.active {
    border-color: $primary;
    background: $primary-light;
  }

  strong {
    display: block;
    color: $text-primary;
  }
}

.kind-icon {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  color: $primary;
}
</style>
