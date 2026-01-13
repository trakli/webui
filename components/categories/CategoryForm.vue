<template>
  <form class="card-form" @submit.prevent="handleSubmit">
    <div class="form-header">
      <h2>{{ isEditing ? t('Edit Category') : t('Create Category') }}</h2>
      <button type="button" class="close-btn" @click="handleClose">
        <X />
      </button>
    </div>

    <div class="form-group">
      <label for="category-name" class="form-label">{{ t('Category Name') }}</label>
      <div class="name-icon-row">
        <div class="name-col">
          <input
            id="category-name"
            v-model="form.name"
            type="text"
            class="form-input"
            :class="{ error: nameError }"
            :placeholder="t('Enter category name')"
            required
          />
          <div v-if="nameError" class="error-text">{{ t('Category name is required.') }}</div>
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
      <label for="category-type" class="form-label">{{ t('Category Type') }}</label>
      <select
        id="category-type"
        v-model="form.type"
        class="form-select"
        :class="{ error: typeError }"
        required
      >
        <option value="">{{ t('Select type') }}</option>
        <option value="income">{{ t('Income') }}</option>
        <option value="expense">{{ t('Expense') }}</option>
      </select>
      <div v-if="typeError" class="error-text">{{ t('Please select a category type.') }}</div>
    </div>

    <div class="form-group">
      <label for="category-description" class="form-label">{{ t('Category Description') }}</label>
      <textarea
        id="category-description"
        v-model="form.description"
        class="form-textarea"
        :class="{ error: descriptionError }"
        :placeholder="t('Type category description here...')"
        rows="5"
        required
      />
      <div v-if="descriptionError" class="error-text">
        {{ t('Category description is required.') }}
      </div>
    </div>

    <div class="form-actions">
      <button type="button" class="btn btn-secondary" @click="handleClose">
        {{ t('Cancel') }}
      </button>
      <button type="submit" class="btn btn-primary">
        {{ isEditing ? t('Update Category') : t('Create Category') }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, nextTick, computed, watch } from 'vue';
import IconPicker from '@/components/IconPicker.vue';
import * as lucideIcons from 'lucide-vue-next';
import { ImagePlus, X } from 'lucide-vue-next';

const { t } = useI18n();

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
  type: '',
  description: ''
});

const nameError = ref(false);
const typeError = ref(false);
const descriptionError = ref(false);
const showIconPicker = ref(false);

const selectedIconComponent = computed(() => {
  const key = form.value.icon;
  if (key && typeof lucideIcons[key] === 'function') {
    return lucideIcons[key];
  }
  return null;
});

const isEditing = computed(() => !!props.editingItem);

// Watch for editing item changes and populate form
watch(
  () => props.editingItem,
  (newEditingItem) => {
    if (newEditingItem) {
      // Extract icon value - could be from icon.path, icon.content, or direct icon value
      let iconValue = '';
      if (newEditingItem.icon) {
        if (typeof newEditingItem.icon === 'string') {
          iconValue = newEditingItem.icon;
        } else if (newEditingItem.icon.path) {
          iconValue = newEditingItem.icon.path;
        } else if (newEditingItem.icon.content) {
          iconValue = newEditingItem.icon.content;
        }
      }

      form.value = {
        name: newEditingItem.name || '',
        icon: iconValue,
        type: newEditingItem.type || '',
        description: newEditingItem.description || ''
      };
    } else {
      resetForm();
    }
  },
  { immediate: true }
);

function resetForm() {
  form.value = { name: '', icon: '', type: '', description: '' };
  nameError.value = false;
  typeError.value = false;
  descriptionError.value = false;
  showIconPicker.value = false;
}

function validateForm() {
  let isValid = true;

  // Reset errors
  nameError.value = false;
  typeError.value = false;
  descriptionError.value = false;

  // Validate name
  if (!form.value.name || form.value.name.trim() === '') {
    nameError.value = true;
    isValid = false;
  }

  // Validate type
  if (!form.value.type || form.value.type.trim() === '') {
    typeError.value = true;
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
      name: form.value.name.trim(),
      description: form.value.description.trim(),
      type: form.value.type
    };
    if (form.value.icon && form.value.icon.trim() !== '') {
      formData.icon = form.value.icon;
      formData.icon_type = 'image';
    }

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

function onIconSelected() {
  showIconPicker.value = false;
}

function handleClose() {
  emit('close');
  resetForm();
}
</script>

<style scoped lang="scss">
@use '@/assets/scss/_form-styles.scss';
</style>
