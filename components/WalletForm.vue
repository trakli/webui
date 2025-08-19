<template>
  <form class="entity-form" @submit.prevent="handleSubmit">
    <!-- Wallet Name -->
    <div class="form-group">
      <label for="wallet-name" class="form-label">Wallet Name</label>
      <input
        id="wallet-name"
        v-model="form.name"
        type="text"
        class="form-input"
        placeholder="Enter wallet name"
        required
      />
    </div>

    <!-- Icon Picker -->
    <div class="form-group">
      <label for="category-icon" class="form-label">Select an Icon </label>
      <IconPicker v-model="form.icon" id="category-icon" />
      <div v-if="iconError" class="error-text">Please select an icon.</div>
    </div>

    <!-- Wallet Description -->
    <div class="form-group">
      <label for="wallet-description" class="form-label">Wallet Description</label>
      <textarea
        id="wallet-description"
        v-model="form.description"
        class="form-textarea"
        placeholder="Type wallet description here..."
        rows="5"
      />
    </div>

    <!-- Submit Button -->
    <button type="submit" class="submit-btn">
      {{ isEditing ? 'Update Wallet' : 'Create Wallet +' }}
    </button>
  </form>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue';

const props = defineProps({
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

const isEditing = computed(() => !!props.editingItem);

// Populate form when editing
watch(
  () => props.editingItem,
  (newItem) => {
    if (newItem) {
      form.value = {
        name: newItem.name || '',
        icon: newItem.icon || '',
        description: newItem.description || ''
      };
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

function resetForm() {
  form.value = { name: '', icon: '', description: '' };
}

async function handleSubmit() {
  if (!form.value.name.trim()) return;

  const formData = {
    ...form.value,
    name: form.value.name.trim(),
    icon: form.value.icon.trim(),
    description: form.value.description.trim()
  };

  if (isEditing.value) {
    const updatedItem = {
      ...props.editingItem,
      ...formData
    };
    emit('updated', updatedItem);
  } else {
    emit('created', formData);
  }

  await nextTick();
  emit('close');
  resetForm();
}
</script>

<style scoped lang="scss">
@use '@/assets/scss/_form-styles.scss';
</style>
