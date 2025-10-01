<template>
  <div class="entity-header">
    <div class="header-content">
      <div class="content-main">
        <h1 class="title">Add {{ pageName }}</h1>
        <div class="breadcrumb">
          <span class="breadcrumb-item">Home</span>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-item">{{ pageNamePlural }}</span>
          <span class="breadcrumb-separator">&gt;</span>
          <span class="breadcrumb-current">Add {{ pageName }}</span>
        </div>
      </div>
      <div class="action-buttons">
        <TInfoButton />
        <TButton :text="`Add ${pageName} +`" class="add-entity-button" @click="$emit('add')" />
      </div>
    </div>
  </div>
</template>

<script setup>
import TInfoButton from '@/components/TInfoButton.vue';
import TButton from '@/components/TButton.vue';

defineProps({
  pageName: {
    type: String,
    required: true
  },
  pageNamePlural: {
    type: String,
    required: true
  }
});

defineEmits(['add']);
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
  align-items: center;
  width: 100%;

  @media (max-width: $breakpoint-sm) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
}

.content-main {
  flex: 1;
}

.title {
  color: #1d3229;
  font-size: $font-size-lg;
  font-weight: $font-bold;
  margin: 0 0 4px 0;

  @media (max-width: $breakpoint-md) {
    font-size: $font-size-base;
  }

  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-sm;
    margin-bottom: 2px;
  }
}

.breadcrumb {
  display: flex;
  flex-direction: row;
  gap: 4px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: $breakpoint-sm) {
    gap: 2px;
  }
}

.breadcrumb-item {
  color: $primary;
  font-weight: $font-normal;
  font-size: $font-size-sm;

  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-xs;
  }
}

.breadcrumb-separator {
  color: $text-secondary;
  font-weight: $font-normal;
  font-size: $font-size-sm;

  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-xs;
  }
}

.breadcrumb-current {
  color: $text-primary;
  font-weight: $font-normal;
  font-size: $font-size-sm;

  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-xs;
  }
}

.action-buttons {
  display: flex;
  gap: 8px;

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
