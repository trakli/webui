<template>
  <div class="pa" :class="[`is-${state}`, { 'is-nested': nested }]">
    <div class="pa-main">
      <span class="pa-tile" :class="`tile-${tone}`" aria-hidden="true">
        <component :is="icon" class="pa-tile-icon" />
      </span>

      <div class="pa-body">
        <p class="pa-summary">{{ block.summary }}</p>
        <dl v-if="context.length" class="pa-context">
          <div v-for="f in context" :key="f.key" class="pa-context-row">
            <dt>{{ f.label }}</dt>
            <dd>{{ f.display || f.value }}</dd>
          </div>
        </dl>
      </div>

      <div v-if="state === 'pending'" class="pa-actions">
        <button
          v-if="hasEditable"
          type="button"
          class="pa-icon-btn"
          :aria-expanded="open"
          :title="open ? t('Done editing') : t('Edit')"
          @click="open = !open"
        >
          <IconEdit class="pa-btn-icon" />
        </button>
        <button
          type="button"
          class="pa-btn pa-dismiss"
          :disabled="busy"
          :title="t('Dismiss')"
          @click="reject"
        >
          {{ t('Dismiss') }}
        </button>
        <button type="button" class="pa-btn pa-confirm" :disabled="busy" @click="confirm">
          <IconSpinner v-if="busy" class="pa-btn-icon pa-spin" />
          <IconCheck v-else class="pa-btn-icon" />
          <span>{{ t('Confirm') }}</span>
        </button>
      </div>

      <span v-else class="pa-status" :class="`is-${state}`">
        <component :is="statusIcon" class="pa-status-icon" />
        <span>{{ statusLabel }}</span>
      </span>
    </div>

    <Transition name="pa-expand">
      <div v-if="open && state === 'pending'" class="pa-edit">
        <ChatActionFields :fields="fields" @change="onFieldsChange" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { aiApi, type ProposedActionBlock, type ProposedActionField } from '@/services/api/aiApi';
import ChatActionFields from './ChatActionFields.vue';
import IconCheck from '~icons/solar/check-circle-bold';
import IconClose from '~icons/solar/close-circle-bold';
import IconEdit from '~icons/solar/pen-2-linear';
import IconSpinner from '~icons/solar/refresh-linear';
import IconTag from '~icons/solar/tag-horizontal-bold';
import IconWallet from '~icons/solar/wallet-2-bold';
import IconTransfer from '~icons/solar/transfer-horizontal-bold';
import IconBill from '~icons/solar/bill-list-bold';
import IconUser from '~icons/solar/user-rounded-bold';
import IconPaperclip from '~icons/solar/paperclip-linear';

const props = withDefaults(
  defineProps<{ block: ProposedActionBlock; sessionId: number; nested?: boolean }>(),
  { nested: false }
);
const emit = defineEmits<{ (e: 'changed'): void }>();

const { t } = useI18n();
const { showError } = useNotifications();

const fields = computed<ProposedActionField[]>(() => props.block.fields ?? []);
// Readonly rows are what the card shows at rest: they name the record being
// changed, which is the whole point of not putting raw ids in front of people.
const context = computed(() => fields.value.filter((f) => f.type === 'readonly'));
const hasEditable = computed(() => fields.value.some((f) => f.type !== 'readonly'));

const open = ref(false);
const busy = ref(false);
const overrides = ref<Record<string, unknown>>({});

const state = ref<'pending' | 'executed' | 'rejected' | 'failed'>(
  props.block.status === 'executed'
    ? 'executed'
    : props.block.status === 'rejected'
      ? 'rejected'
      : props.block.status === 'failed'
        ? 'failed'
        : 'pending'
);

const ICONS: Record<string, unknown> = {
  'transaction.categorize': IconTag,
  'transaction.create': IconBill,
  'transaction.attach_file': IconPaperclip,
  'transfer.create': IconTransfer,
  'wallet.create': IconWallet,
  'category.create': IconTag,
  'party.create': IconUser
};

const icon = computed(() => ICONS[props.block.action_type] ?? IconBill);
const tone = computed(() => {
  if (state.value === 'executed') return 'done';
  if (state.value === 'rejected') return 'muted';
  if (state.value === 'failed') return 'danger';
  return props.block.action_type.endsWith('.create') ? 'brand' : 'accent';
});

const statusIcon = computed(() => (state.value === 'executed' ? IconCheck : IconClose));
const statusLabel = computed(() =>
  state.value === 'executed' ? t('Done') : state.value === 'failed' ? t('Failed') : t('Dismissed')
);

function onFieldsChange(next: Record<string, unknown>) {
  overrides.value = next;
}

async function confirm() {
  busy.value = true;
  try {
    await aiApi.confirmAction(props.sessionId, props.block.id, overrides.value);
    state.value = 'executed';
    open.value = false;
    emit('changed');
  } catch {
    showError(t('Could not complete the action'));
  } finally {
    busy.value = false;
  }
}

async function reject() {
  busy.value = true;
  try {
    await aiApi.rejectAction(props.sessionId, props.block.id);
    state.value = 'rejected';
    open.value = false;
    emit('changed');
  } catch {
    showError(t('Could not dismiss the action'));
  } finally {
    busy.value = false;
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.pa {
  border: 1px solid $border-light;
  border-radius: 14px;
  background: $bg-white;
  box-shadow: var(--elevation-1);
  padding: $spacing-3;
  transition:
    box-shadow 0.2s ease,
    border-color 0.2s ease,
    opacity 0.2s ease;

  &:hover {
    box-shadow: var(--elevation-2);
  }

  // Inside a batch card the row is already framed by its parent.
  &.is-nested {
    border: none;
    border-radius: 10px;
    box-shadow: none;
    padding: $spacing-2;
    background: transparent;

    &:hover {
      background: var(--hover-overlay);
      box-shadow: none;
    }
  }

  &.is-rejected {
    opacity: 0.62;
  }
}

.pa-main {
  display: flex;
  align-items: flex-start;
  gap: $spacing-3;
}

.pa-tile {
  display: grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  flex-shrink: 0;

  &.tile-brand {
    background: $primary-light;
    color: $primary;
  }

  &.tile-accent {
    background: var(--color-neutral-soft);
    color: $info;
  }

  &.tile-done {
    background: var(--color-income-soft);
    color: var(--color-income);
  }

  &.tile-danger {
    background: var(--color-expense-soft);
    color: var(--color-expense);
  }

  &.tile-muted {
    background: $bg-gray;
    color: $text-muted;
  }
}

.pa-tile-icon {
  width: 17px;
  height: 17px;
}

.pa-body {
  flex: 1;
  min-width: 0;
}

.pa-summary {
  margin: 0;
  font-size: $font-size-sm;
  font-weight: $font-medium;
  color: $text-primary;
  line-height: 1.4;
}

.pa-context {
  margin: $spacing-1 0 0;
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-1 $spacing-3;
}

.pa-context-row {
  display: flex;
  gap: $spacing-1;
  font-size: $font-size-xs;
  min-width: 0;

  dt {
    color: $text-muted;

    &::after {
      content: ':';
    }
  }

  dd {
    margin: 0;
    color: $text-secondary;
    font-weight: $font-medium;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.pa-actions {
  display: flex;
  align-items: center;
  gap: $spacing-1;
  flex-shrink: 0;
}

.pa-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: none;
  border-radius: 999px;
  padding: 5px 11px;
  font-size: $font-size-xs;
  font-weight: $font-medium;
  font-family: inherit;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;

  &:disabled {
    opacity: 0.55;
    cursor: default;
  }

  &:focus-visible {
    outline: 2px solid $primary;
    outline-offset: 2px;
  }
}

.pa-confirm {
  background: $primary;
  color: $text-inverse;

  &:hover:not(:disabled) {
    background: $primary-hover;
  }
}

.pa-dismiss {
  background: transparent;
  color: $text-muted;

  &:hover:not(:disabled) {
    background: var(--hover-overlay);
    color: $text-secondary;
  }
}

.pa-icon-btn {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 999px;
  background: transparent;
  color: $text-muted;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: var(--hover-overlay);
    color: $text-secondary;
  }

  &:focus-visible {
    outline: 2px solid $primary;
    outline-offset: 2px;
  }
}

.pa-btn-icon {
  width: 13px;
  height: 13px;
}

.pa-spin {
  animation: pa-spin 0.9s linear infinite;
}

@keyframes pa-spin {
  to {
    transform: rotate(360deg);
  }
}

.pa-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  flex-shrink: 0;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: $font-size-xs;
  font-weight: $font-medium;

  &.is-executed {
    background: var(--color-income-soft);
    color: var(--color-income);
  }

  &.is-failed {
    background: var(--color-expense-soft);
    color: var(--color-expense);
  }

  &.is-rejected {
    background: $bg-gray;
    color: $text-muted;
  }
}

.pa-status-icon {
  width: 13px;
  height: 13px;
}

.pa-edit {
  margin-top: $spacing-3;
  padding-top: $spacing-3;
  border-top: 1px solid $border-light;
  overflow: hidden;
}

.pa-expand-enter-active,
.pa-expand-leave-active {
  transition:
    opacity 0.18s ease,
    max-height 0.22s ease;
  max-height: 320px;
}

.pa-expand-enter-from,
.pa-expand-leave-to {
  opacity: 0;
  max-height: 0;
}

@media (prefers-reduced-motion: reduce) {
  .pa,
  .pa-btn,
  .pa-icon-btn,
  .pa-expand-enter-active,
  .pa-expand-leave-active {
    transition: none;
  }

  .pa-spin {
    animation: none;
  }
}
</style>
