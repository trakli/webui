<script setup>
import TButton from '@/components/TButton.vue';
import GoogleIcon from '@/components/icons/GoogleIcon.vue';
import { useApi } from '@/composables/useApi';

const props = defineProps({
  mode: {
    type: String,
    default: 'login',
    validator: (value) => ['login', 'signup'].includes(value)
  }
});

const buttonText = {
  login: 'Sign in with Google',
  signup: 'Sign up with Google'
};

const api = useApi();
const state = useCookie('state');

const handleGoogleLogin = async () => {
  try {
    const newState = Math.random().toString(36).substring(2);
    state.value = newState;

    const response = await api('oauth/google/login', {
      method: 'GET',
      query: { state: newState }
    });
    if (response.data.url) {
      window.location.href = response.data.url;
    }
  } catch (error) {
    console.error('Failed to get Google redirect URL', error);
  }
};
</script>

<template>
  <TButton type="button" variant="secondary" class="w-full btn-google" @click="handleGoogleLogin">
    <template #left-icon>
      <GoogleIcon />
    </template>
    {{ buttonText[mode] }}
  </TButton>
</template>

<style lang="scss" scoped>
// The .btn-google style is global in auth.scss
</style>
