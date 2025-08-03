<template>
  <div class="icon-picker">
    <!-- Search Section -->
    <div class="icon-search-section">
      <div class="input-container">
        <component
          v-if="modelValue && selectedIconComponent"
          :is="selectedIconComponent"
          class="selected-icon"
        />
        <input
          id="iconSearch"
          v-model="search"
          type="text"
          class="icon-search"
          :placeholder="modelValue ? '' : 'Search an icon here'"
          @input="showDropdown = true"
        />
        <button class="dropdown-btn" @click="toggleDropdown" type="button">
          <ChevronDown class="dropdown-icon" />
        </button>
      </div>
    </div>
    <!-- Icon Grid -->
    <div v-if="showDropdown" class="icon-grid-wrapper">
      <div class="icon-grid">
        <button
          v-for="iconName in filteredIcons"
          :key="iconName"
          :class="['icon-btn', { selected: modelValue === iconName }]"
          @click.prevent="selectIcon(iconName)"
          type="button"
        >
          <component v-if="loadedIcons[iconName]" :is="loadedIcons[iconName]" class="icon-svg" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, shallowRef } from 'vue';
import { ChevronDown } from 'lucide-vue-next';
import * as lucideIcons from 'lucide-vue-next';

const props = defineProps({
  modelValue: String
});

const emit = defineEmits(['update:modelValue']);

const search = ref('');
const showDropdown = ref(false);
const loadedIcons = shallowRef({});
const selectedIconComponent = shallowRef(null);
const allIconNames = ref([]);

// Get all available icon names
onMounted(() => {
  // Filter out non-component exports
  allIconNames.value = Object.keys(lucideIcons).filter(
    (key) =>
      typeof lucideIcons[key] === 'function' &&
      key !== 'default' &&
      !key.startsWith('create') &&
      key[0] === key[0].toUpperCase()
  );
  console.log('Available icons:', allIconNames.value.length);
});

const filteredIcons = computed(() =>
  allIconNames.value.filter((name) => name.toLowerCase().includes(search.value.toLowerCase()))
);

// Load icon component directly from lucide-vue-next
function getIconComponent(iconName) {
  return lucideIcons[iconName] || null;
}

// Load and cache icon components
function loadIconComponent(iconName) {
  if (!loadedIcons.value[iconName]) {
    const component = getIconComponent(iconName);
    if (component) {
      loadedIcons.value = {
        ...loadedIcons.value,
        [iconName]: component
      };
    }
  }
  return loadedIcons.value[iconName];
}

// Load selected icon when modelValue changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      selectedIconComponent.value = loadIconComponent(newValue);
    } else {
      selectedIconComponent.value = null;
    }
  },
  { immediate: true }
);

// Load visible icons when dropdown is shown or search is updated
watch(
  () => [showDropdown.value, filteredIcons.value],
  ([dropdownOpen]) => {
    if (dropdownOpen) {
      // Load all filtered icons
      filteredIcons.value.forEach((iconName) => {
        loadIconComponent(iconName);
      });
    }
  },
  { flush: 'post' }
);

function selectIcon(name) {
  emit('update:modelValue', name);
  showDropdown.value = false;
  search.value = '';
}

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}
</script>

<style scoped>
.icon-picker {
  position: relative;
  width: 100%;
}

.icon-search-section {
  margin-bottom: 1rem;
}

.input-container {
  display: flex;
  align-items: center;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem;
  background: white;
}

.selected-icon {
  width: 1.25rem;
  height: 1.25rem;
  margin-right: 0.5rem;
  color: #6b7280;
}

.icon-search {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.875rem;
}

.dropdown-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
}

.dropdown-icon {
  width: 1rem;
  height: 1rem;
  color: #6b7280;
}

.icon-grid-wrapper {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 50;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  max-height: 300px;
  overflow-y: auto;
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(2.5rem, 1fr));
  gap: 0.25rem;
  padding: 0.75rem;
}

.icon-btn {
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.icon-btn:hover {
  background: #f3f4f6;
  border-color: #d1d5db;
}

.icon-btn.selected {
  background: #3b82f6;
  border-color: #3b82f6;
}

.icon-svg {
  width: 1.25rem;
  height: 1.25rem;
  color: #6b7280;
}

.icon-btn.selected .icon-svg {
  color: white;
}
</style>
