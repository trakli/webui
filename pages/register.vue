<script setup>
import { ref, watch } from 'vue';
import { useState, useRouter } from '#imports';
import Logo from '@/components/Logo.vue';
import AuthCarousel from '@/components/auth/AuthCarousel.vue';
import { usePasswordToggle } from '@/composables/usePasswordToggle';
import { isValidPhoneNumber } from 'libphonenumber-js';

/* eslint-disable no-undef */
definePageMeta({
  layout: 'auth'
});
/* eslint-enable no-undef */

const form = ref({
  email: '',
  username: '',
  firstName: '',
  lastName: '',
  phone: '',
  password: ''
});

const formErrors = ref({
  email: '',
  username: '',
  firstName: '',
  lastName: '',
  phone: '',
  password: ''
});

const phoneError = ref(false);
const user = useState('user');
const router = useRouter();

watch(
  () => form.value.phone,
  (newVal) => {
    if (newVal) {
      phoneError.value = !isValidPhoneNumber(newVal, 'CM');
    } else {
      phoneError.value = false;
    }
  }
);

const validateForm = () => {
  let isValid = true;

  // Reset errors
  Object.keys(formErrors.value).forEach((key) => (formErrors.value[key] = ''));

  // Email validation
  if (!form.value.email) {
    formErrors.value.email = 'Email is required';
    isValid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
    formErrors.value.email = 'Invalid email format';
    isValid = false;
  }

  // Username validation
  if (!form.value.username) {
    formErrors.value.username = 'Username is required';
    isValid = false;
  } else if (form.value.username.length < 3) {
    formErrors.value.username = 'Username must be at least 3 characters';
    isValid = false;
  }

  // Name validation
  if (!form.value.firstName) {
    formErrors.value.firstName = 'First name is required';
    isValid = false;
  }
  if (!form.value.lastName) {
    formErrors.value.lastName = 'Last name is required';
    isValid = false;
  }

  // Phone validation
  if (!form.value.phone) {
    formErrors.value.phone = 'Phone number is required';
    isValid = false;
  } else if (!isValidPhoneNumber(form.value.phone, 'CM')) {
    formErrors.value.phone = 'Invalid phone number format';
    isValid = false;
  }

  // Password validation
  if (!form.value.password) {
    formErrors.value.password = 'Password is required';
    isValid = false;
  } else if (form.value.password.length < 8) {
    formErrors.value.password = 'Password must be at least 8 characters';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = () => {
  if (validateForm()) {
    // Proceed with form submission
    console.log('Form submitted:', form.value);
    if (phoneError.value) {
      return;
    }
    user.value = { ...form.value };
    router.push('/login');
  }
};

const { showPassword, togglePassword } = usePasswordToggle();
</script>

<template>
  <div class="page-wrapper">
    <div class="floating-docs-pattern"></div>

    <div class="register-container">
      <AuthCarousel />
      <div class="register-form-container">
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
                <input type="text" v-model="form.username" placeholder="Choose Username" required />
                <small v-if="formErrors.username" class="error-text">{{
                  formErrors.username
                }}</small>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  v-model="form.firstName"
                  placeholder="Enter First Name"
                  required
                />
                <small v-if="formErrors.firstName" class="error-text">{{
                  formErrors.firstName
                }}</small>
              </div>
              <div class="form-group">
                <label>Last Name</label>
                <input type="text" v-model="form.lastName" placeholder="Enter Last Name" required />
                <small v-if="formErrors.lastName" class="error-text">{{
                  formErrors.lastName
                }}</small>
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
                    <svg
                      v-if="!showPassword"
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <svg
                      v-else
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    >
                      <path
                        d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"
                      />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  </button>
                </div>
                <small v-if="formErrors.password" class="error-text">{{
                  formErrors.password
                }}</small>
              </div>
            </div>

            <button type="submit" class="submit-button">Sign Up</button>
            <div class="divider">
              <span class="line"></span>
            </div>
          </form>

          <p class="login-link">
            Already have an account? <nuxt-link to="/login">Log In</nuxt-link>
          </p>
        </div>
      </div>
    </div>
    <div class="global-copyright">© {{ new Date().getFullYear() }} Trakli. All Right Reserved</div>
  </div>
</template>

<style lang="scss" scoped>
@use 'sass:color';
@use '@/assets/scss/_variables.scss' as *;

.page-wrapper {
  min-height: 100vh;
  position: relative;
  background: $primary-color;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.floating-docs-pattern {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('/SidebarImage.svg') no-repeat center;
  background-size: cover;
  opacity: 0.1;
}

.register-container {
  position: relative;
  min-height: 100vh;
  display: flex;
  max-width: 1440px;
  margin: 0 auto;
  padding: 2rem;

  @media (max-width: 1024px) {
    padding: 1.5rem;
    flex-direction: column;
  }

  @media (max-width: 768px) {
    padding: 1rem;

    .register-sidebar {
      display: none; // Hide sidebar on mobile
    }

    .register-form-container {
      padding: 1rem;

      .form-card {
        padding: 2rem;
        margin-top: 1rem;
        min-height: auto;
      }

      .form-row {
        flex-direction: column;
        gap: 1rem;
      }
    }
  }
}

.register-form-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.form-card {
  width: 100%;
  max-width: 620px;
  background-color: #fff;
  padding: 3rem;
  border-radius: 1rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.logo-wrapper {
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 2rem;
  color: #333;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-row {
  display: flex;
  gap: 1.5rem;
}

@media (max-width: 600px) {
  .form-row {
    flex-direction: column;
    gap: 0.75rem;
  }
}

.form-group {
  flex: 1;
  text-align: left;

  label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 600;
    color: #555;
  }

  input {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 1px solid #ddd;
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: border-color 0.3s;

    &:focus {
      outline: none;
      border-color: $primary-color;
    }
  }

  .error-text {
    color: #dc2626;
    font-size: 0.75rem;
    margin-top: 0.25rem;
  }

  input.has-error {
    border-color: #dc2626;

    &:focus {
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
    }
  }
}

.password-input {
  position: relative;

  input {
    padding-right: 3rem;
  }

  .password-toggle {
    position: absolute;
    top: 50%;
    right: 0.75rem;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    color: #888;
  }
}

.submit-button {
  width: 100%;
  padding: 1rem;
  background-color: $primary-color;
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: color.adjust($primary-color, $lightness: -10%);
  }
}

.divider {
  display: flex;
  align-items: center;
  text-align: center;
  margin: 1.5rem 0;

  .line {
    flex-grow: 1;
    border-bottom: 1px solid #ddd;
  }
}

.login-link {
  margin-top: 1rem;

  a {
    color: $primary-color;
    font-weight: 600;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}

.global-copyright {
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
}
</style>
