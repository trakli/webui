<template>
  <SpacePeople v-if="isShared" />
</template>

<script setup lang="ts">
import SpacePeople from '@/components/space/SpacePeople.vue';

definePageMeta({ layout: 'dashboard', middleware: 'auth' });
const { isShared } = useActiveSpace();
</script>
