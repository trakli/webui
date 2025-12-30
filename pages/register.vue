<script setup>
import { ref, computed, nextTick } from 'vue';
import { useAuth } from '@/composables/useAuth';
import { useApi } from '@/composables/useApi';
import { usePasswordToggle } from '@/composables/usePasswordToggle';
import AuthDivider from '@/components/auth/AuthDivider.vue';
import AuthSocialLogin from '@/components/auth/AuthSocialLogin.vue';
import { Eye, EyeOff, CheckCircle } from 'lucide-vue-next';

import Logo from '@/components/Logo.vue';
import TButton from '@/components/TButton.vue';

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
});

const { register } = useAuth();
const api = useApi();

const form = ref({
  contact: '',
  first_name: '',
  last_name: '',
  password: ''
});

const verificationCode = ref('');
const isContactVerified = ref(false);
const verificationStep = ref('input');

const loading = ref(false);
const verificationLoading = ref(false);
const codeVerificationLoading = ref(false);

const serverErrors = ref(null);

const isContactInputDisabled = computed(
  () => isContactVerified.value || verificationStep.value === 'code'
);

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const handleRequestVerification = async () => {
  serverErrors.value = null;
  if (!form.value.contact || !isEmail(form.value.contact)) {
    serverErrors.value = { contact: ['Please enter a valid email address.'] };
    return;
  }

  verificationLoading.value = true;
  try {
    await api('/send-verification-code', {
      method: 'POST',
      body: {
        contact: form.value.contact,
        type: 'email',
        purpose: 'registration'
      }
    });
    verificationStep.value = 'code';
  } catch (error) {
    if (error.response && error.response._data && error.response._data.errors) {
      serverErrors.value = error.response._data.errors;
    } else {
      serverErrors.value = {
        contact: [
          error.response?._data?.message || 'Failed to send verification code. Please try again.'
        ]
      };
    }
  } finally {
    verificationLoading.value = false;
  }
};

const handleVerifyCode = async () => {
  serverErrors.value = null;
  if (!verificationCode.value) return;

  codeVerificationLoading.value = true;
  try {
    await api('/verify-code', {
      method: 'POST',
      body: {
        contact: form.value.contact,
        code: verificationCode.value,
        type: 'email',
        purpose: 'registration'
      }
    });
    isContactVerified.value = true;
    verificationStep.value = 'verified';
  } catch (error) {
    if (error.response && error.response._data && error.response._data.message) {
      serverErrors.value = { code: [error.response._data.message] };
    } else {
      serverErrors.value = { code: ['Invalid verification code. Please try again.'] };
    }
  } finally {
    codeVerificationLoading.value = false;
  }
};

const handleResendCode = async () => {
  verificationCode.value = '';
  await handleRequestVerification();
};

const handleSubmit = async () => {
  if (!isContactVerified.value) return;
  loading.value = true;
  serverErrors.value = null;

  try {
    const payload = {
      ...form.value,
      email: form.value.contact
    };
    delete payload.contact;

    await register(payload);
    await nextTick();
    await navigateTo('/onboarding');
  } catch (error) {
    if (error.response && error.response._data && Array.isArray(error.response._data.errors)) {
      const flattenedErrors = error.response._data.errors.reduce(
        (acc, cur) => ({ ...acc, ...cur }),
        {}
      );
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

    <form class="register-form" @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="contact" class="contact-label">
          Email
          <CheckCircle v-if="isContactVerified" class="verified-icon w-5 h-5" />
        </label>
        <div class="input-with-button">
          <input
            id="contact"
            v-model="form.contact"
            type="email"
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
            class="verify-button"
            @click="handleRequestVerification"
          />
        </div>
        <small v-if="serverErrors && serverErrors.contact" class="error-text">
          {{ serverErrors.contact[0] }}
        </small>
      </div>

      <div v-if="verificationStep === 'code'" class="form-group">
        <label for="code">Verification Code</label>
        <div class="input-with-button">
          <input
            id="code"
            v-model="verificationCode"
            type="text"
            placeholder="Enter code"
            required
          />
          <TButton
            type="button"
            :loading="codeVerificationLoading"
            :disabled="!verificationCode"
            text="Submit Code"
            class="verify-button"
            @click="handleVerifyCode"
          />
        </div>
        <div class="form-actions">
          <button type="button" class="link-button" @click="handleResendCode">Resend Code</button>
        </div>
        <small v-if="serverErrors && serverErrors.code" class="error-text">
          {{ serverErrors.code[0] }}
        </small>
      </div>

      <fieldset v-if="isContactVerified" class="details-fieldset">
        <div class="form-row">
          <div class="form-group">
            <label for="first_name">First Name <span class="required-asterisk">*</span></label>
            <input
              id="first_name"
              v-model="form.first_name"
              type="text"
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
              v-model="form.last_name"
              type="text"
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
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              required
            />
            <button type="button" class="password-toggle" @click="togglePassword">
              <EyeOff v-if="showPassword" class="w-5 h-5" />
              <Eye v-else class="w-5 h-5" />
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

    <p class="login-link">Already have an account? <router-link to="/login">Login</router-link></p>
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
    padding-right: 2.75rem;
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
