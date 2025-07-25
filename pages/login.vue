
<script setup>
definePageMeta({
  layout: 'auth'
});

import { ref } from 'vue';
import { useRouter, useState } from '#imports';
import Logo from '@/components/Logo.vue';
import AuthLayout from '@/components/auth/AuthLayout.vue';
import { usePasswordToggle } from '@/composables/usePasswordToggle';
import { Eye, EyeOff } from 'lucide-vue-next';

const form = ref({
  email: '',
  password: ''
});

const user = useState('user', () => null);
const router = useRouter();
const { showPassword, togglePassword } = usePasswordToggle();

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
</script>

<template>
  <AuthLayout>
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
            <button type="button" class="password-toggle" @click="togglePassword">
              <component :is="showPassword ? EyeOff : Eye" :size="20" />
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
  </AuthLayout>
</template>

<style scoped lang="scss">
@use 'sass:color';
@use '@/assets/_variables.scss' as *;

.form-card {
  width: 100%;
  max-width: 420px;
  background-color: #fff;
  padding: 1.5rem 2rem;
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
  margin-bottom: 1.1rem;
}

h1 {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1.1rem;
  color: #333;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: .75rem;
}

.form-group {
  text-align: left;
label {
  display: block;
  margin-bottom: 0.3rem;
  font-weight: 600;
  color: #555;
}

input {
  width: 100%;
  padding: .7rem .75rem;
  border: 1px solid #ddd;
  border-radius: 0.5rem;
  font-size: 1rem;

  &:focus {
    outline: none;
    border-color: $primary-color;
    }
  }
}

.password-input {
  position: relative;

  input {
    padding-right: 2.5rem;
  }

  .password-toggle {
    position: absolute;
    top: 50%;
    right: 0.75rem;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #888;
    cursor: pointer;
  }
}

.form-actions {
  display: flex;
  justify-content: space-between;
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
  padding: .75rem;
  background: $primary-color;
  color: white;
  font-size: 1.1rem;
  font-weight: bold;
  border: none;
  border-radius: 0.5rem;

  &:hover {
    background-color: color.adjust($primary-color, $lightness: -10%);
  }
}

.signup-link {
  margin-top: .60rem;

  a {
    color: $primary-color;
    font-weight: 600;

    &:hover {
      text-decoration: underline;
    }
  }
}

.divider {
  margin: .65rem ;

  .line {
    border-bottom: 1px solid #ddd;
    display: block;
  }
}
</style>
