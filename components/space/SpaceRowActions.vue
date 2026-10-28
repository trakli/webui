<template>
  <div v-if="items.length" ref="root" class="row-menu">
    <button
      type="button"
      class="trigger"
      :aria-label="t('Actions')"
      :aria-expanded="open"
      @click.stop="open = !open"
    >
      <EllipsisHorizontalIcon />
    </button>
    <div v-if="open" class="menu" role="menu">
      <button
        v-for="item in items"
        :key="item.label"
        type="button"
        role="menuitem"
        :class="{ danger: item.danger }"
        @click="choose(item)"
      >
        {{ item.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { EllipsisHorizontalIcon } from '@heroicons/vue/24/outline';

interface Item {
  label: string;
  danger?: boolean;
  run: () => void;
}

defineProps<{ items: Item[] }>();
const { t } = useI18n();
const open = ref(false);
const root = ref<HTMLElement | null>(null);

function choose(item: Item) {
  open.value = false;
  item.run();
}

function outside(event: MouseEvent) {
  if (root.value && !root.value.contains(event.target as Node)) open.value = false;
}

onMounted(() => document.addEventListener('click', outside));
onUnmounted(() => document.removeEventListener('click', outside));
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.row-menu {
  position: relative;
}

.trigger {
  display: grid;
  place-items: center;
  width: 2rem;
  height: 2rem;
  border: 0;
  border-radius: $radius-md;
  background: none;
  color: $text-secondary;
  cursor: pointer;

  &:hover {
    background: $bg-light;
    color: $text-primary;
  }

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
}

.menu {
  position: absolute;
  right: 0;
  top: calc(100% + 4px);
  z-index: $z-index-dropdown;
  min-width: 10rem;
  padding: $spacing-1;
  background: $bg-white;
  border: 1px solid $border-color;
  border-radius: $radius-xl;
  box-shadow: $elevation-3;

  button {
    display: block;
    width: 100%;
    padding: $spacing-2 $spacing-3;
    border: 0;
    border-radius: $radius-lg;
    background: none;
    color: $text-primary;
    font: inherit;
    font-size: $font-size-sm;
    text-align: left;
    cursor: pointer;

    &:hover {
      background: $bg-light;
    }

    &.danger {
      color: $error-color;
    }
  }
}
</style>
