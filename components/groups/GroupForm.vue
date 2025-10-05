<template>
  <form class="entity-form" @submit.prevent="handleSubmit">
    <!-- Group Name -->
    <div class="form-group">
      <label for="group-name" class="form-label">Group Name</label>
      <input
        id="group-name"
        v-model="form.name"
        type="text"
        class="form-input"
        :class="{ error: nameError || apiError }"
        placeholder="Enter group name"
        required
      />
      <div v-if="nameError" class="error-text">Group name is required.</div>
      <div v-if="apiError" class="error-text">{{ apiError }}</div>
    </div>

    <!-- Icon Picker -->
    <div class="form-group">
      <label for="group-icon" class="form-label">Select an Icon</label>
      <IconPicker v-model="form.icon" id="group-icon" />
      <div v-if="iconError" class="error-text">Please select an icon.</div>
    </div>

    <!-- Group Description -->
    <div class="form-group">
      <label for="group-description" class="form-label">Group Description</label>
      <textarea
        id="group-description"
        v-model="form.description"
        class="form-textarea"
        :class="{ error: descriptionError }"
        placeholder="Type group description here..."
        rows="5"
        required
      />
      <div v-if="descriptionError" class="error-text">Group description is required.</div>
    </div>

    <button type="submit" class="submit-btn" :disabled="isLoading">
      <span v-if="isLoading">{{ isEditing ? 'Updating...' : 'Creating...' }}</span>
      <span v-else>{{ isEditing ? 'Update group' : 'Create group' }}</span>
    </button>
  </form>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import IconPicker from '../IconPicker.vue';

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
const iconError = ref(false);
const descriptionError = ref(false);
const isLoading = ref(false);
const apiError = ref(null);

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
  iconError.value = false;
  descriptionError.value = false;
  apiError.value = null;
}

function validateForm() {
  let isValid = true;

  // Reset errors
  nameError.value = false;
  iconError.value = false;
  descriptionError.value = false;
  apiError.value = null;

  // Validate name
  if (!form.value.name || form.value.name.trim() === '') {
    nameError.value = true;
    isValid = false;
  }

  // Validate icon
  if (!form.value.icon) {
    iconError.value = true;
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
      description: form.value.description.trim(),
      icon: form.value.icon,
      icon_type: 'image'
    };

    if (isEditing.value && props.editingItem) {
      emit('updated', { id: props.editingItem.id, ...formData });
    } else {
      emit('created', formData);
    }

    // Don't close or reset form here - let the parent component handle that
    // after successful creation/update
  } catch (err) {
    console.error('Error submitting group form:', err);
    apiError.value = err.message || 'Failed to save group. Please try again.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<style scoped lang="scss">
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
