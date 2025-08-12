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
        placeholder="Enter group name"
        required
      />
    </div>

    <!-- Group Description -->
    <div class="form-group">
      <label for="group-description" class="form-label">Group Description</label>
      <textarea
        id="group-description"
        v-model="form.description"
        class="form-textarea"
        placeholder="Type group description here..."
        rows="5"
      />
    </div>

    <!-- Submit Button -->
    <button type="submit" class="submit-btn">
      {{ isEditing ? 'Update Group' : 'Create Group +' }}
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
        description: newItem.description || ''
      };
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

function resetForm() {
  form.value = { name: '', description: '' };
}

async function handleSubmit() {
  if (!form.value.name.trim()) return;

  const formData = {
    ...form.value,
    name: form.value.name.trim(),
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
