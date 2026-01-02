<template>
  <div>
    <div class="form-group form-group--full">
      <label class="form-label">{{ t('Profile Picture') }}</label>
      <div class="avatar-container">
        <img v-if="user" :src="getAvatarUrl(user)" :alt="t('User Avatar')" class="avatar-image" />
      </div>
    </div>
    <div class="section-grid">
      <div class="form-group">
        <label class="form-label">{{ t('First Name') }}</label>
        <input v-if="isEditMode" v-model="firstName" type="text" class="form-input" />
        <p v-else class="text-display">{{ firstName }}</p>
      </div>

      <div class="form-group">
        <label class="form-label">{{ t('Last Name') }}</label>
        <input v-if="isEditMode" v-model="lastName" type="text" class="form-input" />
        <p v-else class="text-display">{{ lastName }}</p>
      </div>

      <div class="form-group">
        <label class="form-label">{{ t('Username') }}</label>
        <input v-if="isEditMode" v-model="username" type="text" class="form-input" />
        <p v-else class="text-display">{{ username }}</p>
      </div>

      <div class="form-group">
        <label class="form-label">{{ t('Email Address') }}</label>
        <input v-if="isEditMode" v-model="email" type="email" class="form-input" />
        <p v-else class="text-display">{{ email }}</p>
      </div>

      <div class="form-group form-group--full">
        <label class="form-label">{{ t('Password') }}</label>
        <button type="button" class="dashed-button" @click="$emit('open-password-modal')">
          <span>{{ t('Change Password') }}</span>
          <Lock class="inline-icon" />
        </button>
      </div>
    </div>

    <div v-if="isEditMode" class="actions">
      <button type="button" class="submit-btn" @click="handleSave">
        <Save class="inline-icon" />
        <span>{{ t('Update Account') }}</span>
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
import { useAuth } from '@/composables/useAuth';
import { useAvatar } from '@/composables/useAvatar';

const { t } = useI18n();

defineEmits(['open-password-modal']);

const props = defineProps({
  isEditMode: { type: Boolean, default: false }
});

const { user } = useAuth();
const { getAvatarUrl } = useAvatar();

const firstName = ref(user.value?.first_name || '');
const lastName = ref(user.value?.last_name || '');
const username = ref(user.value?.username || '');
const email = ref(user.value?.email || '');

const message = ref('');
const isSuccess = ref(false);

watch(
  () => props.isEditMode,
  () => {
    message.value = '';
  }
);

watch(
  user,
  (newUser) => {
    firstName.value = newUser?.first_name || '';
    lastName.value = newUser?.last_name || '';
    username.value = newUser?.username || '';
    email.value = newUser?.email || '';
  },
  { immediate: true }
);

const handleSave = () => {
  if (email.value !== 'user@example.com') {
    message.value = t('A confirmation email has been sent to your new address.');
    isSuccess.value = false;
  } else {
    message.value = t('Account information updated successfully!');
    isSuccess.value = true;
  }
  setTimeout(() => {
    message.value = '';
  }, 3000);
};
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.avatar-container {
  margin-top: 0.5rem;
  display: flex;
  justify-content: center;
}

.avatar-image {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #fff;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

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
