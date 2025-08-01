<script setup>
import TButton from '@/components/TButton.vue';
import GoogleIcon from '@/components/icons/GoogleIcon.vue';

const props = defineProps({
  mode: {
    type: String,
    default: 'login',
    validator: (value) => ['login', 'signup'].includes(value),
  },
});

const buttonText = {
  login: 'Sign in with Google',
  signup: 'Sign up with Google',
};
</script>

<template>
  <TButton type="button" variant="secondary" class="w-full btn-google">
    <template #left-icon>
      <GoogleIcon />
    </template>
    {{ buttonText[mode] }}
  </TButton>
</template>

<style lang="scss" scoped>
// The .btn-google style is global in auth.scss
</style>
