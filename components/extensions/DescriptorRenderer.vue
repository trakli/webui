<template>
  <!-- Escape hatch: a plugin Nuxt layer registered a real component. -->
  <component :is="resolved" v-if="resolved" :contribution="contribution" @next="$emit('next')" />

  <!-- Sidebar nav entry -->
  <NuxtLink v-else-if="variant === 'sidebar.nav'" :to="href || '#'" class="ext-nav-item">
    <component :is="icon" class="ext-nav-icon" />
    <span class="ext-nav-label">{{ card?.title || integration.name }}</span>
  </NuxtLink>

  <!-- Onboarding step -->
  <div v-else-if="variant === 'onboarding.steps'" class="ext-onboarding">
    <div class="ext-onboarding-icon">
      <component :is="icon" />
    </div>
    <h2 class="ext-onboarding-title">{{ onboarding?.title || card?.title || integration.name }}</h2>
    <p v-if="onboarding?.description || card?.description" class="ext-onboarding-desc">
      {{ onboarding?.description || card?.description }}
    </p>
    <div class="ext-onboarding-actions">
      <TButton
        v-if="href"
        :to="href"
        :text="card?.cta || 'Open'"
        variant="outline"
        :full-width="false"
      />
      <TButton :text="'Continue'" :full-width="false" @click="$emit('next')" />
    </div>
  </div>

  <!-- Default: an integration card (settings.integrations, dashboard.widgets) -->
  <TCard v-else class="ext-card">
    <div class="ext-card-head">
      <span class="ext-card-icon"><component :is="icon" /></span>
      <h3 class="ext-card-title">{{ card?.title || integration.name }}</h3>
      <span v-if="!contribution.configured" class="ext-card-badge">{{ 'Needs setup' }}</span>
    </div>
    <p v-if="card?.description || integration.description" class="ext-card-desc">
      {{ card?.description || integration.description }}
    </p>
    <TButton
      v-if="card?.cta"
      :to="href || undefined"
      :text="card.cta"
      variant="outline"
      size="small"
      :full-width="false"
      @click="$emit('action', contribution)"
    />
  </TCard>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Component } from 'vue';
import * as LucideIcons from 'lucide-vue-next';
import TCard from '@/components/TCard.vue';
import TButton from '@/components/TButton.vue';
import type { SlotContribution } from '~/types/integration';
import { useExtensionSlots } from '~/composables/useExtensionSlots';

const props = defineProps<{ contribution: SlotContribution }>();
defineEmits<{ next: []; action: [SlotContribution] }>();

const { resolveComponent } = useExtensionSlots();

const integration = computed(() => props.contribution.integration);
const ui = computed(() => props.contribution.ui);
const card = computed(() => ui.value.card);
const onboarding = computed(() => ui.value.onboarding);
const variant = computed(() => props.contribution.slot);
const href = computed(() => onboarding.value?.href || card.value?.href || null);
const resolved = computed(() => resolveComponent(ui.value.component));

// Resolve the descriptor's icon name (kebab or PascalCase) to a lucide
// component, with a generic glyph fallback so every plugin surface carries an
// icon like its built-in neighbors.
const lucide = LucideIcons as unknown as Record<string, Component>;
const icon = computed<Component>(() => {
  const name = integration.value.icon;
  if (name) {
    const pascal = name.replace(/(^\w|[-_ ]\w)/g, (m) => m.replace(/[-_ ]/, '').toUpperCase());
    return lucide[name] || lucide[pascal] || lucide.Puzzle;
  }
  return lucide.Puzzle;
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.ext-card-head {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  margin-bottom: $spacing-2;
}

.ext-card-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: $radius-lg;
  background: $primary-light;
  color: $primary;
  flex-shrink: 0;

  :deep(svg) {
    width: 20px;
    height: 20px;
  }
}

.ext-card-title {
  font-size: $font-size-base;
  font-weight: $font-semibold;
  color: $text-primary;
  margin: 0;
}

.ext-card-badge {
  margin-left: auto;
  font-size: $font-size-xs;
  font-weight: $font-medium;
  color: $text-muted;
  background: $bg-gray;
  border-radius: 999px;
  padding: 2px 8px;
  flex-shrink: 0;
}

.ext-card-desc {
  font-size: $font-size-sm;
  color: $text-secondary;
  margin: 0 0 $spacing-4;
}

.ext-onboarding {
  text-align: center;
}

.ext-onboarding-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin: 0 auto $spacing-4;
  border-radius: 50%;
  background: $primary-light;
  color: $primary;

  :deep(svg) {
    width: 28px;
    height: 28px;
  }
}

.ext-onboarding-title {
  font-size: $font-size-lg;
  font-weight: $font-semibold;
  color: $text-primary;
}

.ext-onboarding-desc {
  font-size: $font-size-base;
  color: $text-secondary;
  margin: $spacing-2 0 $spacing-6;
}

.ext-onboarding-actions {
  display: flex;
  gap: $spacing-3;
  justify-content: center;
}

.ext-nav-item {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2 $spacing-3;
  border-radius: $radius-md;
  color: $text-secondary;
  text-decoration: none;

  &:hover {
    background: $primary-light;
    color: $primary;
  }
}

.ext-nav-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}
</style>
