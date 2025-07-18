<script setup>
import { ref } from 'vue';
import { useState, useRouter } from '#imports';
import Logo from '@/components/Logo.vue';
import { usePasswordToggle } from '@/composables/usePasswordToggle';
import { Eye, EyeOff } from 'lucide-vue-next';

/* eslint-disable no-undef */
definePageMeta({
  layout: 'auth'
});
/* eslint-enable no-undef */

const form = ref({
  email: '',
  password: ''
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
  <div class="form-card">
    <div class="logo-wrapper">
      <Logo size="medium" />
    </div>

    <h1>Welcome Back</h1>

    <form @submit.prevent="handleSubmit" class="login-form">
      <div class="form-group">
        <label>Email</label>
        <input type="email" v-model="form.email" placeholder="Enter your email" required />
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
            <!-- Eye Icon -->
            <EyeOff v-if="showPassword" :size="20" />
            <Eye v-else :size="20" />
          </button>
        </div>
      </div>

      <div class="form-actions">
        <label class="remember-me">
          <input type="checkbox" />
          Remember me
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
</template>

<style lang="scss" scoped>
@use '@/assets/scss/auth.scss';
@use '@/assets/scss/_variables.scss' as *;

.form-card {
  max-width: 520px;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
    color: $primary;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
}
</style>
