<template>
  <!-- Sanitized in renderMarkdown; safe to bind as HTML. -->
  <div class="chat-markdown" v-html="html" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { renderMarkdown } from '@/composables/useMarkdown';

const props = defineProps<{ text?: string }>();

const html = computed(() => renderMarkdown(props.text ?? ''));
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.chat-markdown {
  font-size: $font-size-sm;
  line-height: 1.6;
  color: $text-primary;
  word-break: break-word;

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4) {
    margin: $spacing-4 0 $spacing-2;
    font-weight: $font-bold;
    line-height: 1.25;
    color: $text-primary;

    &:first-child {
      margin-top: 0;
    }
  }

  :deep(h1) {
    font-size: $font-size-2xl;
  }

  :deep(h2) {
    font-size: $font-size-xl;
    padding-bottom: $spacing-1;
    border-bottom: 1px solid $border-light;
  }

  :deep(h3) {
    font-size: $font-size-lg;
  }

  :deep(h4) {
    font-size: $font-size-base;
    font-weight: $font-semibold;
  }

  :deep(p) {
    margin: 0 0 $spacing-2;
  }

  :deep(strong) {
    font-weight: $font-semibold;
    color: $text-primary;
  }

  :deep(blockquote) {
    margin: 0 0 $spacing-2;
    padding: $spacing-1 $spacing-3;
    border-left: 3px solid $primary-muted;
    color: $text-secondary;
  }

  :deep(ul),
  :deep(ol) {
    margin: 0 0 $spacing-2;
    padding-left: $spacing-4;
  }

  :deep(li) {
    padding: 2px 0;
  }

  :deep(a) {
    color: $primary;
    text-decoration: underline;
  }

  :deep(code) {
    background: $bg-gray;
    padding: 1px 4px;
    border-radius: $radius-sm;
    font-size: 0.9em;
  }

  :deep(pre) {
    background: $bg-gray;
    padding: $spacing-2;
    border-radius: $radius-md;
    overflow-x: auto;

    code {
      background: none;
      padding: 0;
    }
  }

  :deep(table) {
    width: 100%;
    border-collapse: collapse;
    margin: $spacing-2 0;

    th,
    td {
      padding: $spacing-1 $spacing-2;
      border-bottom: 1px solid $primary-muted;
      text-align: left;
    }

    th {
      font-weight: $font-semibold;
      background: $primary-light;
    }
  }

  :deep(> *:last-child) {
    margin-bottom: 0;
  }
}
</style>
