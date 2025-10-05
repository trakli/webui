<script setup>
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useApi } from '@/composables/useApi';
import Logo from '@/components/Logo.vue';

const route = useRoute();
const router = useRouter();
const api = useApi();
const stateCookie = useCookie('state');
const driver = route.params.driver;

const handleCallback = async (code) => {
  try {
    const response = await api(`/oauth/${driver}/callback`, {
      method: 'GET',
      query: { code, state: stateCookie.value }
    });

    if (response.data) {
      const userState = useState('auth.user');
      const tokenState = useState('auth.token');
      userState.value = response.data.user;
      tokenState.value = response.data.token;
      const userCookie = useCookie('auth.user', {
        serialize: JSON.stringify,
        deserialize: JSON.parse
      });
      const tokenCookie = useCookie('auth.token');
      userCookie.value = response.data.user;
      tokenCookie.value = response.data.token;

      router.push('/dashboard');
    }
  } catch (error) {
    console.error(`Failed to handle ${driver} callback:`, error);
    router.push(`/login?error=${driver}-login-failed`);
  }
};

onMounted(() => {
  const { code } = route.query;
  if (code) {
    handleCallback(code);
  } else {
    router.push(`/login?error=${driver}-login-failed`);
  }
});
</script>

<template>
  <div class="loading-container">
    <div class="loading-content">
      <Logo size="large" />
      <div class="spinner"></div>
      <p class="loading-text">Finalizing your login...</p>
    </div>
  </div>
</template>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f8faf9;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
}

.spinner {
  margin-top: 0.2rem;
  width: 40px;
  height: 40px;
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  margin-top: 0.2rem;
  font-size: 2rem;
  color: #4b5563;
}
</style>
