<template>
  <form class="entity-form" @submit.prevent="handleSubmit">
    <!-- Party Name -->
    <div class="form-group">
      <label for="party-name" class="form-label">Party Name </label>
      <input
        id="party-name"
        v-model="form.name"
        type="text"
        class="form-input"
        :class="{ error: nameError }"
        placeholder="Enter Party Name"
      />
      <div v-if="nameError" class="error-text">Party Name is required.</div>
    </div>

    <!-- Party Type -->
    <div class="form-group">
      <label for="party-type" class="form-label">Party Type</label>
      <select
        id="party-type"
        v-model="form.partyType"
        class="form-select"
        :class="{ error: partyTypeError }"
        required
      >
        <option value="">Select Party Type</option>
        <option value="individual">Individual</option>
        <option value="company">Company</option>
      </select>
      <div v-if="partyTypeError" class="error-text">Please select a party type.</div>
    </div>

    <!-- Icon Picker -->
    <div class="form-group">
      <label for="category-icon" class="form-label">Select an Icon </label>
      <IconPicker v-model="form.icon" id="category-icon" />
      <div v-if="iconError" class="error-text">Please select an icon.</div>
    </div>

    <!-- Party Description -->
    <div class="form-group">
      <label for="party-description" class="form-label">Party Description </label>
      <textarea
        id="party-description"
        v-model="form.description"
        class="form-textarea"
        :class="{ error: descriptionError }"
        placeholder="Type party description here..."
        rows="5"
        required
      />
      <div v-if="descriptionError" class="error-text">Party description is required.</div>
    </div>

    <button type="submit" class="submit-btn">
      {{ isEditing ? 'Save Party' : 'Create Party +' }}
    </button>
  </form>
</template>

<script setup>
import { ref, nextTick, computed, watch } from 'vue';
import IconPicker from './IconPicker.vue';

const props = defineProps({
  editingItem: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['created', 'updated', 'close']);

const form = ref({
  name: '',
  partyType: '', // Empty default for dropdown
  icon: '',
  description: ''
});

const nameError = ref(false);
const partyTypeError = ref(false);
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
        partyType: newEditingItem.partyType || '',
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
  form.value = {
    name: '',
    partyType: '',
    icon: '',
    description: ''
  };
  nameError.value = false;
  partyTypeError.value = false;
  iconError.value = false;
  descriptionError.value = false;
}

function validateForm() {
  let isValid = true;

  // Reset errors
  nameError.value = false;
  partyTypeError.value = false;
  iconError.value = false;
  descriptionError.value = false;

  // Validate name
  if (!form.value.name || form.value.name.trim() === '') {
    nameError.value = true;
    isValid = false;
  }

  // Validate party type
  if (!form.value.partyType) {
    partyTypeError.value = true;
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
