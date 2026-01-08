<template>
  <form class="card-form" @submit.prevent="handleSubmit">
    <div class="form-header">
      <h2>{{ isEditing ? t('Edit Group') : t('Create Group') }}</h2>
      <button type="button" class="close-btn" @click="handleClose">
        <X />
      </button>
    </div>

    <div class="form-group">
      <label for="group-name" class="form-label">{{ t('Group Name') }}</label>
      <div class="name-icon-row">
        <div class="name-col">
          <input
            id="group-name"
            v-model="form.name"
            type="text"
            class="form-input"
            :class="{ error: nameError || apiError }"
            :placeholder="t('Enter group name')"
            required
          />
          <div v-if="nameError" class="error-text">{{ t('Group name is required.') }}</div>
          <div v-if="apiError" class="error-text">{{ apiError }}</div>
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
      <label for="group-description" class="form-label">{{ t('Group Description') }}</label>
      <textarea
        id="group-description"
        v-model="form.description"
        class="form-textarea"
        :class="{ error: descriptionError }"
        :placeholder="t('Type group description here...')"
        rows="5"
        required
      />
      <div v-if="descriptionError" class="error-text">
        {{ t('Group description is required.') }}
      </div>
    </div>

    <div class="form-actions">
      <button type="button" class="btn btn-secondary" @click="handleClose">
        {{ t('Cancel') }}
      </button>
      <button type="submit" class="btn btn-primary" :disabled="isLoading">
        <span v-if="isLoading">{{ isEditing ? t('Updating...') : t('Creating...') }}</span>
        <span v-else>{{ isEditing ? t('Update Group') : t('Create Group') }}</span>
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import IconPicker from '../IconPicker.vue';
import * as lucideIcons from 'lucide-vue-next';
import { ImagePlus, X } from 'lucide-vue-next';

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
  description: '',
  icon: ''
});

const nameError = ref(false);
const descriptionError = ref(false);
const isLoading = ref(false);
const apiError = ref(null);
const showIconPicker = ref(false);

const selectedIconComponent = computed(() => {
  const key = form.value.icon;
  if (key && typeof lucideIcons[key] === 'function') {
    return lucideIcons[key];
  }
  return null;
});

const isEditing = computed(() => !!props.editingItem);

// Populate form when editing
watch(
  () => props.editingItem,
  (newItem) => {
    if (newItem) {
      // Extract icon value - could be from icon.content or direct icon value
      const iconValue = newItem.icon?.content || newItem.icon || '';

      form.value = {
        name: newItem.name || '',
        description: newItem.description || '',
        icon: iconValue
      };
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

function resetForm() {
  form.value = { name: '', description: '', icon: '' };
  nameError.value = false;
  descriptionError.value = false;
  apiError.value = null;
  showIconPicker.value = false;
}

function validateForm() {
  let isValid = true;

  // Reset errors
  nameError.value = false;
  descriptionError.value = false;
  apiError.value = null;

  // Validate name
  if (!form.value.name || form.value.name.trim() === '') {
    nameError.value = true;
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
  if (!validateForm()) return;

  try {
    isLoading.value = true;
    const formData = {
      name: form.value.name.trim(),
      description: form.value.description.trim()
    };
    if (form.value.icon && form.value.icon.trim() !== '') {
      formData.icon = form.value.icon;
      formData.icon_type = 'image';
    }

    if (isEditing.value && props.editingItem) {
      emit('updated', { id: props.editingItem.id, ...formData });
    } else {
      emit('created', formData);
    }

    // Don't close or reset form here - let the parent component handle that
    // after successful creation/update
  } catch (err) {
    console.error('Error submitting group form:', err);
    apiError.value = err.message || t('Failed to save group. Please try again.');
  } finally {
    isLoading.value = false;
  }
}

function onIconSelected() {
  showIconPicker.value = false;
}

function handleClose() {
  emit('close');
  resetForm();
}
</script>

<style scoped lang="scss">
@use '@/assets/scss/_variables.scss' as *;
@use '@/assets/scss/_form-styles.scss';

.submit-btn {
  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

.error-text {
  color: #dc2626;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}
</style>
