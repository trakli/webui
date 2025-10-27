<template>
  <div class="loading-skeleton">
    <div v-if="variant === 'list'" class="skeleton-list">
      <div v-for="i in count" :key="i" class="skeleton-item">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-content">
          <div class="skeleton-line skeleton-title"></div>
          <div class="skeleton-line skeleton-subtitle"></div>
        </div>
      </div>
    </div>

    <div v-else-if="variant === 'card'" class="skeleton-card">
      <div class="skeleton-header"></div>
      <div class="skeleton-body">
        <div class="skeleton-line"></div>
        <div class="skeleton-line short"></div>
      </div>
    </div>

    <div v-else-if="variant === 'table'" class="skeleton-table">
      <div class="skeleton-table-header">
        <div v-for="i in columns" :key="i" class="skeleton-th"></div>
      </div>
      <div v-for="i in count" :key="i" class="skeleton-table-row">
        <div v-for="j in columns" :key="j" class="skeleton-td"></div>
      </div>
    </div>

    <div v-else class="skeleton-default">
      <div v-for="i in count" :key="i" class="skeleton-line"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['default', 'list', 'card', 'table'].includes(value)
  },
  count: {
    type: Number,
    default: 3
  },
  columns: {
    type: Number,
    default: 4
  }
});
</script>

<style scoped lang="scss">
@use '~/assets/scss/_variables' as *;

.loading-skeleton {
  width: 100%;
}

@keyframes shimmer {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.skeleton-base {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-line {
  @extend .skeleton-base;
  height: 16px;
  margin-bottom: 8px;

  &.skeleton-title {
    height: 20px;
    width: 70%;
  }

  &.skeleton-subtitle {
    height: 14px;
    width: 90%;
  }

  &.short {
    width: 60%;
  }
}

.skeleton-list {
  .skeleton-item {
    display: flex;
    align-items: center;
    padding: 16px 0;
    border-bottom: 1px solid #f0f0f0;

    &:last-child {
      border-bottom: none;
    }
  }

  .skeleton-avatar {
    @extend .skeleton-base;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    margin-right: 16px;
    flex-shrink: 0;
  }

  .skeleton-content {
    flex: 1;
  }
}

.skeleton-card {
  @extend .skeleton-base;
  padding: 20px;
  border-radius: 8px;

  .skeleton-header {
    @extend .skeleton-base;
    height: 24px;
    width: 40%;
    margin-bottom: 16px;
  }

  .skeleton-body {
    .skeleton-line {
      margin-bottom: 12px;

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.skeleton-table {
  width: 100%;

  .skeleton-table-header {
    display: flex;
    gap: 16px;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2px solid #f0f0f0;
  }

  .skeleton-th {
    @extend .skeleton-base;
    height: 20px;
    flex: 1;
  }

  .skeleton-table-row {
    display: flex;
    gap: 16px;
    margin-bottom: 12px;
  }

  .skeleton-td {
    @extend .skeleton-base;
    height: 16px;
    flex: 1;
  }
}

.skeleton-default {
  .skeleton-line {
    margin-bottom: 12px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}

@media (max-width: $breakpoint-md) {
  .skeleton-list .skeleton-item {
    padding: 12px 0;
  }

  .skeleton-card {
    padding: 16px;
  }

  .skeleton-table {
    .skeleton-table-header,
    .skeleton-table-row {
      gap: 12px;
    }
  }
}
</style>
