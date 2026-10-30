<template>
  <div class="space-page">
    <header class="page-head">
      <div>
        <h1>{{ t('Categories and groups') }}</h1>
        <p>
          {{ t('Labels in this space. They never change how your personal records are labelled.') }}
        </p>
      </div>
    </header>
    <ComponentLoader
      :is-loading="!ready && !error"
      :error="error"
      :has-data="ready"
      :show-empty="false"
      skeleton-variant="card"
    >
      <div class="columns">
        <section v-for="section in sections" :key="section.kind" class="panel">
          <header class="panel-head">
            <h2>{{ section.title }}</h2>
            <TButton
              v-if="canManage && canWrite"
              variant="secondary"
              size="small"
              :full-width="false"
              :text="section.add"
              @click="open(section.kind)"
            />
          </header>
          <ul v-if="section.items.length" class="labels">
            <li v-for="label in section.items" :key="label.id" class="label">
              {{ label.name }}
              <span v-if="label.type" class="label-type">{{
                label.type === 'income' ? t('Income') : t('Expense')
              }}</span>
            </li>
          </ul>
          <p v-else class="muted">{{ section.empty }}</p>
        </section>
      </div>
    </ComponentLoader>
    <SpaceLabelModal v-model="labelOpen" :kind="labelKind" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import TButton from '@/components/TButton.vue';
import ComponentLoader from '@/components/ComponentLoader.vue';
import SpaceLabelModal from './SpaceLabelModal.vue';

const { t } = useI18n();
const { canManage, canWrite } = useActiveSpace();
const { overview, ready, error, ensure } = useSpaceFinance();
const labelOpen = ref(false);
const labelKind = ref<'categories' | 'groups'>('categories');
const sections = computed(() => [
  {
    kind: 'categories' as const,
    title: t('Categories'),
    add: t('Create a category'),
    items: overview.value.categories,
    empty: canManage.value
      ? t('No categories yet. Budgets can target a category, such as groceries.')
      : t('No categories yet. Admins add them.')
  },
  {
    kind: 'groups' as const,
    title: t('Groups'),
    add: t('Create a group'),
    items: overview.value.groups,
    empty: canManage.value
      ? t('No groups yet. A group bundles spending such as a holiday.')
      : t('No groups yet. Admins add them.')
  }
]);

function open(kind: 'categories' | 'groups') {
  labelKind.value = kind;
  labelOpen.value = true;
}

onMounted(ensure);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;
@use './space-page' as *;

.columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: $spacing-6;

  @media (max-width: $breakpoint-md) {
    grid-template-columns: 1fr;
  }
}

.panel {
  padding: $spacing-5;
  background: $bg-white;
  border: 1px solid $border-light;
  border-radius: $radius-xl;
  box-shadow: $elevation-1;
}

.panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-3;
  margin-bottom: $spacing-4;

  h2 {
    margin: 0;
    font-size: $font-size-lg;
    color: $text-primary;
  }
}

.labels {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-2;
  margin: 0;
  padding: 0;
  list-style: none;
}

.label {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-1 $spacing-3;
  border-radius: $radius-md;
  background: $primary-light;
  color: $primary-dark;
  font-size: $font-size-sm;
}

.label-type {
  font-size: $font-size-xs;
  color: $text-secondary;
}

.muted {
  margin: 0;
  color: $text-secondary;
}
</style>
