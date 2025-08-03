<template>
  <form class="entity-form" @submit.prevent="handleSubmit">
    <div class="form-header">
      <button type="button" class="close-btn" @click="$emit('close')">
        <X class="close-icon" />
      </button>
    </div>

    <div class="form-group">
      <label :for="formId('name')" class="form-label">{{ pageName }} Name</label>
      <input
        :id="formId('name')"
        v-model="form.name"
        type="text"
        class="form-input"
        :placeholder="`Enter ${pageName.toLowerCase()} name`"
        required
      />
    </div>

    <div v-if="showIcon" class="form-group">
      <label :for="formId('icon')" class="form-label">Select an Icon</label>
      <IconPicker v-model="form.icon" :id="formId('icon')" />
      <div v-if="iconError" class="error-text">Please select an icon.</div>
    </div>

    <div class="form-group">
      <label :for="formId('description')" class="form-label">{{ pageName }} Description</label>
      <textarea
        :id="formId('description')"
        v-model="form.description"
        class="form-textarea"
        :placeholder="`Type ${pageName.toLowerCase()} description here ...`"
        rows="5"
      />
    </div>

    <button type="submit" class="submit-btn">Create {{ pageName }} +</button>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { X } from 'lucide-vue-next';
import IconPicker from '../IconPicker.vue';

const props = defineProps({
  pageName: {
    type: String,
    required: true
  },
  showIcon: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['created', 'close']);

const form = ref({
  name: '',
  icon: '',
  description: ''
});

const iconError = ref(false);

// Generate unique IDs for form elements
const formId = (field) => `${props.pageName.toLowerCase()}-${field}-${Date.now()}`;

function handleSubmit() {
  // Only validate icon if showIcon is true
  iconError.value = props.showIcon && !form.value.icon;
  if (!form.value.name || iconError.value) return;

  // Create a new object without icon if showIcon is false
  const formData = props.showIcon
    ? { ...form.value }
    : { name: form.value.name, description: form.value.description };

  emit('created', formData);

  // Reset form
  form.value = { name: '', icon: '', description: '' };
  iconError.value = false;
}
</script>

<style lang="scss" scoped>
@use '~/assets/scss/_variables' as *;

.entity-form {
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
      color: #ef4444;
      transform: scale(1.25);
    }
  }

  .close-icon {
    width: 20px;
    height: 20px;
    color: #6b7280;
    transition:
      color 0.2s ease,
      transform 0.2s ease;
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

.form-input,
.form-textarea {
  padding: 0.75rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 1rem;
  background: #fff;
  transition: border-color 0.2s;

  &:focus {
    border-color: $primary;
    outline: none;
  }
}

.form-textarea {
  resize: vertical;
  min-height: 120px;
}

.submit-btn {
  background: $primary;
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  border: none;
  border-radius: 8px;
  width: 33%;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: 0.2s;

  &:hover {
    background: $primary-hover;
  }
}

.error-text {
  color: #eb5757;
  font-size: 0.95rem;
  margin-top: 0.25rem;
}
</style>
