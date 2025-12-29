<template>
  <div class="search-container">
    <LucideSearch class="search-icon" />
    <input
      v-model="internalValue"
      type="text"
      class="search-input"
      :placeholder="placeholder"
      @input="handleInput"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Search as LucideSearch } from 'lucide-vue-next';

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: 'Search...'
  },
  debounce: {
    type: Number,
    default: 300
  }
});

const emit = defineEmits(['update:modelValue']);

const internalValue = ref(props.modelValue);
let debounceTimeout;

watch(
  () => props.modelValue,
  (newValue) => {
    internalValue.value = newValue;
  }
);

const handleInput = () => {
  clearTimeout(debounceTimeout);
  debounceTimeout = setTimeout(() => {
    emit('update:modelValue', internalValue.value);
  }, props.debounce);
};
</script>

<style lang="scss" scoped>
@use '~/assets/scss/_variables' as *;

.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 8px;
  color: $text-muted;
  width: 14px;
  height: 14px;
  pointer-events: none;
}

.search-input {
  width: 160px;
  padding: 6px 10px 6px 28px;
  border: 1px solid $border-light;
  border-radius: $radius-md;
  font-size: $font-size-xs;
  background: $bg-white;
  color: $text-primary;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: $primary;
    width: 200px;
  }

  &::placeholder {
    color: $text-muted;
  }

  @media (max-width: $breakpoint-sm) {
    width: 100%;

    &:focus {
      width: 100%;
    }
  }
}
</style>
