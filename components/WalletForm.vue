<template>
  <form class="card-form" @submit.prevent="handleSubmit">
    <div class="form-header">
      <h2>{{ isEditing ? t('Edit Wallet') : t('Create Wallet') }}</h2>
      <button type="button" class="close-btn" @click="handleFormClose">
        <X />
      </button>
    </div>

    <div class="form-group">
      <label for="wallet-name" class="form-label">{{ t('Wallet Name') }}</label>
      <div class="name-icon-row">
        <div class="name-col">
          <input
            id="wallet-name"
            v-model="form.name"
            type="text"
            class="form-input"
            :class="{ error: nameError }"
            :placeholder="t('Enter wallet name')"
            required
          />
          <div v-if="nameError" class="error-text">{{ t('Wallet name is required.') }}</div>
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

    <div class="two-col-row">
      <div class="form-group">
        <label for="wallet-type" class="form-label">{{ t('Wallet Type') }}</label>
        <select
          id="wallet-type"
          v-model="form.type"
          class="form-select"
          :class="{ error: typeError }"
          required
        >
          <option value="">{{ t('Select wallet type') }}</option>
          <option value="bank">{{ t('Bank Account') }}</option>
          <option value="cash">{{ t('Cash') }}</option>
          <option value="credit_card">{{ t('Credit Card') }}</option>
          <option value="mobile">{{ t('Mobile Money') }}</option>
        </select>
        <div v-if="typeError" class="error-text">{{ t('Please select a wallet type.') }}</div>
      </div>

      <div class="form-group">
        <label for="wallet-currency" class="form-label">{{ t('Currency') }}</label>
        <select
          id="wallet-currency"
          v-model="form.currency"
          class="form-select"
          :class="{ error: currencyError }"
          required
        >
          <option value="">{{ t('Select currency') }}</option>
          <option value="XAF">XAF - {{ t('Central African Franc') }}</option>
          <option value="USD">USD - {{ t('US Dollar') }}</option>
          <option value="EUR">EUR - {{ t('Euro') }}</option>
          <option value="GBP">GBP - {{ t('British Pound') }}</option>
          <option value="JPY">JPY - {{ t('Japanese Yen') }}</option>
          <option value="CAD">CAD - {{ t('Canadian Dollar') }}</option>
          <option value="AUD">AUD - {{ t('Australian Dollar') }}</option>
          <option value="CHF">CHF - {{ t('Swiss Franc') }}</option>
          <option value="CNY">CNY - {{ t('Chinese Yuan') }}</option>
        </select>
        <div v-if="currencyError" class="error-text">{{ t('Please select a currency.') }}</div>
      </div>
    </div>

    <div class="form-group">
      <label for="wallet-balance" class="form-label">{{ t('Initial Balance') }}</label>
      <input
        id="wallet-balance"
        v-model.number="form.balance"
        type="number"
        step="0.01"
        class="form-input"
        placeholder="0.00"
      />
    </div>

    <div class="form-group">
      <label for="wallet-description" class="form-label">{{ t('Wallet Description') }}</label>
      <textarea
        id="wallet-description"
        v-model="form.description"
        class="form-textarea"
        :class="{ error: descriptionError }"
        :placeholder="t('Type wallet description here...')"
        rows="5"
        required
      />
      <div v-if="descriptionError" class="error-text">
        {{ t('Wallet description is required.') }}
      </div>
    </div>

    <div class="form-actions">
      <button type="button" class="btn btn-secondary" @click="handleFormClose">
        {{ t('Cancel') }}
      </button>
      <button type="submit" class="btn btn-primary">
        {{ isEditing ? t('Update Wallet') : t('Create Wallet') }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import IconPicker from './IconPicker.vue';
import * as lucideIcons from 'lucide-vue-next';
import { ImagePlus, X } from 'lucide-vue-next';
import { useSharedData } from '@/composables/useSharedData';

const { t } = useI18n();

const props = defineProps({
  editingItem: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['created', 'updated', 'close']);

const sharedData = useSharedData();
const defaultCurrency = computed(() => sharedData.getDefaultCurrency?.value || 'USD');

const form = ref({
  name: '',
  icon: '',
  type: '',
  currency: '',
  balance: 0,
  description: ''
});

const nameError = ref(false);
const typeError = ref(false);
const currencyError = ref(false);
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

onMounted(() => {
  if (!isEditing.value && (!form.value.currency || form.value.currency.trim() === '')) {
    form.value.currency = defaultCurrency.value;
  }
});

// Populate form when editing
watch(
  () => props.editingItem,
  (newItem) => {
    if (newItem) {
      // Extract icon value - could be from icon.path, icon.content, or direct icon value
      let iconValue = '';
      if (newItem.icon) {
        if (typeof newItem.icon === 'string') {
          iconValue = newItem.icon;
        } else if (newItem.icon.path) {
          iconValue = newItem.icon.path;
        } else if (newItem.icon.content) {
          iconValue = newItem.icon.content;
        }
      }

      console.log('Editing wallet:', newItem);
      console.log('Extracted icon value:', iconValue);

      form.value = {
        name: newItem.name || '',
        icon: iconValue,
        type: newItem.type || '',
        currency: newItem.currency || '',
        balance: newItem.balance || 0,
        description: newItem.description || ''
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
    icon: '',
    type: '',
    currency: defaultCurrency.value,
    balance: 0,
    description: ''
  };
  nameError.value = false;
  typeError.value = false;
  currencyError.value = false;
  descriptionError.value = false;
  showIconPicker.value = false;
}

function validateForm() {
  let isValid = true;

  // Reset errors
  nameError.value = false;
  typeError.value = false;
  currencyError.value = false;
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

  // Validate currency
  if (!form.value.currency || form.value.currency.trim() === '') {
    currencyError.value = true;
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
  if (!form.value.currency || form.value.currency.trim() === '') {
    form.value.currency = defaultCurrency.value;
  }

  // Validate all fields
  if (!validateForm()) {
    return;
  }

  try {
    const formData = {
      name: form.value.name.trim(),
      description: form.value.description.trim(),
      type: form.value.type.trim(),
      currency: form.value.currency,
      balance: form.value.balance || 0
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

    handleFormClose();
  } catch (err) {
    console.error('Error submitting form:', err);
  }
}

function handleFormClose() {
  emit('close');
  resetForm();
}

function onIconSelected() {
  showIconPicker.value = false;
}
</script>

<style scoped lang="scss">
@use '@/assets/scss/_variables.scss' as *;
@use '@/assets/scss/_form-styles.scss';
</style>
