<script setup>
import { computed } from 'vue';
import { useCookie, useHead, clearError } from 'nuxt/app';
import { AlertTriangle } from 'lucide-vue-next';
import { HomeIcon } from '@heroicons/vue/24/outline';

const props = defineProps({
  error: Object
});

const token = useCookie('token');

const layout = computed(() => {
  return token.value ? 'dashboard' : 'auth';
});

useHead({
  title: `Error ${props.error.statusCode}`
});

const handleError = () => {
  if (token.value) {
    clearError({ redirect: '/dashboard' });
  } else {
    clearError({ redirect: '/login' });
  }
};
</script>

<template>
  <div>
    <NuxtLayout :name="layout">
      <div class="error-container">
        <TCard class="error-card">
          <div class="error-content">
            <AlertTriangle class="error-icon" />
            <h1 class="error-title">Error {{ error.statusCode }}</h1>
            <p class="error-message">{{ error.message || 'Something went wrong' }}</p>
            <TButton class="error-button" @click="handleError">
              <template #left-icon>
                <HomeIcon />
              </template>
              Go to Homepage
            </TButton>
          </div>
        </TCard>
      </div>
    </NuxtLayout>
  </div>
</template>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  padding: $spacing-8;
}

.error-card {
  width: 100%;
  max-width: 400px;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $spacing-8;
  text-align: center;
}

.error-icon {
  width: 8rem; // 128px
  height: 8rem; // 128px
  color: $error-color;
  animation: pulse-red 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

.error-title {
  margin-top: $spacing-4;
  font-size: 2.25rem; // 36px
  font-weight: $font-bold;
  color: $text-secondary;
}

.error-message {
  margin-top: $spacing-2;
  font-size: $font-size-xl;
  color: $text-muted;
}

.error-button {
  margin-top: $spacing-6;
}

@keyframes pulse-red {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
}
</style>
