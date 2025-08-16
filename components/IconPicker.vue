<template>
  <div class="icon-picker">
    <div class="input-container">
      <!-- show selected icon component -->
      <component
        v-if="modelValue && selectedIconComponent"
        :is="selectedIconComponent"
        :key="`selected-${modelValue}`"
        class="selected-icon"
      />
      <input
        ref="searchInput"
        id="iconSearch"
        v-model="search"
        type="text"
        class="icon-search"
        :placeholder="modelValue ? '' : 'Search an icon here'"
      />
      <button v-if="modelValue" type="button" class="clear-icon-btn" @click="clearSelection">
        <XIcon class="clear-icon" />
      </button>

      <!-- chevron toggle button -->
      <button type="button" class="dropdown-toggle-btn" @click="toggleDropdown">
        <ChevronDown v-if="!showDropdown" class="chevron-icon" />
        <ChevronUp v-else class="chevron-icon" />
      </button>
    </div>

    <!-- icon grid only visible if dropdown open -->
    <div v-if="showDropdown" class="icon-grid" ref="iconGrid">
      <button
        v-for="iconName in filteredIcons"
        :key="iconName"
        :class="['icon-btn', { selected: modelValue === iconName }]"
        @click.prevent="selectIcon(iconName)"
        type="button"
        tabindex="-1"
      >
        <component
          v-if="loadedIconsValue[iconName]"
          :is="loadedIconsValue[iconName]"
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
  border: 1px solid $border-light;
  border-radius: 6px;
  padding: 0.4rem 0.6rem;
  background: $bg-white;
}

.selected-icon {
  width: 1.75rem;
  height: 1.75rem;
  margin: 0 $spacing-2;
  color: $text-muted;
}

.icon-search {
  flex: 1;
  border: none;
  outline: none;
  font-size: 0.9rem;
  color: #111827;
  padding: 0.5rem 0.75rem;
}

.clear-icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.2rem;
  display: flex;
  align-items: center;
}

.clear-icon {
  width: 1rem;
  height: 1rem;
  color: #9ca3af;
  transition: color 0.2s;
}

.clear-icon-btn:hover .clear-icon {
  color: $error-color;
}

.dropdown-toggle-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.2rem;
  display: flex;
  align-items: center;
}

.chevron-icon {
  width: 1rem;
  height: 1rem;
  color: #6b7280;
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
}

.icon-btn.selected .icon-svg {
  color: white;
}
</style>
