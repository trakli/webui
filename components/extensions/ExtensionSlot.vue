<template>
  <DescriptorRenderer
    v-for="contribution in contributions"
    :key="contribution.key"
    :contribution="contribution"
    @action="$emit('action', $event)"
  />
</template>

<script setup lang="ts">
import DescriptorRenderer from '@/components/extensions/DescriptorRenderer.vue';
import type { ExtensionSlot, SlotContribution } from '~/types/integration';
import { useExtensionSlots } from '~/composables/useExtensionSlots';

const props = defineProps<{ name: ExtensionSlot }>();
defineEmits<{ action: [SlotContribution] }>();

const { contributionsFor } = useExtensionSlots();
const contributions = contributionsFor(props.name);
</script>
