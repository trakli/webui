<script setup>
import { ref, watch } from 'vue';
import { useRouter } from '#imports';
import Logo from '@/components/Logo.vue';
import { usePasswordToggle } from '@/composables/usePasswordToggle';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { Eye, EyeOff } from 'lucide-vue-next';
import { useAuth } from '@/composables/useAuth';

/* eslint-disable no-undef */
definePageMeta({
  layout: 'auth',
});
/* eslint-enable no-undef */

const form = ref({
  email: '',
  username: '',
  first_name: '',
  last_name: '',
  phone: '',
  password: '',
});

const formErrors = ref({
  email: '',
  username: '',
  first_name: '',
  last_name: '',
  phone: '',
  password: '',
});

const phoneError = ref(false);
const router = useRouter();
const { register } = useAuth();

watch(
  () => form.value.phone,
  (newVal) => {
    if (newVal) {
      phoneError.value = !isValidPhoneNumber(newVal);
    } else {
      phoneError.value = false;
    }
  }
);

const validateForm = () => {
  let isValid = true;

  // Reset errors
  Object.keys(formErrors.value).forEach((key) => (formErrors.value[key] = ''));

  // Basic client-side validation
  if (!form.value.email) {
    formErrors.value.email = 'Email is required';
    isValid = false;
  }
  if (!form.value.first_name) {
    formErrors.value.first_name = 'First name is required';
    isValid = false;
  }
  if (!form.value.password) {
    formErrors.value.password = 'Password is required';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = async () => {
  if (validateForm()) {
    try {
      await register(form.value);
      router.push('/login');
    } catch (error) {
      alert('Registration failed. Please check your details and try again.');
    }
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
      <div class="form-row">
        <div class="form-group">
          <label>Email</label>
          <input type="email" v-model="form.email" placeholder="myemail@gmail.com" required />
          <small v-if="formErrors.email" class="error-text">{{ formErrors.email }}</small>
        </div>
        <div class="form-group">
          <label>Username</label>
          <input type="text" v-model="form.username" placeholder="johndoe" required />
          <small v-if="formErrors.username" class="error-text">
            {{ formErrors.username }}
          </small>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>First Name</label>
          <input type="text" v-model="form.firstName" placeholder="Enter First Name" required />
          <small v-if="formErrors.firstName" class="error-text">
            {{ formErrors.firstName }}
          </small>
        </div>
        <div class="form-group">
          <label>Last Name</label>
          <input type="text" v-model="form.lastName" placeholder="Enter Last Name" required />
          <small v-if="formErrors.lastName" class="error-text">
            {{ formErrors.lastName }}
          </small>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Phone Number</label>
          <input type="tel" v-model="form.phone" placeholder="+237 674 845 657" required />
          <small v-if="phoneError" class="error-text">Wrong Phone Number!</small>
          <small v-if="formErrors.phone" class="error-text">{{ formErrors.phone }}</small>
        </div>
        <div class="form-group">
          <label>Password</label>
          <div class="password-input">
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="form.password"
              placeholder="Enter a Password"
              required
            />
            <button type="button" class="password-toggle" @click="togglePassword">
              <EyeOff v-if="showPassword" :size="20" />
              <Eye v-else :size="20" />
            </button>
          </div>
          <small v-if="formErrors.password" class="error-text">
            {{ formErrors.password }}
          </small>
        </div>
      </div>

      <button type="submit" class="submit-button">Sign Up</button>
      <div class="divider">
        <span class="line"></span>
      </div>
    </form>

    <p class="login-link">
      Already have an account?
      <nuxt-link to="/login">Log In</nuxt-link>
    </p>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/auth.scss';

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
