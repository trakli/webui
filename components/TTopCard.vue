<template>
  <div class="entity-header surface surface--brand">
    <svg
      class="header-decor"
      viewBox="0 0 1200 120"
      preserveAspectRatio="xMaxYMid slice"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id="topcard-bloom" cx="92%" cy="50%" r="50%">
          <stop offset="0%" stop-color="var(--surface-accent)" stop-opacity="0.45" />
          <stop offset="100%" stop-color="var(--surface-accent)" stop-opacity="0" />
        </radialGradient>
      </defs>
      <circle cx="1080" cy="60" r="170" fill="url(#topcard-bloom)" />
      <circle cx="1040" cy="18" r="22" fill="var(--surface-deep)" opacity="0.18" />
      <circle cx="1150" cy="100" r="10" fill="var(--surface-deep)" opacity="0.28" />
      <circle cx="980" cy="98" r="6" fill="var(--surface-accent)" opacity="0.8" />
    </svg>
    <div class="header-content">
      <div class="content-main">
        <div class="title-row">
          <div v-if="resolvedIcon" class="page-icon">
            <component :is="resolvedIcon" :size="16" />
          </div>
          <div class="title-text">
            <span class="breadcrumb-current">
              <span class="breadcrumb-home" @click="$router.push('/dashboard')">{{
                t('Home')
              }}</span>
              <ChevronRight :size="11" class="breadcrumb-arrow" />
              <span>{{ t(pageNamePlural) }}</span>
            </span>
            <h1 class="title">{{ t(displayTitle) }}</h1>
          </div>
        </div>
        <slot name="summary"></slot>
      </div>
      <div class="action-buttons">
        <TInfoButton />
        <slot name="actions" />
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
    <div v-if="$slots.bottom" class="header-bottom">
      <slot name="bottom" />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import TInfoButton from '@/components/TInfoButton.vue';
import TButton from '@/components/TButton.vue';
import { PlusIcon } from '@heroicons/vue/24/outline';
import {
  ChevronRight,
  Wallet,
  Users,
  Tag,
  Folder,
  ArrowsUpFromLine,
  ChartPie,
  ArrowLeftRight,
  Bell,
  FileText,
  Sparkles
} from 'lucide-vue-next';

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

const iconMap = {
  Wallet,
  Wallets: Wallet,
  Party: Users,
  Parties: Users,
  Category: Tag,
  Categories: Tag,
  Group: Folder,
  Groups: Folder,
  Transaction: ArrowLeftRight,
  Transactions: ArrowLeftRight,
  Transfer: ArrowsUpFromLine,
  Transfers: ArrowsUpFromLine,
  Budget: ChartPie,
  Budgets: ChartPie,
  Reminder: Bell,
  Reminders: Bell,
  Import: FileText,
  Imports: FileText,
  Insight: Sparkles,
  Insights: Sparkles
};

const resolvedIcon = computed(
  () => iconMap[props.pageNamePlural] || iconMap[props.pageName] || null
);
</script>

<style lang="scss" scoped>
@use '~/assets/scss/_variables' as *;

.entity-header {
  position: relative;
  width: 100%;
  border-radius: 16px;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  border: 1px solid $border-light;
  box-shadow: $elevation-1;
  overflow: hidden;

  @media (max-width: $breakpoint-md) {
    padding: 0.5rem 0.75rem;
    border-radius: 14px;
  }

  @media (max-width: $breakpoint-sm) {
    padding: 0.5rem;
    border-radius: 12px;
  }
}

.header-decor {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

.header-content {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  gap: 1rem;
  padding: 0.75rem 1rem;

  @media (max-width: $breakpoint-md) {
    padding: 0.625rem 0.875rem;
  }

  @media (max-width: $breakpoint-sm) {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
  }
}

.header-bottom {
  position: relative;
  z-index: 1;
  border-top: 1px solid $border-light;
}

.content-main {
  flex: 1;
  min-width: 0;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--glass-bg);
  border: 1px solid $border-light;
  color: var(--surface-deep);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.title-text {
  display: flex;
  flex-direction: column;
  gap: 0;
  line-height: 1.2;
  min-width: 0;
}

.title {
  color: var(--surface-ink);
  font-size: $font-size-base;
  font-weight: $font-bold;
  letter-spacing: -0.015em;
  margin: 0;
  line-height: 1.2;

  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-sm;
  }
}

.breadcrumb-current {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--surface-deep);
  opacity: 0.75;
  font-size: 10px;
  font-weight: $font-bold;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.breadcrumb-home {
  cursor: pointer;
  transition: color $duration-fast $easing-standard;

  &:hover {
    color: var(--surface-deep);
    opacity: 1;
  }
}

.breadcrumb-arrow {
  opacity: 0.6;
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
