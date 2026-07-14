<template>
  <div class="import-review">
    <div class="ir-head">
      <FileText :size="18" class="ir-icon" />
      <span class="ir-name">{{ block.file_name || t('Document') }}</span>
    </div>
    <div class="ir-status" :class="`is-${tone}`">
      <Loader2 v-if="spin" :size="15" class="spin" />
      <component :is="icon" v-else :size="15" />
      {{ statusLabel }}
    </div>
    <NuxtLink
      v-if="block.import_session_id && tone !== 'unavailable'"
      :to="`/imports?session=${block.import_session_id}`"
      class="ir-link"
    >
      {{ t('Review import') }}
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-vue-next';
import type { ChatBlock } from '@/services/api/aiApi';
import { importsApi } from '@/services/api/importsApi';

const props = defineProps<{
  block: ChatBlock & { import_session_id?: number; status?: string; file_name?: string };
}>();

const { t } = useI18n();

const IN_PROGRESS = ['analyzing', 'extracting', 'enriching', 'checking'];
const POLL_INTERVAL = 3000;

const status = ref<string>(props.block.status || 'analyzing');
let timer: ReturnType<typeof setInterval> | null = null;

const stop = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

const refresh = async () => {
  const id = props.block.import_session_id;
  if (!id) return;
  try {
    const session = await importsApi.getSession(id);
    status.value = session.status;
    if (!IN_PROGRESS.includes(session.status)) stop();
  } catch {
    // 404 (deleted) or network: stop spinning and show an unavailable state.
    status.value = 'unavailable';
    stop();
  }
};

onMounted(() => {
  if (!props.block.import_session_id) return;
  refresh();
  if (IN_PROGRESS.includes(status.value)) {
    timer = setInterval(refresh, POLL_INTERVAL);
  }
});

onUnmounted(stop);

const spin = computed(() => IN_PROGRESS.includes(status.value));

const tone = computed(() => {
  if (IN_PROGRESS.includes(status.value)) return 'analyzing';
  if (status.value === 'ready') return 'ready';
  if (status.value === 'confirmed') return 'confirmed';
  if (status.value === 'failed') return 'failed';
  if (status.value === 'expired') return 'expired';
  return 'unavailable';
});

const icon = computed(() =>
  tone.value === 'failed' || tone.value === 'unavailable' ? AlertCircle : CheckCircle
);

const statusLabel = computed(() => {
  switch (tone.value) {
    case 'analyzing':
      return t('Analyzing document…');
    case 'ready':
      return t('Ready to review');
    case 'confirmed':
      return t('Imported');
    case 'failed':
      return t('Import failed');
    case 'expired':
      return t('Import expired');
    default:
      return t('Import unavailable');
  }
});
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.import-review {
  border: 1px solid $primary-muted;
  border-radius: $radius-lg;
  padding: $spacing-3;
  background: $bg-white;
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.ir-head {
  display: flex;
  align-items: center;
  gap: $spacing-2;

  .ir-icon {
    color: $primary;
  }

  .ir-name {
    font-weight: $font-semibold;
    font-size: $font-size-sm;
  }
}

.ir-status {
  display: inline-flex;
  align-items: center;
  gap: $spacing-1;
  font-size: $font-size-sm;
  color: $text-muted;

  &.is-failed,
  &.is-unavailable {
    color: $error-color;
  }

  .spin {
    animation: spin 1s linear infinite;
  }
}

.ir-link {
  color: $primary;
  font-weight: $font-semibold;
  font-size: $font-size-sm;
  text-decoration: underline;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
