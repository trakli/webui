<template>
  <form class="entity-form" @submit.prevent="handleSubmit">
    <div class="form-header">
      <button type="button" class="close-btn" @click="$emit('close')">
        <X class="close-icon" />
      </button>
    </div>

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

    <button type="submit" class="submit-btn">Create Group +</button>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import { X } from 'lucide-vue-next';

const emit = defineEmits(['created', 'close']);

const form = ref({
  name: '',
  description: ''
});

function handleSubmit() {
  if (!form.value.name) return;

  emit('created', { ...form.value });

  form.value = { name: '', description: '' };
}
</script>

<style scoped lang="scss">
@use '@/assets/scss/_form-styles.scss';
</style>
