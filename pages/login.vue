<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from '#imports';
import Logo from '@/components/Logo.vue';
import { usePasswordToggle } from '@/composables/usePasswordToggle';
import { Eye, EyeOff } from 'lucide-vue-next';
import { useAuth } from '@/composables/useAuth';
import AuthDivider from '@/components/auth/AuthDivider.vue';
import AuthSocialLogin from '@/components/auth/AuthSocialLogin.vue';
import { CONFIGURATION_KEYS } from '@/utils/configurationKeys';

const { t } = useI18n();

definePageMeta({
  layout: 'auth',
  middleware: 'guest'
});

const form = ref({
  email: '',
  password: '',
  remember: false
});

const loading = ref(false);
const loginError = ref('');
const router = useRouter();
const route = useRoute();
const { login } = useAuth();
const sharedData = useSharedData();

watch(
  form,
  () => {
    if (loginError.value) {
      loginError.value = '';
    }
  },
  { deep: true }
);

const handleSubmit = async () => {
  loading.value = true;
  loginError.value = '';
  // First attempt login
  try {
    await login(form.value);
  } catch {
    loginError.value = t('Invalid credentials. Please try again.');
    loading.value = false;
    return;
  }

  // Login succeeded – now check onboarding status (errors here should not affect login error)
  let isOnboardingComplete = false;
  try {
    const configs = await sharedData.loadConfigurations();
    isOnboardingComplete = !!configs?.[CONFIGURATION_KEYS.ONBOARDING_COMPLETE];
  } catch (e) {
    console.warn('Failed to load onboarding config', e);
  }

  router.push(isOnboardingComplete ? '/dashboard' : '/onboarding');
  loading.value = false;
};

const { showPassword, togglePassword } = usePasswordToggle();

onMounted(() => {
  if (route.query.error) {
    loginError.value = t('The social login failed. Please try again.');
  }
});
</script>

<template>
  <div class="form-card">
    <div class="logo-wrapper">
      <Logo size="medium" />
    </div>
    <h1>{{ t('Login') }}</h1>
    <form class="login-form" @submit.prevent="handleSubmit">
      <div v-if="loginError" class="error-feedback">
        {{ loginError }}
      </div>
      <div class="form-group">
        <label>{{ t('Email') }}</label>
        <input v-model="form.email" type="email" :placeholder="t('Enter your email')" required />
      </div>

      <div class="form-group">
        <label>{{ t('Password') }}</label>
        <div class="password-input">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            :placeholder="t('Enter your password')"
            required
          />
          <button type="button" class="password-toggle" @click="togglePassword">
            <EyeOff v-if="showPassword" class="w-5 h-5" />
            <Eye v-else class="w-5 h-5" />
          </button>
        </div>
      </div>

      <div class="form-actions">
        <label class="remember-me">
          <input v-model="form.remember" type="checkbox" />
          {{ t('Remember me') }}
        </label>
        <a href="#" class="forgot-password">{{ t('Forgot Password?') }}</a>
      </div>

      <TButton type="submit" :loading="loading" :text="t('Login')" class="w-full" />

      <AuthDivider />
      <AuthSocialLogin mode="login" />
    </form>

    <p class="signup-link">
      {{ t("Don't have an account?") }}
      <nuxt-link to="/register">{{ t('Sign up') }}</nuxt-link>
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
