<template>
  <div class="tabs-container">
    <div class="tabs-header">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab-btn"
        :class="{ active: activeTab === tab.id }"
        @click="$emit('update:activeTab', tab.id)"
      >
        <component :is="tab.icon" class="tab-icon" />
        <span class="tab-label">{{ tab.label }}</span>
      </button>
    </div>
    <div class="tabs-content">
      <slot :name="activeTab" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  tabs: {
    type: Array,
    required: true
  },
  activeTab: {
    type: String,
    required: true
  }
});

defineEmits(['update:activeTab']);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.tabs-container {
  width: 100%;
}

.tabs-header {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  background: $bg-white;
  border: 1px solid $border-color;
  border-radius: 999px;
  margin-bottom: $spacing-6;
  overflow-x: auto;
  max-width: 100%;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: $breakpoint-md) {
    gap: 2px;
  }
}

.tab-btn {
  display: inline-flex;
  align-items: center;
  gap: $spacing-2;
  height: 36px;
  padding: 0 $spacing-4;
  border: none;
  background: transparent;
  border-radius: 999px;
  cursor: pointer;
  color: $text-muted;
  font-size: $font-size-sm;
  font-weight: $font-medium;
  letter-spacing: -0.005em;
  transition:
    background-color $duration-fast $easing-standard,
    color $duration-fast $easing-standard;
  white-space: nowrap;

  @media (max-width: $breakpoint-md) {
    height: 32px;
    padding: 0 $spacing-3;
    font-size: $font-size-xs;
  }

  &:hover {
    color: $text-primary;
  }

  &:focus-visible {
    outline: 2px solid $primary;
    outline-offset: 2px;
  }

  &.active {
    background: $primary-light;
    color: $primary;
  }
}

.tab-icon {
  width: 18px;
  height: 18px;

  @media (max-width: $breakpoint-md) {
    width: 16px;
    height: 16px;
  }
}

.tab-label {
  @media (max-width: $breakpoint-sm) {
    display: none;
  }
}

.tabs-content {
  min-height: 200px;
}
</style>
