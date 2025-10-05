<template>
  <form class="entity-form" @submit.prevent="handleSubmit">
    <div class="form-group">
      <label for="wallet-name" class="form-label">Wallet Name</label>
      <input
        id="wallet-name"
        v-model="form.name"
        type="text"
        class="form-input"
        :class="{ error: nameError }"
        placeholder="Enter wallet name"
        required
      />
      <div v-if="nameError" class="error-text">Wallet name is required.</div>
    </div>

    <div class="form-group">
      <label for="wallet-icon" class="form-label">Select an Icon </label>
      <IconPicker id="wallet-icon" v-model="form.icon" />
      <div v-if="iconError" class="error-text">Please select an icon.</div>
    </div>

    <div class="form-group">
      <label for="wallet-type" class="form-label">Wallet Type</label>
      <select
        id="wallet-type"
        v-model="form.type"
        class="form-select"
        :class="{ error: typeError }"
        required
      >
        <option value="">Select wallet type</option>
        <option value="bank">Bank Account</option>
        <option value="cash">Cash</option>
        <option value="credit_card">Credit Card</option>
        <option value="mobile">Mobile Money</option>
      </select>
      <div v-if="typeError" class="error-text">Please select a wallet type.</div>
    </div>

    <div class="form-group">
      <label for="wallet-currency" class="form-label">Currency</label>
      <select
        id="wallet-currency"
        v-model="form.currency"
        class="form-select"
        :class="{ error: currencyError }"
        required
      >
        <option value="">Select currency</option>
        <option value="XAF">XAF - Central African Franc</option>
        <option value="USD">USD - US Dollar</option>
        <option value="EUR">EUR - Euro</option>
        <option value="GBP">GBP - British Pound</option>
        <option value="JPY">JPY - Japanese Yen</option>
        <option value="CAD">CAD - Canadian Dollar</option>
        <option value="AUD">AUD - Australian Dollar</option>
        <option value="CHF">CHF - Swiss Franc</option>
        <option value="CNY">CNY - Chinese Yuan</option>
      </select>
      <div v-if="currencyError" class="error-text">Please select a currency.</div>
    </div>

    <div class="form-group">
      <label for="wallet-balance" class="form-label">Initial Balance</label>
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
      <label for="wallet-description" class="form-label">Wallet Description</label>
      <textarea
        id="wallet-description"
        v-model="form.description"
        class="form-textarea"
        :class="{ error: descriptionError }"
        placeholder="Type wallet description here..."
        rows="5"
        required
      />
      <div v-if="descriptionError" class="error-text">Wallet description is required.</div>
    </div>

    <button type="submit" class="submit-btn">
      {{ isEditing ? 'Update wallet' : 'Create wallet' }}
    </button>
  </form>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

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
  type: '',
  currency: '',
  balance: 0,
  description: ''
});

const nameError = ref(false);
const iconError = ref(false);
const typeError = ref(false);
const currencyError = ref(false);
const descriptionError = ref(false);

const isEditing = computed(() => !!props.editingItem);

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
  form.value = { name: '', icon: '', type: '', currency: '', balance: 0, description: '' };
  nameError.value = false;
  iconError.value = false;
  typeError.value = false;
  currencyError.value = false;
  descriptionError.value = false;
}

function validateForm() {
  let isValid = true;

  // Reset errors
  nameError.value = false;
  iconError.value = false;
  typeError.value = false;
  currencyError.value = false;
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
      balance: form.value.balance || 0,
      icon: form.value.icon,
      icon_type: 'image'
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

    handleFormClose();
  } catch (err) {
    console.error('Error submitting form:', err);
  }
}

function handleFormClose() {
  emit('close');
  resetForm();
}
</script>

<style scoped lang="scss">
@use '@/assets/scss/_form-styles.scss';
</style>
