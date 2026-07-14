<template>
  <div class="admin-root">
    <slot />
    <NotificationsContainer />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import NotificationsContainer from '@/components/NotificationsContainer.vue';
import { useAuth } from '@/composables/useAuth';

const { user, fetchUser } = useAuth();

onMounted(() => {
  if (!user.value) {
    fetchUser();
  }
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.admin-root {
  min-height: 100vh;
  background: $bg-gray;
}
</style>
