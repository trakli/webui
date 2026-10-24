<script setup lang="ts">
import { DsButton } from '@whilesmart/design';
import type { WorkspaceTransaction } from '~/types/workspace';
defineProps<{ transaction: WorkspaceTransaction; canManage: boolean }>();
defineEmits<{
  edit: [transaction: WorkspaceTransaction];
  classify: [transaction: WorkspaceTransaction];
  remove: [transaction: WorkspaceTransaction];
  unshare: [transaction: WorkspaceTransaction];
}>();
</script>

<template>
  <div class="transaction-actions">
    <DsButton
      v-if="transaction.can_edit"
      size="sm"
      variant="ghost"
      @click="$emit('edit', transaction)"
      >Edit</DsButton
    >
    <DsButton v-if="canManage" size="sm" variant="ghost" @click="$emit('classify', transaction)"
      >Classify</DsButton
    >
    <DsButton
      v-if="transaction.can_edit"
      size="sm"
      variant="ghost"
      @click="$emit('remove', transaction)"
      >Delete</DsButton
    >
    <DsButton
      v-if="transaction.can_unshare"
      size="sm"
      variant="ghost"
      @click="$emit('unshare', transaction)"
      >Unshare</DsButton
    >
  </div>
</template>

<style scoped>
.transaction-actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: var(--ds-space-2);
}
@media (max-width: 600px) {
  .transaction-actions {
    justify-content: flex-start;
  }
}
</style>
