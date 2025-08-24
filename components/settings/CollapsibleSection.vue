<template>
  <div class="settings-section">
    <div class="section-header">
      <button type="button" class="header-button" @click="toggleOpen">
        <div class="header-title">
          <component :is="icon" class="header-icon" />
          <span>{{ title }}</span>
        </div>
        <div class="chevron">
          <component :is="isOpen ? ChevronUp : ChevronDown" class="chevron-icon" />
        </div>
      </button>
      <button type="button" class="edit-button" @click="toggleEdit">
        <span>{{ isEditMode ? 'Done' : 'Edit' }}</span>
        <component :is="isEditMode ? X : Edit" class="edit-icon" />
      </button>
    </div>

    <transition name="collapse">
      <div v-show="isOpen" class="section-body">
        <slot :is-edit-mode="isEditMode" :set-edit-mode="setEditMode" />
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { ChevronDown, ChevronUp, Edit, X } from 'lucide-vue-next';

const props = defineProps({
  title: { type: String, required: true },
  icon: { type: [Object, String], required: true },
  defaultOpen: { type: Boolean, default: true }
});

const isOpen = ref(props.defaultOpen);
const isEditMode = ref(false);

const toggleOpen = () => {
  isOpen.value = !isOpen.value;
};
const toggleEdit = () => {
  isEditMode.value = !isEditMode.value;
};
const setEditMode = (value) => {
  isEditMode.value = !!value;
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.settings-section {
  background: $bg-white;
  border-radius: $radius-xl;
  box-shadow: $shadow-md;
  padding: 1.5rem;
  width: 100%;
  margin-bottom: 1.5rem;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: $font-semibold;
  color: $text-primary;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: $font-size-xl;
}

.header-icon,
.edit-icon,
.chevron-icon {
  width: 20px;
  height: 20px;
}

.edit-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: $radius-lg;
  font-weight: $font-semibold;
  font-size: $font-size-sm;
  color: $primary;
  border: 1px solid $primary;
  transition: $transition-base;

  &:hover {
    background: $primary;
    color: $bg-white;
  }
}

.section-body {
  overflow: hidden;
  margin-top: 1rem;
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
  max-height: 999px;
  opacity: 1;
}
</style>
