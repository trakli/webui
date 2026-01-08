<template>
  <div ref="dropdownRef" class="searchable-dropdown">
    <span v-if="label">{{ label }}</span>
    <div class="dropdown-search">
      <MagnifyingGlassIcon class="search-icon" />
      <div class="input-container">
        <!-- Multi-select chips inside input -->
        <div v-if="multiple" class="input-chips">
          <span v-for="item in selectedItems" :key="getOptionKey(item)" class="input-chip">
            {{ getOptionLabel(item) }}
            <button type="button" class="input-chip-remove" @click="removeSelectedItem(item)">
              ×
            </button>
          </span>
        </div>
        <input
          type="text"
          :value="searchQuery"
          :placeholder="multiple && selectedItems.length ? '' : placeholder"
          :class="{ 'has-chips': multiple && selectedItems.length }"
          @input="handleInput"
          @focus="showDropdown = true"
        />
      </div>
      <ChevronDownIcon class="dropdown-icon" @click="toggleDropdown" />
    </div>
    <ul v-if="showDropdown && filteredOptions.length" class="dropdown-list">
      <li
        v-for="option in filteredOptions"
        :key="getOptionKey(option)"
        :class="{
          'selected-option': isSelected(option),
          disabled: isDisabled(option)
        }"
        @mousedown.prevent="selectOption(option)"
      >
        <span class="option-content">
          <template
            v-for="(part, index) in getHighlightedParts(getOptionLabel(option))"
            :key="index"
          >
            <span :class="part.isMatch ? 'text-highlight' : 'text-secondary'">
              {{ part.text }}
            </span>
          </template>
        </span>
        <span v-if="isSelected(option)" class="selected-check">✓</span>
      </li>
    </ul>
    <div v-if="error" class="error-text">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { MagnifyingGlassIcon, ChevronDownIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  label: { type: String, default: '' },
  placeholder: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  modelValue: { type: [String, Array], default: '' },
  multiple: { type: Boolean, default: false },
  error: { type: String, default: '' },
  optionLabel: { type: String, default: 'name' },
  optionKey: { type: String, default: 'id' },
  disabled: { type: Function, default: () => false }
});

const emit = defineEmits(['update:modelValue', 'select']);

const searchQuery = ref('');
const showDropdown = ref(false);
const selectedItems = ref([]);

const filteredOptions = computed(() => {
  if (!searchQuery.value) return props.options;
  const query = searchQuery.value.toLowerCase();
  return props.options.filter((option) => getOptionLabel(option).toLowerCase().includes(query));
});

function getOptionLabel(option) {
  return typeof option === 'string' ? option : option[props.optionLabel];
}

function getOptionKey(option) {
  return typeof option === 'string' ? option : option[props.optionKey];
}

function isSelected(option) {
  if (!props.multiple) return false;
  return selectedItems.value.some((item) => getOptionKey(item) === getOptionKey(option));
}

function isDisabled(option) {
  return props.disabled(option);
}

function handleInput(event) {
  searchQuery.value = event.target.value;
  emit('update:modelValue', searchQuery.value);
}

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

function selectOption(option) {
  const label = getOptionLabel(option);

  if (props.multiple) {
    const key = getOptionKey(option);
    const index = selectedItems.value.findIndex((item) => getOptionKey(item) === key);

    if (index === -1) {
      selectedItems.value.push(option);
    } else {
      selectedItems.value.splice(index, 1);
    }

    emit(
      'update:modelValue',
      selectedItems.value.map((item) => getOptionKey(item))
    );
  } else {
    searchQuery.value = label;
    showDropdown.value = false;
    emit('update:modelValue', label);
  }

  emit('select', option);
}

function removeSelectedItem(item) {
  const index = selectedItems.value.findIndex(
    (selected) => getOptionKey(selected) === getOptionKey(item)
  );
  if (index !== -1) {
    selectedItems.value.splice(index, 1);
    emit(
      'update:modelValue',
      selectedItems.value.map((item) => getOptionKey(item))
    );
    emit('select', selectedItems.value);
  }
}

function getHighlightedParts(text) {
  const query = searchQuery.value.trim();
  if (!query) return [{ text, isMatch: false }];

  const regex = new RegExp(query, 'gi');
  const matches = [...text.matchAll(regex)];

  if (matches.length === 0) return [{ text, isMatch: false }];

  const result = [];
  let lastIndex = 0;

  for (const match of matches) {
    const start = match.index ?? 0;
    const end = start + match[0].length;

    if (start > lastIndex) {
      result.push({ text: text.slice(lastIndex, start), isMatch: false });
    }

    result.push({ text: text.slice(start, end), isMatch: true });
    lastIndex = end;
  }

  if (lastIndex < text.length) {
    result.push({ text: text.slice(lastIndex), isMatch: false });
  }

  return result;
}

// Outside click handling
const dropdownRef = ref(null);

function handleOutsideClick(event) {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    showDropdown.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleOutsideClick);
});

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick);
});

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (!props.multiple && typeof newValue === 'string') {
      searchQuery.value = newValue;
    }
  }
);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.searchable-dropdown {
  display: flex;
  flex-direction: column;
  gap: 6px;
  position: relative;

  span {
    font-weight: $font-medium;
  }
}

.dropdown-search {
  display: flex;
  align-items: center;
  position: relative;

  .input-container {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    min-height: 50px;
    border: 1px solid $border-color;
    border-radius: $radius-lg;
    background-color: $bg-white;
    padding: 8px 10px;

    &:focus-within {
      border-color: $primary;
      outline: none;
    }

    .input-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      margin-right: 8px;
    }

    input {
      flex: 1;
      min-width: 120px;
      border: none;
      outline: none;
      padding: 4px 0;
      font-size: 16px;
      color: $text-primary;
      background: transparent;

      &.has-chips {
        min-width: 80px;
      }

      &::placeholder {
        color: $text-muted;
      }
    }
  }

  .search-icon,
  .dropdown-icon {
    position: absolute;
    width: 20px;
    height: 20px;
    color: $primary;
  }

  .search-icon {
    left: 10px;
  }

  .dropdown-icon {
    right: 10px;
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.1);
    }
  }
}

.dropdown-list {
  position: absolute;
  top: 85px;
  width: 100%;
  background-color: $bg-white;
  border: 1px solid $border-light;
  border-radius: $radius-lg;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 8px 0;
  z-index: 1000;
  max-height: 200px;
  overflow-y: auto;

  li {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    cursor: pointer;
    transition: background 0.2s ease;

    .text-highlight {
      color: $text-secondary;
      font-weight: 500;
    }

    .text-secondary {
      color: $text-muted;
    }

    &:hover {
      background-color: $bg-light;
    }

    &.selected-option {
      background-color: $primary-light;
      font-weight: $font-medium;
    }

    &.disabled {
      opacity: 0.55;
      pointer-events: none;
    }

    .option-content {
      flex: 1;
    }

    .selected-check {
      color: $primary;
      font-weight: bold;
      font-size: 16px;
      margin-left: 8px;
    }
  }
}

.error-text {
  margin-top: 4px;
  color: $error-color;
  font-size: $font-size-xs;
}

.input-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  background: $primary;
  color: white;
  border: none;
  border-radius: $radius-xl;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;

  .input-chip-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    margin-left: 2px;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    font-size: 10px;
    line-height: 1;
    transition: background 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.3);
    }
  }
}
</style>
