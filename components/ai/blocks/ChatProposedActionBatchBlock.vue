<template>
  <div class="pab" :class="`is-${state}`">
    <header class="pab-head">
      <span class="pab-tile" aria-hidden="true">
        <IconTag class="pab-tile-icon" />
        <span v-if="pendingCount > 1" class="pab-count">{{ pendingCount }}</span>
      </span>

      <div class="pab-heading">
        <p class="pab-summary">{{ block.summary }}</p>
        <p class="pab-sub">{{ subtitle }}</p>
      </div>

      <div v-if="state === 'pending'" class="pab-actions">
        <button type="button" class="pab-btn pab-dismiss" :disabled="busy" @click="rejectAll">
          {{ t('Dismiss all') }}
        </button>
        <button type="button" class="pab-btn pab-confirm" :disabled="busy" @click="confirmAll">
          <IconSpinner v-if="busy" class="pab-btn-icon pab-spin" />
          <IconCheck v-else class="pab-btn-icon" />
          <span>{{ t('Confirm all') }}</span>
        </button>
      </div>

      <span v-else class="pab-status" :class="`is-${state}`">
        <component :is="statusIcon" class="pab-status-icon" />
        <span>{{ statusLabel }}</span>
      </span>
    </header>

    <button type="button" class="pab-toggle" :aria-expanded="open" @click="open = !open">
      <IconChevron class="pab-chevron" :class="{ 'is-open': open }" />
      <span>{{ open ? t('Hide details') : t('Review each one') }}</span>
    </button>

    <Transition name="pab-expand">
      <div v-if="open" class="pab-list">
        <ChatProposedActionBlock
          v-for="action in block.actions"
          :key="action.id"
          :block="action"
          :session-id="sessionId"
          nested
          @changed="$emit('changed')"
        />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { aiApi, type ProposedActionBatchBlock } from '@/services/api/aiApi';
import ChatProposedActionBlock from './ChatProposedActionBlock.vue';
import IconCheck from '~icons/solar/check-circle-bold';
import IconClose from '~icons/solar/close-circle-bold';
import IconTag from '~icons/solar/tag-horizontal-bold';
import IconChevron from '~icons/solar/alt-arrow-down-linear';
import IconSpinner from '~icons/solar/refresh-linear';

const props = defineProps<{ block: ProposedActionBatchBlock; sessionId: number }>();
const emit = defineEmits<{ (e: 'changed'): void }>();

const { t } = useI18n();
const { showError } = useNotifications();

const open = ref(false);
const busy = ref(false);

const state = ref<'pending' | 'executed' | 'rejected' | 'failed'>(
  props.block.status === 'executed'
    ? 'executed'
    : props.block.status === 'rejected'
      ? 'rejected'
      : props.block.status === 'failed'
        ? 'failed'
        : 'pending'
);

const pendingCount = computed(
  () => (props.block.actions ?? []).filter((a) => a.status === 'proposed').length
);

const subtitle = computed(() => {
  const total = (props.block.actions ?? []).length;
  if (state.value === 'pending') {
    return t('{count} changes await your confirmation', { count: total });
  }
  return t('{count} changes', { count: total });
});

const statusIcon = computed(() => (state.value === 'executed' ? IconCheck : IconClose));
const statusLabel = computed(() =>
  state.value === 'executed' ? t('Done') : state.value === 'failed' ? t('Failed') : t('Dismissed')
);

async function confirmAll() {
  busy.value = true;
  try {
    await aiApi.confirmActionBatch(props.sessionId, props.block.batch);
    state.value = 'executed';
    emit('changed');
  } catch {
    showError(t('Could not complete the actions'));
  } finally {
    busy.value = false;
  }
}

async function rejectAll() {
  busy.value = true;
  try {
    await aiApi.rejectActionBatch(props.sessionId, props.block.batch);
    state.value = 'rejected';
    emit('changed');
  } catch {
    showError(t('Could not dismiss the actions'));
  } finally {
    busy.value = false;
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.pab {
  border: 1px solid $border-light;
  border-radius: 14px;
  background: $bg-white;
  box-shadow: var(--elevation-1);
  overflow: hidden;
  transition:
    box-shadow 0.2s ease,
    opacity 0.2s ease;

  &.is-rejected {
    opacity: 0.62;
  }
}

.pab-head {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  padding: $spacing-3;
}

.pab-tile {
  position: relative;
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 10px;
  background: $primary-light;
  color: $primary;
  flex-shrink: 0;
}

.pab-tile-icon {
  width: 17px;
  height: 17px;
}

.pab-count {
  position: absolute;
  top: -5px;
  right: -5px;
  min-width: 17px;
  height: 17px;
  padding: 0 4px;
  border-radius: 999px;
  background: $primary;
  color: $text-inverse;
  font-size: 10px;
  font-weight: $font-bold;
  line-height: 17px;
  text-align: center;
}

.pab-heading {
  flex: 1;
  min-width: 0;
}

.pab-summary {
  margin: 0;
  font-size: $font-size-sm;
  font-weight: $font-semibold;
  color: $text-primary;
  line-height: 1.35;
}

.pab-sub {
  margin: 2px 0 0;
  font-size: $font-size-xs;
  color: $text-muted;
}

.pab-actions {
  display: flex;
  align-items: center;
  gap: $spacing-1;
  flex-shrink: 0;
}

.pab-btn {
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

.pab-confirm {
  background: $primary;
  color: $text-inverse;

  &:hover:not(:disabled) {
    background: $primary-hover;
  }
}

.pab-dismiss {
  background: transparent;
  color: $text-muted;

  &:hover:not(:disabled) {
    background: var(--hover-overlay);
    color: $text-secondary;
  }
}

.pab-btn-icon {
  width: 13px;
  height: 13px;
}

.pab-spin {
  animation: pab-spin 0.9s linear infinite;
}

@keyframes pab-spin {
  to {
    transform: rotate(360deg);
  }
}

.pab-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: $font-size-xs;
  font-weight: $font-medium;
  flex-shrink: 0;

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

.pab-status-icon {
  width: 13px;
  height: 13px;
}

.pab-toggle {
  display: flex;
  align-items: center;
  gap: 5px;
  width: 100%;
  padding: $spacing-2 $spacing-3;
  border: none;
  border-top: 1px solid $border-light;
  background: $bg-light;
  color: $text-muted;
  font-size: $font-size-xs;
  font-weight: $font-medium;
  font-family: inherit;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: $bg-gray;
    color: $text-secondary;
  }

  &:focus-visible {
    outline: 2px solid $primary;
    outline-offset: -2px;
  }
}

.pab-chevron {
  width: 13px;
  height: 13px;
  transition: transform 0.2s ease;

  &.is-open {
    transform: rotate(180deg);
  }
}

.pab-list {
  padding: $spacing-1;
  border-top: 1px solid $border-light;
  max-height: 340px;
  overflow-y: auto;
}

.pab-expand-enter-active,
.pab-expand-leave-active {
  transition: opacity 0.18s ease;
}

.pab-expand-enter-from,
.pab-expand-leave-to {
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .pab,
  .pab-btn,
  .pab-toggle,
  .pab-chevron,
  .pab-expand-enter-active,
  .pab-expand-leave-active {
    transition: none;
  }

  .pab-spin {
    animation: none;
  }
}
</style>
