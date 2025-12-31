<template>
  <div class="entity-header">
    <div class="header-content">
      <div class="content-main">
        <div class="title-row">
          <h1 class="title">{{ t(displayTitle) }}</h1>
          <div class="breadcrumb">
            <span
              class="breadcrumb-item breadcrumb-clickable"
              @click="$router.push('/dashboard')"
              >{{ t('Home') }}</span
            >
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-current">{{ t(pageNamePlural) }}</span>
          </div>
        </div>
        <slot name="summary"></slot>
      </div>
      <div class="action-buttons">
        <TInfoButton />
        <TButton
          v-if="showAddButton"
          :text="buttonText || t('Add {item}', { item: t(pageName).toLowerCase() })"
          class="add-entity-button"
          @click="$emit(buttonAction)"
        >
          <template #left-icon>
            <PlusIcon />
          </template>
        </TButton>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import TInfoButton from '@/components/TInfoButton.vue';
import TButton from '@/components/TButton.vue';
import { PlusIcon } from '@heroicons/vue/24/outline';

const { t } = useI18n();

const props = defineProps({
  pageName: {
    type: String,
    required: true
  },
  pageNamePlural: {
    type: String,
    required: true
  },
  showAddButton: {
    type: Boolean,
    default: true
  },
  buttonText: {
    type: String,
    default: null
  },
  buttonAction: {
    type: String,
    default: 'add'
  }
});

defineEmits(['add']);

const displayTitle = computed(() => props.pageNamePlural);
</script>

<style lang="scss" scoped>
@use '~/assets/scss/_variables' as *;

.entity-header {
  width: 100%;
  background-color: #e6f2ec;
  border-radius: $radius-xl;
  padding: 0.75rem 1rem;
  margin: 0;
  box-sizing: border-box;

  @media (max-width: $breakpoint-md) {
    padding: 0.5rem 0.75rem;
    border-radius: $radius-lg;
  }

  @media (max-width: $breakpoint-sm) {
    padding: 0.5rem;
    border-radius: $radius-md;
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  gap: 1rem;

  @media (max-width: $breakpoint-sm) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
}

.content-main {
  flex: 1;
  min-width: 0;
}

.title-row {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.title {
  color: #1d3229;
  font-size: $font-size-base;
  font-weight: $font-semibold;
  margin: 0;

  @media (max-width: $breakpoint-md) {
    font-size: $font-size-sm;
  }

  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-xs;
  }
}

.breadcrumb {
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: center;
}

.breadcrumb-item {
  color: $text-muted;
  font-weight: $font-normal;
  font-size: $font-size-xs;
}

.breadcrumb-separator {
  color: $text-muted;
  font-weight: $font-normal;
  font-size: $font-size-xs;
}

.breadcrumb-current {
  color: $text-secondary;
  font-weight: $font-medium;
  font-size: $font-size-xs;
}

.breadcrumb-clickable {
  cursor: pointer;

  &:hover {
    color: $primary;
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-shrink: 0;

  @media (max-width: $breakpoint-sm) {
    width: 100%;
    justify-content: flex-end;
    gap: 6px;
  }
}

.add-entity-button {
  width: 162px;
  height: 34px;
  font-size: $font-size-sm;
  font-weight: $font-semibold;

  @media (max-width: $breakpoint-md) {
    width: 140px;
    height: 32px;
    font-size: $font-size-xs;
  }

  @media (max-width: $breakpoint-sm) {
    width: 120px;
    height: 30px;
    font-size: $font-size-xs;
    padding: 0.25rem 0.5rem;
  }
}
</style>
