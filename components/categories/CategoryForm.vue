<template>
  <form class="entity-form" @submit.prevent="handleSubmit">
    <div class="form-header">
      <button type="button" class="close-btn" @click="$emit('close')">
        <X class="close-icon" />
      </button>
    </div>

    <div class="form-group">
      <label for="category-name" class="form-label">Category Name</label>
      <input
        id="category-name"
        v-model="form.name"
        type="text"
        class="form-input"
        placeholder="Enter category name"
        required
      />
    </div>

    <div class="form-group">
      <label for="category-icon" class="form-label">Select an Icon</label>
      <IconPicker v-model="form.icon" id="category-icon" />
      <div v-if="iconError" class="error-text">Please select an icon.</div>
    </div>

    <div class="form-group">
      <label for="category-description" class="form-label">Category Description</label>
      <textarea
        id="category-description"
        v-model="form.description"
        class="form-textarea"
        placeholder="Type category description here..."
        rows="5"
      />
    </div>

    <button type="submit" class="submit-btn">Create Category +</button>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { X } from 'lucide-vue-next';
import IconPicker from '../IconPicker.vue';

const emit = defineEmits(['created', 'close']);

const form = ref({
  name: '',
  icon: '',
  description: ''
});

const iconError = ref(false);

function handleSubmit() {
  iconError.value = !form.value.icon;
  if (!form.value.name || iconError.value) return;

  emit('created', { ...form.value });

  form.value = { name: '', icon: '', description: '' };
  iconError.value = false;
}
</script>

<style scoped lang="scss">
@use '@/assets/scss/_form-styles.scss';
</style>
