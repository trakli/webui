<template>
  <div class="analyzing">
    <div class="analyzing__visual">
      <div class="analyzing__rings">
        <div class="ring ring--outer" />
        <div class="ring ring--middle" />
        <div class="ring ring--inner" />
      </div>
      <div class="analyzing__icon">
        <DocumentMagnifyingGlassIcon class="icon" />
      </div>
    </div>

    <p class="analyzing__status">{{ currentMessage }}</p>
    <p class="analyzing__file">{{ fileName }}</p>

    <div class="analyzing__progress">
      <div class="analyzing__progress-bar">
        <div class="analyzing__progress-fill" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DocumentMagnifyingGlassIcon } from '@heroicons/vue/24/outline';

import type { ImportSession } from '~/types/import';

const props = defineProps<{
  fileName: string;
  status: ImportSession['status'];
}>();

const stageMessages: Record<string, string[]> = {
  analyzing: [
    'Uploading and preparing your document...',
    'Validating file format...',
    'Queuing document for processing...',
    'Starting analysis...',
    'Initializing document processor...',
    'Preparing extraction pipeline...'
  ],
  extracting: [
    'Reading document contents...',
    'Scanning pages for text...',
    'Running text recognition...',
    'Detecting document layout...',
    'Identifying table structures...',
    'Extracting rows and columns...',
    'Parsing transaction entries...',
    'Reading amounts and dates...',
    'Interpreting currency formats...',
    'Processing multi-line entries...',
    'Handling page breaks...',
    'Assembling raw transaction data...',
    'This can take a moment for larger documents...',
    'Still extracting, almost there...'
  ],
  enriching: [
    'Analyzing extracted transactions...',
    'Identifying transaction types...',
    'Classifying income and expenses...',
    'Recognizing merchant names...',
    'Matching parties to your contacts...',
    'Mapping to your existing wallets...',
    'Suggesting appropriate categories...',
    'Cleaning up transaction descriptions...',
    'Resolving abbreviated names...',
    'Normalizing amounts and currencies...',
    'Applying smart categorization...',
    'Fine-tuning suggestions...'
  ],
  checking: [
    'Scanning for duplicate transactions...',
    'Comparing dates and amounts...',
    'Cross-referencing with recent records...',
    'Checking for similar entries...',
    'Flagging potential matches...',
    'Calculating confidence scores...',
    'Building your review dashboard...',
    'Finalizing suggestions...'
  ]
};

const fallbackMessages = ['Processing your document...'];

const messageIndex = ref(0);

const currentMessages = computed(() => stageMessages[props.status] || fallbackMessages);

const currentMessage = computed(() => {
  const msgs = currentMessages.value;
  return msgs[Math.min(messageIndex.value, msgs.length - 1)];
});

let interval: ReturnType<typeof setInterval> | null = null;

// Reset message index when stage changes
watch(
  () => props.status,
  () => {
    messageIndex.value = 0;
  }
);

onMounted(() => {
  interval = setInterval(() => {
    const msgs = currentMessages.value;
    if (messageIndex.value < msgs.length - 1) {
      messageIndex.value++;
    }
  }, 3500);
});

onUnmounted(() => {
  if (interval) clearInterval(interval);
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.analyzing {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  text-align: center;

  &__visual {
    position: relative;
    width: 120px;
    height: 120px;
    margin-bottom: 28px;
  }

  &__rings {
    position: absolute;
    inset: 0;
  }

  &__icon {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;

    .icon {
      width: 36px;
      height: 36px;
      color: $primary;
    }
  }

  &__status {
    font-size: $font-size-base;
    color: $text-primary;
    margin: 0 0 6px;
    min-height: 1.5em;
    transition: opacity 0.3s ease;
    animation: fadeSwap 2.8s ease-in-out infinite;
  }

  &__file {
    font-size: $font-size-sm;
    color: $text-muted;
    margin: 0 0 24px;
    max-width: 300px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__progress {
    width: 100%;
    max-width: 320px;
  }

  &__progress-bar {
    height: 3px;
    background-color: $border-light;
    border-radius: 2px;
    overflow: hidden;
  }

  &__progress-fill {
    height: 100%;
    background-color: $primary;
    border-radius: 2px;
    animation: indeterminate 2s ease-in-out infinite;
  }
}

.ring {
  position: absolute;
  border-radius: 50%;
  border: 2px solid transparent;

  &--outer {
    inset: 0;
    border-top-color: $primary;
    border-right-color: rgba(var(--color-primary-rgb), 0.2);
    animation: spin 3s linear infinite;
  }

  &--middle {
    inset: 14px;
    border-bottom-color: $primary-lighter;
    border-left-color: rgba(var(--color-primary-rgb), 0.15);
    animation: spin 2s linear infinite reverse;
  }

  &--inner {
    inset: 28px;
    border-top-color: $primary-muted;
    animation: spin 1.5s linear infinite;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes fadeSwap {
  0%,
  100% {
    opacity: 1;
  }
  45% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  55% {
    opacity: 1;
  }
}

@keyframes indeterminate {
  0% {
    width: 0%;
    margin-left: 0;
  }
  50% {
    width: 60%;
    margin-left: 20%;
  }
  100% {
    width: 0%;
    margin-left: 100%;
  }
}
</style>
