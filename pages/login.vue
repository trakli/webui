<script setup>
import { ref, watch } from 'vue';
import { useRouter } from '#imports';
import Logo from '@/components/Logo.vue';
import { usePasswordToggle } from '@/composables/usePasswordToggle';
import IconEye from '@/components/icons/IconEye.vue';
import IconEyeOff from '@/components/icons/IconEyeOff.vue';
import { useAuth } from '@/composables/useAuth';
import AuthDivider from '@/components/auth/AuthDivider.vue';
import AuthSocialLogin from '@/components/auth/AuthSocialLogin.vue';

/* eslint-disable no-undef */
definePageMeta({
  layout: 'auth',
});
/* eslint-enable no-undef */

const form = ref({
  email: '',
  password: '',
  remember: false,
});

const loading = ref(false);
const loginError = ref('');
const router = useRouter();
const { login } = useAuth();

watch(form, () => {
  if (loginError.value) {
    loginError.value = '';
  }
}, { deep: true });

const handleSubmit = async () => {
  loading.value = true;
  loginError.value = '';
  try {
    await login(form.value);
    router.push('/dashboard');
  } catch (error) {
    loginError.value = 'Invalid credentials. Please try again.';
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
    <h1>Login</h1>
    <form @submit.prevent="handleSubmit" class="login-form">
      <div v-if="loginError" class="error-feedback">
        {{ loginError }}
      </div>
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
            <IconEyeOff v-if="showPassword" />
            <IconEye v-else />
          </button>
        </div>
      </div>

      <div class="form-actions">
        <label class="remember-me">
          <input type="checkbox" v-model="form.remember" />
          Remember me
        </label>
        <a href="#" class="forgot-password">Forgot Password?</a>
      </div>

      <TButton type="submit" :loading="loading" text="Login" class="w-full" />

      <AuthDivider />
      <AuthSocialLogin mode="login" />
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

.error-feedback {
  background-color: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  margin-bottom: 1.5rem;
  text-align: center;
  font-size: 0.9rem;
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
