<script setup>
import { useRoute } from 'vue-router';
import { computed } from 'vue';
const route = useRoute();

const footerClass = computed(() => {
  if (route.path === '/login') {
    return 'footer-login';
  } else if (route.path === '/register') {
    return 'footer-register';
  }
  return 'footer-default';
});
</script>

<template>
  <footer :class="footerClass">
    <div class="container">
      <div class="copyright">© 2024 Trakli, All Right Reserved</div>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
footer {
  width: 100%;
  flex-shrink: 0;

  &.footer-login {
    background-color: #ebedec;
  }

  &.footer-register {
    background-color: white;
    margin-left: 400px;
  }

  &.footer-default {
    background-color: white;
  }

  .container {
    margin-left: auto;
    margin-right: auto;

    .copyright {
      text-align: center;
      color: #000000;
      font-size: 16px;
      padding: 12px 0;
      margin: 0;
    }
  }
}
</style>
