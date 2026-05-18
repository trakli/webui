<template>
  <div ref="dropdownRef" class="dropdown-container">
    <div @click="toggleDropdown">
      <slot name="trigger" />
    </div>
    <transition name="fade">
      <div v-if="isOpen" class="dropdown-menu">
        <slot />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const isOpen = ref(false);
const dropdownRef = ref(null);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const handleClickOutside = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.dropdown-container {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 6px;
  background-color: $bg-white;
  border: 1px solid $border-color;
  border-radius: 12px;
  box-shadow: $elevation-2;
  z-index: $z-index-dropdown;
  min-width: 12rem;
  padding: $spacing-2;
  transform-origin: top right;
}

.fade-enter-active,
.fade-leave-active {
  transition:
    opacity $duration-fast $easing-standard,
    transform $duration-fast $easing-emphasized;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: scale(0.96) translateY(-4px);
}
</style>
