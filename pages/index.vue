<script setup>
import { useRouter } from 'vue-router';
import { onMounted } from 'vue';
import Logo from '@/components/Logo.vue';
import { useAuth } from '@/composables/useAuth';
import { resolveLandingPath } from '@/composables/useLanding';

const router = useRouter();
const { isAuthenticated } = useAuth();

onMounted(async () => {
  // Authenticated users go to their chosen landing (chat-first by default);
  // everyone else goes to login.
  if (isAuthenticated.value) {
    router.replace(await resolveLandingPath());
  } else {
    router.replace('/login');
  }
});
</script>

<template>
  <div class="loading-container">
    <div class="loading-content">
      <Logo size="large" />
      <div class="spinner" />
      <p class="loading-text">Loading Trakli...</p>
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

.logo {
  width: 180px;
  height: auto;
  margin-bottom: 2rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(4, 120, 68, 0.2);
  border-radius: 50%;
  border-top-color: #047844;
  animation: spin 1s ease-in-out infinite;
  margin-bottom: 1.5rem;
}

.loading-text {
  color: #047844;
  font-size: 1.125rem;
  font-weight: 500;
  margin: 0;
  letter-spacing: 0.025em;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
