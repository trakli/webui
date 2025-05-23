<template>
  <footer class="footer" :class="{ 'no-border': noBorder }" :style="footerStyles">
    <div class="copyright">© 2025 Trakli, All Right Reserved</div>
  </footer>
</template>

<script setup>
const props = defineProps({
  /**
   * Background color of the footer
   * @default 'var(--bg-white)'
   */
  backgroundColor: {
    type: String,
    default: 'var(--bg-white)'
  },
  /**
   * Border color of the footer
   * @default 'var(--border-light)'
   */
  borderColor: {
    type: String,
    default: 'var(--border-light)'
  },
  /**
   * Whether to hide the top border
   * @default false
   */
  noBorder: {
    type: Boolean,
    default: false
  }
});

const footerStyles = {
  '--footer-bg-color': props.backgroundColor,
  '--footer-border-color': props.noBorder ? 'transparent' : props.borderColor
};
</script>

<style lang="scss" scoped>
@use '~/assets/_variables' as *;

.footer {
  width: 100%;
  flex-shrink: 0;
  padding: $spacing-4 0;
  background-color: var(--footer-bg-color);
  border-top: 1px solid var(--footer-border-color);

  .copyright {
    text-align: center;
    color: $text-secondary;
    font-size: $font-size-sm;
    margin: 0;
  }

  &.no-border {
    border-top: none;
  }
}
</style>
