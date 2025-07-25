<template>
  <form class="category-form" @submit.prevent="handleSubmit">
    <div class="form-header">
      <button type="button" class="close-btn" @click="$emit('close')">
        <X class="close-icon"/>
      </button>
    </div>

    <div class="form-group">
      <label for="category-name" class="form-label">Category Name</label>
      <input
        id="category-name"
        v-model="form.name"
        type="text"
        class="form-input"
        placeholder="Enter Group name"
        required
      />
    </div>

    <div class="form-group">
      <label class="form-label">Select an Icon</label>
      <CategoryIconPicker v-model="form.icon" />
      <div v-if="iconError" class="error-text">Please select an icon.</div>
    </div>

    <div class="form-group">
      <label for="category-description" class="form-label">Category Description</label>
      <textarea
        id="category-description"
        v-model="form.description"
        class="form-textarea"
        placeholder="Type here ..."
        rows="5"
      />
    </div>

    <button type="submit" class="submit-btn">Create Group +</button>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { X } from 'lucide-vue-next';
import CategoryIconPicker from './CategoryIconPicker.vue';

const form = ref({
  name: '',
  icon: '',
  description: ''
});

const iconError = ref(false);
const emit = defineEmits(['created', 'close']);

function handleSubmit() {
  iconError.value = !form.value.icon;
  if (!form.value.name || !form.value.icon) return;

  emit('created', {
    name: form.value.name,
    icon: form.value.icon,
    description: form.value.description
  });

  form.value = { name: '', icon: '', description: '' };
  iconError.value = false;
}
</script>

<style lang="scss" scoped>
@use '~/assets/_variables' as *;

.category-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  background: $bg-gray;
  width: min(600px, 100%);
  max-height: calc(90vh - 4rem);
  overflow-y: auto;
  border-radius: 16px;
  padding: 2rem 2rem 1.5rem 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  box-sizing: border-box;
  align-self: flex-start;
}

.form-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  width: 100%;
  margin: 0;
}

.close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s ease;
  padding: 0;
  margin: -0.5rem -0.5rem 0 0;

  &:hover {
    background-color: #f3f4f6;

    .close-icon {
      color: #ef4444; // Tailwind's red-500
      transform: scale(1.25);
    }
  }

  .close-icon {
    width: 20px;
    height: 20px;
    color: #6b7280; // Tailwind's gray-500
    transition: color 0.2s ease, transform 0.2s ease;
  }
}


.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #222;
  margin-bottom: 0.25rem;
}

.form-input {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
  transition: border-color 0.2s;
}

.form-input:focus {
  border-color: #047844;
  outline: none;
}

.form-textarea {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  border-color: #047844;
  outline: none;
}

.submit-btn {
  background: $primary;
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  width: 30%;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition:  0.2s;
}

.submit-btn:hover {
  background: #035c32;
}

.error-text {
  color: #eb5757;
  font-size: 0.95rem;
  margin-top: 0.25rem;
}
</style>
