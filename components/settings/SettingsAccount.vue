<template>
  <div>
    <div class="section-grid">
      <div class="form-group">
        <label class="form-label">First Name</label>
        <input v-if="isEditMode" type="text" class="form-input" v-model="firstName" />
        <p v-else class="text-display">{{ firstName }}</p>
      </div>

      <div class="form-group">
        <label class="form-label">Last Name</label>
        <input v-if="isEditMode" type="text" class="form-input" v-model="lastName" />
        <p v-else class="text-display">{{ lastName }}</p>
      </div>

      <div class="form-group">
        <label class="form-label">Username</label>
        <input v-if="isEditMode" type="text" class="form-input" v-model="username" />
        <p v-else class="text-display">{{ username }}</p>
      </div>

      <div class="form-group">
        <label class="form-label">Email Address</label>
        <input v-if="isEditMode" type="email" class="form-input" v-model="email" />
        <p v-else class="text-display">{{ email }}</p>
      </div>

      <div class="form-group form-group--full">
        <label class="form-label">Password</label>
        <button type="button" class="dashed-button" @click="$emit('open-password-modal')">
          <span>Change Password</span>
          <Lock class="inline-icon" />
        </button>
      </div>
    </div>

    <div v-if="isEditMode" class="actions">
      <button type="button" class="submit-btn" @click="handleSave">
        <Save class="inline-icon" />
        <span>Update Account</span>
      </button>
      <p
        v-if="message"
        class="message"
        :class="{ 'message--success': isSuccess, 'message--info': !isSuccess }"
      >
        {{ message }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import { Lock, Save } from 'lucide-vue-next';

const props = defineProps({
  isEditMode: { type: Boolean, default: false }
});

const firstName = ref('John');
const lastName = ref('Doe');
const username = ref('user123');
const email = ref('user@example.com');

const message = ref('');
const isSuccess = ref(false);

watch(
  () => props.isEditMode,
  () => {
    message.value = '';
  }
);

const handleSave = () => {
  if (email.value !== 'user@example.com') {
    message.value = 'A confirmation email has been sent to your new address.';
    isSuccess.value = false;
  } else {
    message.value = 'Account information updated successfully!';
    isSuccess.value = true;
  }
  setTimeout(() => {
    message.value = '';
  }, 3000);
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

.form-group--full {
  grid-column: 1 / -1;
}

.text-display {
  padding: 0.75rem 1rem;
  border-radius: $radius-lg;
  background: $bg-gray;
  color: $text-primary;
  font-weight: $font-medium;
}

.dashed-button {
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  border-radius: $radius-lg;
  border: 2px dashed $primary;
  color: $primary;
  transition: $transition-base;
  display: flex;
  align-items: center;
  justify-content: space-between;

  &:hover {
    background: $primary-light;
  }
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

.message {
  margin-top: 0.75rem;
  font-weight: $font-semibold;
  text-align: center;

  &--success {
    color: $primary;
  }
  &--info {
    color: $accent-color;
  }
}
</style>
