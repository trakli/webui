<script setup>
import LoginCard from '@/components/LoginCard.vue';
</script>

<template>
  <div class="login-container">
    <LoginCard />
  </div>
</template>

<style lang="scss" scoped>
.login-container {
  width: 100%;
  flex: 1;
  background-color: #ebedec;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px 0;
  overflow-y: hidden;
}
</style>
