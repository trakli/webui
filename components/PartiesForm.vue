<template>
  <form class="entity-form" @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="party-name" class="form-label">{{ t('Party Name') }}</label>
      <div class="name-icon-row">
        <div class="name-col">
          <input
            id="party-name"
            v-model="form.name"
            type="text"
            class="form-input"
            :class="{ error: nameError }"
            :placeholder="t('Enter party name')"
          />
          <div v-if="nameError" class="error-text">{{ t('Party name is required.') }}</div>
        </div>
        <div class="icon-col">
          <button
            type="button"
            class="icon-trigger"
            :aria-expanded="showIconPicker"
            :aria-label="t('Choose icon')"
            @click="showIconPicker = !showIconPicker"
          >
            <component
              :is="selectedIconComponent"
              v-if="selectedIconComponent"
              class="icon-trigger__icon"
            />
            <ImagePlus v-else class="icon-trigger__icon" />
          </button>
        </div>
      </div>

      <div v-if="showIconPicker" class="icon-popover">
        <IconPicker v-model="form.icon" @update:model-value="onIconSelected" />
      </div>
    </div>

    <div class="form-group">
      <label for="party-type" class="form-label">{{ t('Party Type') }}</label>
      <select
        id="party-type"
        v-model="form.type"
        class="form-select"
        :class="{ error: partyTypeError }"
        required
      >
        <option value="">{{ t('Select party type') }}</option>
        <option value="individual">{{ t('Individual') }}</option>
        <option value="organization">{{ t('Organization') }}</option>
        <option value="business">{{ t('Business') }}</option>
        <option value="partnership">{{ t('Partnership') }}</option>
        <option value="non_profit">{{ t('Non-Profit') }}</option>
        <option value="government_agency">{{ t('Government Agency') }}</option>
        <option value="educational_institution">{{ t('Educational Institution') }}</option>
        <option value="healthcare_provider">{{ t('Healthcare Provider') }}</option>
      </select>
      <div v-if="partyTypeError" class="error-text">{{ t('Please select a party type.') }}</div>
    </div>

    <div class="form-group">
      <label for="party-description" class="form-label">{{ t('Party Description') }}</label>
      <textarea
        id="party-description"
        v-model="form.description"
        class="form-textarea"
        :class="{ error: descriptionError }"
        :placeholder="t('Type party description here...')"
        rows="5"
        required
      />
      <div v-if="descriptionError" class="error-text">
        {{ t('Party description is required.') }}
      </div>
    </div>

    <button type="submit" class="submit-btn">
      {{ isEditing ? t('Save party') : t('Create party') }}
    </button>
  </form>
</template>

<script setup>
import { ref, nextTick, computed, watch } from 'vue';
import IconPicker from './IconPicker.vue';
import * as lucideIcons from 'lucide-vue-next';
import { ImagePlus } from 'lucide-vue-next';

const { t } = useI18n();

const props = defineProps({
  editingItem: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['created', 'updated', 'close']);

const form = ref({
  name: '',
  type: '', // Empty default for dropdown
  icon: '',
  description: ''
});

const nameError = ref(false);
const partyTypeError = ref(false);
const descriptionError = ref(false);
const showIconPicker = ref(false);

const selectedIconComponent = computed(() => {
  const key = form.value.icon;
  if (key && typeof lucideIcons[key] === 'function') {
    return lucideIcons[key];
  }
  return null;
});

const isEditing = computed(() => !!props.editingItem);

// Watch for editing item changes and populate form
watch(
  () => props.editingItem,
  (newEditingItem) => {
    if (newEditingItem) {
      // Extract icon value - could be from icon.path, icon.content, or direct icon value
      let iconValue = '';
      if (newEditingItem.icon) {
        if (typeof newEditingItem.icon === 'string') {
          iconValue = newEditingItem.icon;
        } else if (newEditingItem.icon.path) {
          iconValue = newEditingItem.icon.path;
        } else if (newEditingItem.icon.content) {
          iconValue = newEditingItem.icon.content;
        }
      }

      console.log('Editing party:', newEditingItem);
      console.log('Extracted icon value:', iconValue);

      form.value = {
        name: newEditingItem.name || '',
        type: newEditingItem.type || '',
        icon: iconValue,
        description: newEditingItem.description || ''
      };
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

function resetForm() {
  form.value = {
    name: '',
    type: '',
    icon: '',
    description: ''
  };
  nameError.value = false;
  partyTypeError.value = false;
  descriptionError.value = false;
  showIconPicker.value = false;
}

function validateForm() {
  let isValid = true;

  // Reset errors
  nameError.value = false;
  partyTypeError.value = false;
  descriptionError.value = false;

  // Validate name
  if (!form.value.name || form.value.name.trim() === '') {
    nameError.value = true;
    isValid = false;
  }

  // Validate party type
  if (!form.value.type) {
    partyTypeError.value = true;
    isValid = false;
  }

  // Validate description
  if (!form.value.description || form.value.description.trim() === '') {
    descriptionError.value = true;
    isValid = false;
  }

  return isValid;
}

async function handleSubmit() {
  // Validate all fields
  if (!validateForm()) {
    return;
  }

  try {
    const formData = {
      name: form.value.name.trim(),
      type: form.value.type,
      description: form.value.description.trim()
    };
    if (form.value.icon && form.value.icon.trim() !== '') {
      formData.icon = form.value.icon;
      formData.icon_type = 'image';
    }

    if (isEditing.value) {
      // Include the original ID for updates
      const updatedItem = {
        ...props.editingItem,
        ...formData
      };
      emit('updated', updatedItem);
    } else {
      emit('created', formData);
    }

    // give the parent a tick to handle the event (avoid race)
    await nextTick();

    // now close
    emit('close');
  } catch (err) {
    console.error('Error submitting form:', err);
  } finally {
    // reset form and errors
    resetForm();
  }
}

function onIconSelected() {
  showIconPicker.value = false;
}
</script>

<style scoped lang="scss">
@use '@/assets/scss/_variables.scss' as *;
@use '@/assets/scss/_form-styles.scss';
</style>
