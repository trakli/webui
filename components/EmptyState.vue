<template>
  <div class="empty-state">
    <img class="empty-icon" src="/box.svg" :alt="t('Empty Icon')" />
    <h2 class="empty-title">
      {{
        t("You don't have any {item} at the moment.", {
          item: t(pageName).toLowerCase()
        })
      }}
    </h2>
    <p class="empty-subtitle">
      {{
        t('Please add at least one {item} to be able to view it.', {
          item: t(pageName).toLowerCase()
        })
      }}
    </p>
    <button class="add-entity-btn" @click="$emit('create')">
      <PlusIcon class="button-icon" />
      {{ t('Add {item}', { item: t(pageName).toLowerCase() }) }}
    </button>
  </div>
</template>

<script setup>
import { PlusIcon } from '@heroicons/vue/24/outline';

const { t } = useI18n();

defineProps({
  pageName: {
    type: String,
    required: true
  }
});

defineEmits(['create']);
</script>

<style scoped lang="scss">
@use '~/assets/scss/_variables' as *;

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-top: 3rem;
  margin-bottom: 0;
  padding: 2rem 1rem;
  min-height: 50vh;

  @media (max-width: $breakpoint-md) {
    margin-top: 2rem;
    padding: 1.5rem 1rem;
    min-height: 40vh;
  }

  @media (max-width: $breakpoint-sm) {
    margin-top: 1rem;
    padding: 1rem 0.5rem;
    min-height: 35vh;
  }
}

.empty-icon {
  width: 220px;
  height: 220px;
  margin-bottom: 1rem;

  @media (max-width: $breakpoint-md) {
    width: 180px;
    height: 180px;
    margin-bottom: 0.75rem;
  }

  @media (max-width: $breakpoint-sm) {
    width: 140px;
    height: 140px;
    margin-bottom: 0.5rem;
  }
}

.empty-title {
  color: $text-primary;
  font-size: 2.2rem;
  font-weight: 700;
  margin: 1rem 2rem;
  line-height: 1.2;

  @media (max-width: $breakpoint-md) {
    font-size: 1.8rem;
    margin: 0.75rem 1.5rem;
  }

  @media (max-width: $breakpoint-sm) {
    font-size: 1.4rem;
    margin: 0.5rem 1rem;
    line-height: 1.3;
  }

  @media (max-width: 480px) {
    font-size: 1.2rem;
    margin: 0.5rem 0.5rem;
  }
}

.empty-subtitle {
  color: $text-secondary;
  font-size: 1.2rem;
  margin-bottom: 2.5rem;
  line-height: 1.4;
  max-width: 90%;

  @media (max-width: $breakpoint-md) {
    font-size: 1.1rem;
    margin-bottom: 2rem;
  }

  @media (max-width: $breakpoint-sm) {
    font-size: 1rem;
    margin-bottom: 1.5rem;
    max-width: 95%;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
    margin-bottom: 1.25rem;
  }
}

.add-entity-btn {
  background: $primary;
  color: $bg-white;
  font-size: 1.3rem;
  font-weight: 600;
  border: none;
  border-radius: $radius-xl;
  padding: 1rem 2.5rem;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 160px;

  .button-icon {
    width: 1.2rem;
    height: 1.2rem;
    flex-shrink: 0;
    stroke-width: 2;
  }

  @media (max-width: $breakpoint-md) {
    font-size: 1.1rem;
    padding: 0.875rem 2rem;
    border-radius: $radius-lg;
    min-width: 140px;
  }

  @media (max-width: $breakpoint-sm) {
    font-size: 1rem;
    padding: 0.75rem 1.5rem;
    border-radius: $radius-lg;
    min-width: 120px;
  }

  @media (max-width: 480px) {
    font-size: 0.9rem;
    padding: 0.625rem 1.25rem;
    min-width: 110px;
  }

  &:hover {
    background: $primary-hover;
  }
}
</style>
