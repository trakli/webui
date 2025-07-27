<script setup>
<<<<<<< HEAD
import { ref } from 'vue';
import { useRouter, useState } from '#imports';
import Logo from '@/components/Logo.vue';
import AuthLayout from '@/components/auth/AuthLayout.vue';
import { Eye, EyeOff } from 'lucide-vue-next';
import { usePasswordToggle } from '@/composables/usePasswordToggle';

// Import definePageMeta
import { definePageMeta } from '#app';
=======
import { ref, watch } from 'vue';
import { useState, useRouter } from '#imports';
import Logo from '@/components/Logo.vue';
import { usePasswordToggle } from '@/composables/usePasswordToggle';
import { isValidPhoneNumber } from 'libphonenumber-js';
import { Eye, EyeOff } from 'lucide-vue-next';
>>>>>>> origin/main

definePageMeta({
  layout: 'auth'
});
<<<<<<< HEAD
=======
/* eslint-enable no-undef */
>>>>>>> origin/main

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

<<<<<<< HEAD
const user = useState('user');
const router = useRouter();
const { showPassword, togglePassword } = usePasswordToggle();
=======
const phoneError = ref(false);
const user = useState('user');
const router = useRouter();

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
>>>>>>> origin/main

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
<<<<<<< HEAD
=======
  } else if (!isValidPhoneNumber(form.value.phone)) {
    formErrors.value.phone = 'Invalid phone number format';
    isValid = false;
>>>>>>> origin/main
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
<<<<<<< HEAD
    user.value = { ...form.value };
    router.push('/dashboard');
  }
};
</script>

<template>
  <AuthLayout>
    <div class="form-card">
      <div class="logo-wrapper">
        <Logo size="medium" />
      </div>

      <h1>Create an Account</h1>

      <form @submit.prevent="handleSubmit" class="register-form">
        <div class="form-row">
          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              v-model="form.email"
              placeholder="myemail@gmail.com"
              :class="{ 'has-error': formErrors.email }"
              required
            />
            <small v-if="formErrors.email" class="error-text">{{ formErrors.email }}</small>
          </div>
          <div class="form-group">
            <label>Username</label>
            <input
              type="text"
              v-model="form.username"
              placeholder="Choose Username"
              :class="{ 'has-error': formErrors.username }"
              required
            />
            <small v-if="formErrors.username" class="error-text">{{ formErrors.username }}</small>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>First Name</label>
            <input
              type="text"
              v-model="form.firstName"
              placeholder="Enter First Name"
              :class="{ 'has-error': formErrors.firstName }"
              required
            />
            <small v-if="formErrors.firstName" class="error-text">{{ formErrors.firstName }}</small>
          </div>
          <div class="form-group">
            <label>Last Name</label>
            <input
              type="text"
              v-model="form.lastName"
              placeholder="Enter Last Name"
              :class="{ 'has-error': formErrors.lastName }"
              required
            />
            <small v-if="formErrors.lastName" class="error-text">{{ formErrors.lastName }}</small>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              v-model="form.phone"
              placeholder="+237 674 845 657"
              :class="{ 'has-error': formErrors.phone }"
              required
            />
            <small v-if="formErrors.phone" class="error-text">{{ formErrors.phone }}</small>
          </div>
          <div class="form-group">
            <label>Password</label>
            <div class="password-input">
              <input
                :type="showPassword ? 'text' : 'password'"
                v-model="form.password"
                placeholder="Enter a Password"
                :class="{ 'has-error': formErrors.password }"
                required
              />
              <button type="button" class="password-toggle" @click="togglePassword">
                <component :is="showPassword ? EyeOff : Eye" :size="20" />
              </button>
            </div>
            <small v-if="formErrors.password" class="error-text">{{ formErrors.password }}</small>
          </div>
        </div>

        <button type="submit" class="submit-button">Register</button>

        <div class="divider">
          <span class="line"></span>
        </div>
      </form>

      <p class="login-link">
        Already have an account?
        <nuxt-link to="/login">Login</nuxt-link>
      </p>
    </div>
  </AuthLayout>
</template>

<style scoped lang="scss">
@use 'sass:color';
@use '@/assets/_variables.scss' as *;

.form-card {
  width: 100%;
  max-width: 620px;
  background-color: $bg-white;
  padding: 3rem;
  border-radius: 1rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  text-align: center;

  @media (max-width: 1023px) {
    padding: 2rem;
    border-radius: 0.75rem;
    box-shadow: none;
  }

  @media (max-width: 639px) {
    padding: 1.5rem;
    border-radius: 0.5rem;
  }
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

  @media (max-width: 600px) {
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

    &.has-error {
      border-color: #dc2626;
      box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2);

      &:focus {
        box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.3);
      }
    }
  }

  .error-text {
    color: #dc2626;
    font-size: 0.75rem;
    margin-top: 0.25rem;
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
=======
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
>>>>>>> origin/main
</style>
