<template>
  <div class="component-loader">
    <LoadingSkeleton
      v-if="isLoading && !hasData"
      :variant="skeletonVariant"
      :count="skeletonCount"
      :columns="skeletonColumns"
    />

    <div v-if="error && !isLoading" class="error-state">
      <div class="error-icon">
        <AlertTriangle :size="24" />
      </div>
      <div class="error-content">
        <h3 class="error-title">
          <span v-if="getErrorCode(error)">Error {{ getErrorCode(error) }}</span>
          <span v-else>Something went wrong</span>
        </h3>
        <p class="error-message">{{ formatErrorMessage(error) }}</p>
        <button v-if="onRetry" class="retry-btn" @click="onRetry">Try Again</button>
      </div>
    </div>

    <div v-if="!isLoading && !error && !hasData && showEmpty" class="empty-state">
      <slot name="empty">
        <EmptyState :page-name="emptyStateName" @create="$emit('create')" />
      </slot>
    </div>

    <div v-if="hasData" class="content-wrapper">
      <slot />
    </div>
  </div>
</template>

<script setup>
import LoadingSkeleton from './LoadingSkeleton.vue';
import EmptyState from './EmptyState.vue';
import { AlertTriangle } from 'lucide-vue-next';

// Extract HTTP status code and message from error
function formatErrorMessage(error) {
  if (!error) return 'An unknown error occurred';

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred. Please try again.';
}

// Extract HTTP status code from error object
function getErrorCode(error) {
  if (!error) return null;

  // Try to extract status code from various error object structures
  if (error?.response?.status) return error.response.status;
  if (error?.status) return error.status;
  if (error?.statusCode) return error.statusCode;

  // Try to extract from error message if it contains a status code
  if (typeof error === 'string') {
    const statusMatch = error.match(/\b(4\d{2}|5\d{2})\b/);
    if (statusMatch) return parseInt(statusMatch[0]);
  }

  return null;
}

defineProps({
  isLoading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: null
  },
  hasData: {
    type: Boolean,
    default: false
  },
  showEmpty: {
    type: Boolean,
    default: true
  },
  emptyStateName: {
    type: String,
    default: 'items'
  },
  skeletonVariant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'list', 'card', 'table'].includes(value)
  },
  skeletonCount: {
    type: Number,
    default: 3
  },
  skeletonColumns: {
    type: Number,
    default: 4
  },
  onRetry: {
    type: Function,
    default: null
  }
});

defineEmits(['create']);
</script>

<style scoped lang="scss">
@use '~/assets/scss/_variables' as *;

.component-loader {
  width: 100%;
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  margin: 1rem 0;

  .error-icon {
    color: $error-color;
    margin-bottom: 1rem;
  }

  .error-content {
    max-width: 400px;
  }

  .error-title {
    font-size: 1.125rem;
    font-weight: 600;
    color: #dc2626;
    margin: 0 0 0.5rem 0;
  }

  .error-message {
    color: #7f1d1d;
    margin: 0 0 1.5rem 0;
    line-height: 1.5;
  }

  .retry-btn {
    padding: 0.75rem 1.5rem;
    background: $primary;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;

    &:hover {
      background: $primary-hover;
    }

    &:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1);
    }
  }
}

.empty-state {
  width: 100%;
}

.content-wrapper {
  width: 100%;
}
</style>
