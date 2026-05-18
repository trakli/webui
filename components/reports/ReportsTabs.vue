<template>
  <nav class="tabs" role="tablist">
    <button
      v-for="(tab, i) in tabs"
      :ref="(el) => (tabRefs[i] = el)"
      :key="tab.value"
      class="tab"
      :class="{ 'tab--active': modelValue === tab.value }"
      role="tab"
      :aria-selected="modelValue === tab.value"
      @click="$emit('update:modelValue', tab.value)"
    >
      <component :is="tab.icon" :size="16" class="tab-ico" />
      <span class="tab-label">{{ tab.label }}</span>
      <span v-if="tab.count !== undefined" class="tab-count">{{ tab.count }}</span>
    </button>
    <span class="tab-indicator" :style="indicatorStyle" />
  </nav>
</template>

<script setup>
import { ref, computed, watch, onMounted, nextTick } from 'vue';

const props = defineProps({
  modelValue: { type: String, required: true },
  tabs: { type: Array, required: true }
});

defineEmits(['update:modelValue']);

const tabRefs = ref([]);
const indicator = ref({ left: 0, width: 0 });

const indicatorStyle = computed(() => ({
  transform: `translateX(${indicator.value.left}px)`,
  width: `${indicator.value.width}px`
}));

const updateIndicator = async () => {
  await nextTick();
  const idx = props.tabs.findIndex((t) => t.value === props.modelValue);
  const el = tabRefs.value[idx];
  if (!el) return;
  indicator.value = { left: el.offsetLeft, width: el.offsetWidth };
};

watch(() => props.modelValue, updateIndicator);
watch(() => props.tabs.length, updateIndicator);
onMounted(updateIndicator);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.tabs {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 2px;
  padding: 4px;
  background: $bg-white;
  border: 1px solid $border-color;
  border-radius: 999px;
  box-shadow: $elevation-1;
  overflow-x: auto;
  max-width: 100%;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.tab {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 999px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: $text-muted;
  font-size: $font-size-sm;
  font-weight: $font-medium;
  white-space: nowrap;
  transition: color $duration-base $easing-standard;

  &:hover {
    color: $text-primary;
  }

  &--active {
    color: $primary;

    &:hover {
      color: $primary;
    }
  }
}

.tab-ico {
  flex-shrink: 0;
}
.tab-label {
  font-weight: inherit;
}

.tab-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: rgba(255, 255, 255, 0.2);
  color: inherit;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  font-weight: $font-semibold;
}

.tab--active .tab-count {
  background: $bg-white;
  color: $primary;
}

.tab:not(.tab--active) .tab-count {
  background: $bg-light;
  color: $text-muted;
}

.tab-indicator {
  position: absolute;
  z-index: 0;
  top: 4px;
  bottom: 4px;
  left: 0;
  background: $primary-light;
  border-radius: 999px;
  transition:
    transform $duration-base $easing-emphasized,
    width $duration-base $easing-emphasized;
}
</style>
