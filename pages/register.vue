<script setup>
import { ref, computed } from 'vue';
import { useRouter } from '#imports';
import { useAuth } from '@/composables/useAuth';
import { useApi } from '@/composables/useApi';
import { usePasswordToggle } from '@/composables/usePasswordToggle';
import AuthDivider from '@/components/auth/AuthDivider.vue';
import AuthSocialLogin from '@/components/auth/AuthSocialLogin.vue';
import IconEye from '@/components/icons/IconEye.vue';
import IconEyeOff from '@/components/icons/IconEyeOff.vue';
import IconCheckCircle from '@/components/icons/IconCheckCircle.vue';

import Logo from '@/components/Logo.vue';
import TButton from '@/components/TButton.vue';

/* eslint-disable no-undef */
definePageMeta({
  layout: 'auth',
});
/* eslint-enable no-undef */

// --- State Management ---
const router = useRouter();
const { register } = useAuth();
const api = useApi();

const form = ref({
  contact: '', // Unified field for email or phone
  first_name: '',
  last_name: '',
  password: '',
});

const verificationCode = ref('');
const isContactVerified = ref(false);
const verificationStep = ref('input'); // 'input', 'code', 'verified'

const loading = ref(false); // For final submission
const verificationLoading = ref(false); // For the "Verify" button
const codeVerificationLoading = ref(false); // For the "Verify Code" button

const serverErrors = ref(null);

// --- Computed Properties ---
const isContactInputDisabled = computed(() => isContactVerified.value || verificationStep.value === 'code');
const isFormDisabled = computed(() => !isContactVerified.value);

// --- Validation ---
const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

// --- API Handlers ---
const handleRequestVerification = async () => {
  serverErrors.value = null;
  if (!form.value.contact || !isEmail(form.value.contact)) {
    serverErrors.value = { contact: ['Please enter a valid email address.'] };
    return;
  }

  // --- Mocking successful verification request ---
  verificationLoading.value = true;
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  verificationStep.value = 'code';
  verificationLoading.value = false;
};

const handleVerifyCode = async () => {
  serverErrors.value = null;
  if (!verificationCode.value) return;

  // --- Mocking successful code verification ---
  codeVerificationLoading.value = true;
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
  isContactVerified.value = true;
  verificationStep.value = 'verified';
  codeVerificationLoading.value = false;
};

const handleResendCode = () => {
  // In a real app, this would call the verification request function again
  // For now, it can just be a placeholder or re-trigger the mock
  verificationCode.value = '';
  handleRequestVerification();
};

const handleSubmit = async () => {
  if (!isContactVerified.value) return;
  loading.value = true;
  serverErrors.value = null;

  try {
    const payload = { ...form.value, email: form.value.contact };
    delete payload.contact;

    await register(payload);
    router.push('/dashboard');
  } catch (error) {
    if (error.response && error.response._data && Array.isArray(error.response._data.errors)) {
      const flattenedErrors = error.response._data.errors.reduce((acc, cur) => ({ ...acc, ...cur }), {});
      serverErrors.value = flattenedErrors;
    } else {
      serverErrors.value = { general: 'An unexpected error occurred. Please try again.' };
    }
  } finally {
    loading.value = false;
  }
};

const { showPassword, togglePassword } = usePasswordToggle();
</script>

<template>
  <div class="form-card">
    <div class="logo-wrapper">
      <Logo size="medium" />
    </div>
    <h1>Create an account</h1>

    <form @submit.prevent="handleSubmit" class="register-form">
      <!-- Step 1: Contact Verification -->
      <div class="form-group">
        <label for="contact" class="contact-label">
          Email
          <IconCheckCircle v-if="isContactVerified" class="verified-icon" />
        </label>
        <div class="input-with-button">
          <input
            id="contact"
            type="email"
            v-model="form.contact"
            placeholder="Enter your email"
            :disabled="isContactInputDisabled"
            required
          />
          <TButton
            v-if="verificationStep === 'input'"
            type="button"
            :loading="verificationLoading"
            :disabled="!form.contact || isContactInputDisabled"
            text="Start Sign Up"
            @click="handleRequestVerification"
            class="verify-button"
          />
        </div>
        <small v-if="serverErrors && serverErrors.contact" class="error-text">
          {{ serverErrors.contact[0] }}
        </small>
      </div>

      <!-- Step 2: Code Input -->
      <div v-if="verificationStep === 'code'" class="form-group">
        <label for="code">Verification Code</label>
        <div class="input-with-button">
          <input
            id="code"
            type="text"
            v-model="verificationCode"
            placeholder="Enter code"
            required
          />
          <TButton
            type="button"
            :loading="codeVerificationLoading"
            :disabled="!verificationCode"
            text="Submit Code"
            @click="handleVerifyCode"
            class="verify-button"
          />
        </div>
        <div class="form-actions">
          <button type="button" @click="handleResendCode" class="link-button">Resend Code</button>
        </div>
        <small v-if="serverErrors && serverErrors.code" class="error-text">
          {{ serverErrors.code[0] }}
        </small>
      </div>

      <!-- Step 3: User Details (disabled until contact is verified) -->
      <fieldset v-if="isContactVerified" class="details-fieldset">
        <div class="form-row">
          <div class="form-group">
            <label for="first_name">First Name <span class="required-asterisk">*</span></label>
            <input
              id="first_name"
              type="text"
              v-model="form.first_name"
              placeholder="Enter your first name"
              required
            />
            <small v-if="serverErrors && serverErrors.first_name" class="error-text">
              {{ serverErrors.first_name[0] }}
            </small>
          </div>
          <div class="form-group">
            <label for="last_name">Last Name</label>
            <input
              id="last_name"
              type="text"
              v-model="form.last_name"
              placeholder="Enter your last name"
            />
            <small v-if="serverErrors && serverErrors.last_name" class="error-text">
              {{ serverErrors.last_name[0] }}
            </small>
          </div>
        </div>

        <div class="form-group">
          <label for="password">Password <span class="required-asterisk">*</span></label>
          <div class="password-wrapper">
            <input
              id="password"
              :type="showPassword ? 'text' : 'password'"
              v-model="form.password"
              placeholder="Enter your password"
              required
            />
            <button type="button" class="password-toggle" @click="togglePassword">
              <IconEyeOff v-if="showPassword" />
              <IconEye v-else />
            </button>
          </div>
          <small v-if="serverErrors && serverErrors.password" class="error-text">
            {{ serverErrors.password[0] }}
          </small>
        </div>
      </fieldset>

      <TButton
        v-if="isContactVerified"
        type="submit"
        :loading="loading"
        text="Sign Up"
        class="w-full"
      />
      <small v-if="serverErrors && serverErrors.general" class="error-text global-error">
        {{ serverErrors.general }}
      </small>


    </form>

    <AuthDivider />
    <AuthSocialLogin mode="signup" />

    <p class="login-link">
      Already have an account? <router-link to="/login">Login</router-link>
    </p>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/variables' as *;
@use '@/assets/scss/auth.scss';

.required-asterisk {
  color: $error-color;
  margin-left: 0.25rem;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;

  input {
    padding-right: 2.75rem; // Make space for the icon
  }

  .password-toggle {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    color: $text-muted;
    background: none;
    border: none;
    cursor: pointer;
  }
}

.contact-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.verified-icon {
  color: #28a745; // A green color for success
}

.form-actions {
  margin-top: 0.5rem;
  text-align: right;
}

.link-button {
  background: none;
  border: none;
  color: $primary;
  cursor: pointer;
  text-decoration: underline;
  font-size: $font-size-sm;
  padding: 0;

  &:hover {
    color: $primary-hover;
  }
}

.input-with-button {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  .verify-button {
    height: 44px; // Match input height
  }
}

.form-row {
  display: flex;
  gap: 1rem;

  .form-group {
    flex: 1;
  }
}

.details-fieldset {
  border: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  &:disabled {
    opacity: 0.5;
    pointer-events: none;
  }
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.global-error {
  text-align: center;
  margin-top: 1rem;
}

.form-row {
  display: flex;
  gap: 1.5rem;

  @media (max-width: 600px) {
    flex-direction: column;
    gap: 0.75rem;
  }
}

.global-copyright {
  text-align: center;
  padding: 1rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);

  @media (max-width: 639px) {
    display: none;
  }
}
</style>
