<template>
  <div class="card">
    <button class="card-header" type="button" @click="isOpen = !isOpen">
      <h2 class="title">Narrative Insights</h2>
      <component :is="isOpen ? ChevronUp : ChevronDown" class="chevron" />
    </button>
    <transition name="collapse">
      <p v-show="isOpen" class="content">
        <slot />
      </p>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ChevronDown, ChevronUp } from 'lucide-vue-next';

const isOpen = ref(true);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.card {
  background: $bg-white;
  border-radius: $radius-xl;
  box-shadow: $shadow-md;
  padding: $spacing-4;
  display: flex;
  flex-direction: column;
}

.card-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title {
  font-size: $font-size-lg;
  font-weight: $font-semibold;
  color: $text-primary;
}

.chevron {
  width: 20px;
  height: 20px;
  color: $text-muted;
}

.content {
  color: $text-secondary;
  margin-top: $spacing-2;
  font-size: $font-size-sm;
  line-height: 1.6;
}

.collapse-enter-from,
.collapse-leave-to {
  max-height: 0;
  opacity: 0;
}

.collapse-enter-active,
.collapse-leave-active {
  transition:
    max-height 0.3s ease,
    opacity 0.3s ease;
}

.collapse-enter-to,
.collapse-leave-from {
  max-height: 600px;
  opacity: 1;
}
</style>
