<script setup>
import { ref, onMounted, onUnmounted} from 'vue';
import { useState, useRouter } from '#imports';
import Logo from '@/components/Logo.vue';
import AuthCarousel from '@/components/auth/AuthCarousel.vue';
import { usePasswordToggle } from '@/composables/usePasswordToggle';

/* eslint-disable no-undef */
definePageMeta({
  layout: 'auth'
});
/* eslint-enable no-undef */

const form = ref({
  email: '',
  password: ''
});

const screenWidth = ref(window.innerWidth);

const updateScreenWidth = () => {
  screenWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', updateScreenWidth);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateScreenWidth);
});

const user = useState('user', () => null);
const router = useRouter();

const handleSubmit = () => {
  if (
    user.value &&
    user.value.email === form.value.email &&
    user.value.password === form.value.password
  ) {
    router.push('/dashboard');
  } else {
    alert('Invalid credentials or no user registered.');
  }
};

const { showPassword, togglePassword } = usePasswordToggle();
</script>

<template>
  <div class="page-wrapper">
    <!-- Background floating pattern -->
    <div class="floating-docs-pattern"></div>

    <!-- Responsive container with conditional layout classes -->
    <div
      class="login-container"
      :class="{
        'layout-mobile': screenWidth < 640,
        'layout-tablet': screenWidth >= 640 && screenWidth < 1024,
        'layout-desktop': screenWidth >= 1024
      }"
    >
      <!-- Show AuthCarousel only on desktops and laptops -->
      <AuthCarousel v-if="screenWidth >= 1024" />

      <!-- Login Form Section -->
      <div class="login-form-container">
        <div class="form-card">
          <div class="logo-wrapper">
            <Logo size="medium" />
          </div>

          <h1>Welcome Back</h1>

          <form @submit.prevent="handleSubmit" class="login-form">
            <div class="form-group">
              <label>Email</label>
              <input
                type="email"
                v-model="form.email"
                placeholder="Enter your email"
                required
              />
            </div>

            <div class="form-group">
              <label>Password</label>
              <div class="password-input">
                <input
                  :type="showPassword ? 'text' : 'password'"
                  v-model="form.password"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  class="password-toggle"
                  @click="togglePassword"
                >
                  <!-- Eye Icon -->
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
                  <!-- Eye-Off Icon -->
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
            </div>

            <div class="form-actions">
              <label class="remember-me">
                <input type="checkbox" /> Remember me
              </label>
              <a href="#" class="forgot-password">Forgot Password?</a>
            </div>

            <button type="submit" class="submit-button">Login</button>

            <div class="divider">
              <span class="line"></span>
            </div>
          </form>

          <p class="signup-link">
            Don't have an account?
            <nuxt-link to="/register">Sign Up</nuxt-link>
          </p>
        </div>
      </div>
    </div>

    <!-- Show footer on tablets and larger screens -->
    <div v-if="screenWidth >= 640" class="global-footer">
      © {{ new Date().getFullYear() }} Trakli. All Right Reserved
    </div>
  </div>
</template>


<style lang="scss" scoped>
@use 'sass:color';
@use '@/assets/scss/_variables.scss' as *;

.page-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: $primary-color;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
  padding: 0;
}

.floating-docs-pattern {
  position: absolute;
  inset: 0;
  background: url('/SidebarImage.svg') no-repeat center;
  background-size: cover;
  opacity: 0.1;
  z-index: 0;
}

.login-container {
  display: flex;
  max-width: 1440px;
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  flex: 1;
  position: relative;
  z-index: 1;
  gap: 2rem;

  &.layout-mobile,
  &.layout-tablet {
    flex-direction: column;
    padding: 1.5rem 1rem;
    gap: 1.5rem;
  }

  &.layout-mobile {
    padding: 1rem 0.75rem;
  }
}

.login-form-container {
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

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
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

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;

  .remember-me {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .forgot-password {
    color: $primary-color;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
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

.signup-link {
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

.global-footer {
  text-align: center;
  padding: 1rem;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  z-index: 2;

  @media (max-width: 639px) {
    display: none;
  }
}


</style>
