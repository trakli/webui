<template>
  <div class="auth-footer-link">
    {{ text }} <a :href="to">{{ linkText }}</a>
  </div>
</template>

<script setup>
defineProps({
  text: {
    type: String,
    required: true
  },
  linkText: {
    type: String,
    required: true
  },
  to: {
    type: String,
    required: true
  }
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.auth-footer-link {
  text-align: center;
  font-size: $font-size-sm;
  margin-top: $spacing-6;
  padding-top: $spacing-5;
  border-top: 1px solid $border-light;
  color: $text-secondary;

  a {
    color: $primary;
    font-weight: $font-semibold;
    text-decoration: none;
    margin-left: $spacing-1;
    transition: $transition-base;

    &:hover {
      text-decoration: underline;
      color: $primary-hover;
    }
  }
}
</style>
