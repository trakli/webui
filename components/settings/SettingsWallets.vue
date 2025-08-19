<template>
  <div>
    <div class="section-grid">
      <div class="form-group">
        <label class="form-label">Default Wallet</label>
        <select v-if="isEditMode" class="form-select" v-model="wallet">
          <option value="Main Wallet">Main Wallet</option>
          <option value="Savings">Savings</option>
          <option value="Credit Card">Credit Card</option>
        </select>
        <p v-else class="text-display">{{ wallet }}</p>
      </div>

      <div class="form-group">
        <label class="form-label">Default Group</label>
        <select v-if="isEditMode" class="form-select" v-model="group">
          <option value="Personal">Personal</option>
          <option value="Family">Family</option>
          <option value="Work">Work</option>
        </select>
        <p v-else class="text-display">{{ group }}</p>
      </div>
    </div>

    <div v-if="isEditMode" class="actions">
      <button type="button" class="submit-btn" @click="handleSave">
        <Save class="inline-icon" />
        <span>Update Wallets & Groups</span>
      </button>
      <p v-if="message" class="success-text">{{ message }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Save } from 'lucide-vue-next';

const props = defineProps({
  isEditMode: { type: Boolean, default: false }
});

const wallet = ref('Main Wallet');
const group = ref('Personal');
const message = ref('');

watch(
  () => props.isEditMode,
  () => {
    message.value = '';
  }
);

const handleSave = () => {
  message.value = 'Wallet and group settings updated successfully!';
  setTimeout(() => {
    message.value = '';
  }, 2000);
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.section-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;

  @media (min-width: $breakpoint-md) {
    grid-template-columns: 1fr 1fr;
  }
}

.text-display {
  padding: 0.75rem 1rem;
  border-radius: $radius-lg;
  background: $bg-gray;
  color: $text-primary;
  font-weight: $font-medium;
}

.inline-icon {
  width: 18px;
  height: 18px;
}

.actions {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.success-text {
  margin-top: 0.75rem;
  color: $primary;
  font-weight: $font-semibold;
}
</style>
