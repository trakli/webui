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
  display: flex;
  gap: 0.25rem;
  padding: 0.25rem;
  background: $bg-gray;
  border-radius: $radius-xl;
  margin-bottom: 1.5rem;
  overflow-x: auto;

  @media (max-width: $breakpoint-md) {
    gap: 0.125rem;
    padding: 0.25rem;
  }
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  border: none;
  background: transparent;
  border-radius: $radius-lg;
  cursor: pointer;
  color: $text-secondary;
  font-size: $font-size-sm;
  font-weight: $font-medium;
  transition: all 0.2s;
  white-space: nowrap;

  @media (max-width: $breakpoint-md) {
    padding: 0.5rem 0.75rem;
    font-size: $font-size-xs;
    gap: 0.25rem;
  }

  &:hover {
    color: $text-primary;
    background: rgba(255, 255, 255, 0.5);
  }

  &.active {
    background: $bg-white;
    color: $primary;
    box-shadow: $shadow-sm;
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
