<template>
  <div v-if="visible" class="space-bar" :class="`surface surface--${tone}`" role="status">
    <span class="chip chip--warning">{{ t('Read-only') }}</span>
    <span class="reason">
      {{
        isOwner
          ? t('Activate this space to record, budget and invite.')
          : t('The owner needs to activate this space before anyone can make changes.')
      }}
    </span>
    <TButton
      v-if="isOwner && hasBilling"
      :full-width="false"
      size="small"
      :text="t('Activate space')"
      to="/space-billing"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import TButton from '@/components/TButton.vue';
import { spaceTone } from '~/utils/activeSpace';

const { t } = useI18n();
const { space, isOwner } = useActiveSpace();
const route = useRoute();
const { resolveComponent } = useExtensionSlots();
const hasBilling = computed(() => !!resolveComponent('cloud.workspace.billing'));
const visible = computed(
  () => !!space.value?.read_only && !['/dashboard', '/space-billing'].includes(route.path)
);
const tone = computed(() => (space.value ? spaceTone(space.value.kind) : 'neutral'));
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.space-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: $spacing-2 $spacing-3;
  margin-bottom: $spacing-4;
  padding: $spacing-3 $spacing-4;
  border: 1px solid var(--surface-accent);
  border-radius: $radius-xl;

  :deep(.button),
  :deep(a) {
    margin-left: auto;
  }

  @media (max-width: $breakpoint-sm) {
    :deep(.button),
    :deep(a) {
      width: 100%;
      margin-left: 0;
    }
  }
}

.reason {
  font-size: $font-size-sm;
  color: $text-secondary;
}

.chip {
  padding: 0.1rem $spacing-2;
  border-radius: $radius-md;
  font-size: $font-size-xs;
  font-weight: $font-semibold;

  &--warning {
    background: $warning-bg;
    color: $warning-text;
  }
}
</style>
