<template>
  <div class="icon-picker">
    <div class="input-container">
      <component
        :is="selectedIconComponent"
        v-if="modelValue && selectedIconComponent"
        :key="`selected-${modelValue}`"
        class="selected-icon"
      />
      <input
        id="iconSearch"
        ref="searchInput"
        v-model="search"
        type="text"
        class="icon-search"
        :placeholder="modelValue ? '' : 'Search an icon here'"
      />
      <button v-if="modelValue" type="button" class="clear-icon-btn" @click="clearSelection">
        <XIcon class="clear-icon" />
      </button>

      <button type="button" class="dropdown-toggle-btn" @click="toggleDropdown">
        <ChevronDown v-if="!showDropdown" class="chevron-icon" />
        <ChevronUp v-else class="chevron-icon" />
      </button>
    </div>

    <div v-if="showDropdown" ref="iconGrid" class="icon-grid">
      <button
        v-for="iconName in filteredIcons"
        :key="iconName"
        :class="['icon-btn', { selected: modelValue === iconName }]"
        type="button"
        tabindex="-1"
        @click.prevent="selectIcon(iconName)"
      >
        <component
          :is="loadedIconsValue[iconName]"
          v-if="loadedIconsValue[iconName]"
          :key="`grid-${iconName}`"
          class="icon-svg"
        />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount, shallowRef, toRef, nextTick } from 'vue';
import * as lucideIcons from 'lucide-vue-next';
import { XIcon, ChevronDown, ChevronUp } from 'lucide-vue-next';

// props / emits
const props = defineProps({
  modelValue: { type: String, default: '' }
});
const modelValue = toRef(props, 'modelValue');
const emit = defineEmits(['update:modelValue']);

// local state
const search = ref('');
const loadedIcons = shallowRef({});
const selectedIconComponent = shallowRef(null);
const allIconNames = ref([]);
const searchInput = ref(null);
const iconGrid = ref(null);
let blurTimer = null;

// dropdown state
const showDropdown = ref(false);

// helper accessor for template (unwrap shallowRef safely)
const loadedIconsValue = computed(() => loadedIcons.value || {});

// gather icon names on mount
onMounted(() => {
  try {
    allIconNames.value = Object.keys(lucideIcons).filter(
      (key) =>
        typeof lucideIcons[key] === 'function' &&
        key !== 'default' &&
        !key.startsWith('create') &&
        key[0] === key[0].toUpperCase()
    );
  } catch (err) {
    console.error('IconPicker: failed to enumerate icons', err);
    allIconNames.value = [];
  }
});

onBeforeUnmount(() => {
  if (blurTimer) {
    clearTimeout(blurTimer);
    blurTimer = null;
  }
  // Clear refs to prevent memory leaks
  selectedIconComponent.value = null;
  loadedIcons.value = {};
});

// computed filtered list
const filteredIcons = computed(() => {
  if (!allIconNames.value) return [];
  return allIconNames.value.filter((name) =>
    name.toLowerCase().includes(search.value.toLowerCase())
  );
});

// safe getter for icon components
function getIconComponent(iconName) {
  try {
    const component = lucideIcons[iconName];
    return component && typeof component === 'function' ? component : null;
  } catch (err) {
    console.error('IconPicker: getIconComponent failed for', iconName, err);
    return null;
  }
}

function loadIconComponent(iconName) {
  try {
    if (!iconName) return null;

    const currentLoaded = loadedIcons.value || {};
    if (!currentLoaded[iconName]) {
      const component = getIconComponent(iconName);
      if (component) {
        loadedIcons.value = { ...currentLoaded, [iconName]: component };
      }
    }
    return loadedIcons.value[iconName] || null;
  } catch (err) {
    console.error('IconPicker: loadIconComponent error', err);
    return null;
  }
}

// respond to parent v-model changes
watch(
  modelValue,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      selectedIconComponent.value = newValue ? loadIconComponent(newValue) : null;
    }
  },
  { immediate: true }
);

// when the filtered list changes, pre-load the visible icons (only if none selected)
watch(
  filteredIcons,
  (newList) => {
    if (!modelValue.value && newList && newList.length > 0) {
      const iconsToLoad = newList.slice(0, 50);
      iconsToLoad.forEach((iconName) => {
        if (iconName) loadIconComponent(iconName);
      });
    }
  },
  { flush: 'post' }
);

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

function selectIcon(name) {
  if (!name) return;

  emit('update:modelValue', name);
  search.value = '';
  showDropdown.value = false; // close dropdown after selection

  nextTick(() => {
    if (searchInput.value && typeof searchInput.value.blur === 'function') {
      try {
        searchInput.value.blur();
      } catch (e) {
        console.error('IconPicker: selectIcon blur failed', e);
      }
    }
  });
}

function clearSelection() {
  emit('update:modelValue', '');
  search.value = '';
  nextTick(() => {
    if (searchInput.value && typeof searchInput.value.blur === 'function') {
      try {
        searchInput.value.blur();
      } catch (e) {
        console.error('IconPicker: clearSelection blur failed', e);
      }
    }
  });
}
</script>

<style scoped lang="scss">
@use '@/assets/scss/_variables' as *;

.icon-picker {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.input-container {
  display: flex;
  align-items: center;
  border: 1.5px solid $border-light;
  border-radius: 8px;
  padding: 0.5rem;
  background: $bg-white;
  min-height: 44px;
  gap: 0.375rem;
  transition: border-color 0.2s ease;
  position: relative;

  &:focus-within {
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
  }

  @media (max-width: $breakpoint-sm) {
    padding: 0.375rem;
    min-height: 40px;
    gap: 0.25rem;
  }
}

.icon-search {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.9rem;
  color: $text-primary;
  background: transparent;
  min-width: 0;
  padding: 0;

  &::placeholder {
    color: $text-muted;
  }

  @media (max-width: $breakpoint-sm) {
    font-size: 0.875rem;
  }
}

.clear-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
  width: 24px;
  height: 24px;

  @media (max-width: $breakpoint-sm) {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.clear-icon {
  width: 14px;
  height: 14px;
  color: $text-muted;
  transition: color 0.2s;

  @media (max-width: $breakpoint-sm) {
    width: 12px;
    height: 12px;
  }
}

.clear-icon-btn:hover .clear-icon {
  color: $error-color;
}

.dropdown-toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.125rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
  width: 24px;
  height: 24px;

  @media (max-width: $breakpoint-sm) {
    width: 20px;
    height: 20px;
  }

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
}

.chevron-icon {
  width: 14px;
  height: 14px;
  color: $text-muted;

  @media (max-width: $breakpoint-sm) {
    width: 12px;
    height: 12px;
  }
}

.icon-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  grid-template-rows: repeat(4, 1fr);
  width: 53%;
  gap: 0.3rem;
  background: $bg-white;
  border: 1px solid $border-light;
  border-radius: 6px;
  padding: 0.5rem;
  box-sizing: border-box;
  height: 18vh;
  overflow-y: auto;
  overflow-x: hidden;

  @media (max-width: $breakpoint-md) {
    width: 70%;
    grid-template-columns: repeat(6, 1fr);
  }

  @media (max-width: $breakpoint-sm) {
    width: 100%;
    grid-template-columns: repeat(7, 1fr);
    height: 21vh;
    gap: 0.25rem;
    padding: 0.375rem;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(7, 1fr);
    height: 20vh;
    gap: 0.2rem;
    padding: 0.25rem;
  }
}

.icon-btn {
  width: 2.2rem;
  height: 2.2rem;
  border: 1px solid $border-color;
  border-radius: 4px;
  background: $bg-white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;

  @media (max-width: $breakpoint-sm) {
    width: 2rem;
    height: 2rem;
    border-radius: 3px;
  }

  @media (max-width: 480px) {
    width: 1.8rem;
    height: 1.8rem;
  }
}

.icon-btn:hover {
  background: $bg-gray;
}

.icon-btn.selected {
  background: $primary;
  border-color: $primary;
}

.icon-svg {
  width: 1.1rem;
  height: 1.1rem;
  color: $text-muted;

  @media (max-width: $breakpoint-sm) {
    width: 1rem;
    height: 1rem;
  }

  @media (max-width: 480px) {
    width: 0.9rem;
    height: 0.9rem;
  }
}

.icon-btn.selected .icon-svg {
  color: white;
}
</style>
