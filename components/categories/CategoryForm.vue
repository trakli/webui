<template>
  <form class="entity-form" @submit.prevent="handleSubmit">
    <!-- Category Name -->
    <div class="form-group">
      <label for="category-name" class="form-label">Category Name </label>
      <input
        id="category-name"
        v-model="form.name"
        type="text"
        class="form-input"
        :class="{ error: nameError }"
        placeholder="Enter category name"
        required
      />
      <div v-if="nameError" class="error-text">Category name is required.</div>
    </div>

    <!-- Icon Picker -->
    <div class="form-group">
      <label for="category-icon" class="form-label">Select an Icon </label>
      <IconPicker v-model="form.icon" id="category-icon" />
      <div v-if="iconError" class="error-text">Please select an icon.</div>
    </div>

    <!-- Category Description -->
    <div class="form-group">
      <label for="category-description" class="form-label">Category Description </label>
      <textarea
        id="category-description"
        v-model="form.description"
        class="form-textarea"
        :class="{ error: descriptionError }"
        placeholder="Type category description here..."
        rows="5"
        required
      />
      <div v-if="descriptionError" class="error-text">Category description is required.</div>
    </div>

    <button type="submit" class="submit-btn">
      {{ isEditing ? 'Save Category' : 'Create Category +' }}
    </button>
  </form>
</template>

<script setup>
import { ref, nextTick, computed, watch } from 'vue';
import IconPicker from '@/components/IconPicker.vue';

const props = defineProps({
  pageName: {
    type: String,
    required: true
  },
  editingItem: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['created', 'updated', 'close']);

const form = ref({
  name: '',
  icon: '',
  description: ''
});

const nameError = ref(false);
const iconError = ref(false);
const descriptionError = ref(false);

const isEditing = computed(() => !!props.editingItem);

// Watch for editing item changes and populate form
watch(
  () => props.editingItem,
  (newEditingItem) => {
    if (newEditingItem) {
      form.value = {
        name: newEditingItem.name || '',
        icon: newEditingItem.icon || '',
        description: newEditingItem.description || ''
      };
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

function resetForm() {
  form.value = { name: '', icon: '', description: '' };
  nameError.value = false;
  iconError.value = false;
  descriptionError.value = false;
}

function validateForm() {
  let isValid = true;

  // Reset errors
  nameError.value = false;
  iconError.value = false;
  descriptionError.value = false;

  // Validate name
  if (!form.value.name || form.value.name.trim() === '') {
    nameError.value = true;
    isValid = false;
  }

  // Validate icon
  if (!form.value.icon || form.value.icon.trim() === '') {
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
  // Validate all fields
  if (!validateForm()) {
    return;
  }

  try {
    const formData = {
      ...form.value,
      name: form.value.name.trim(),
      description: form.value.description.trim()
    };

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
</script>

<style scoped lang="scss">
@use '@/assets/scss/_form-styles.scss';
</style>
