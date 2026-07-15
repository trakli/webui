<template>
  <div class="af">
    <label v-for="f in editable" :key="f.key" class="af-row">
      <span class="af-label">{{ f.label }}</span>

      <select v-if="f.type === 'enum'" v-model="draft[f.key]" class="af-input">
        <option v-for="opt in f.options || []" :key="opt" :value="opt">{{ cap(opt) }}</option>
      </select>

      <select v-else-if="f.type === 'wallet'" v-model="draft[f.key]" class="af-input">
        <option v-for="w in wallets" :key="w.id" :value="w.id">{{ w.name }}</option>
      </select>

      <select v-else-if="f.type === 'party'" v-model="draft[f.key]" class="af-input">
        <option :value="null">{{ t('None') }}</option>
        <option v-for="p in parties" :key="p.id" :value="p.id">{{ p.name }}</option>
      </select>

      <!-- One category per transaction, so this is a plain single select. -->
      <select v-else-if="f.type === 'category'" v-model="draft[f.key]" class="af-input">
        <option :value="null">{{ t('None') }}</option>
        <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
      </select>

      <input
        v-else-if="f.type === 'number'"
        v-model.number="draft[f.key]"
        type="number"
        step="0.01"
        class="af-input"
      />
      <input
        v-else-if="f.type === 'datetime'"
        v-model="draft[f.key]"
        type="datetime-local"
        class="af-input"
      />
      <input v-else v-model="draft[f.key]" type="text" class="af-input" />
    </label>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, onMounted, watch } from 'vue';
import type { ProposedActionField } from '@/services/api/aiApi';
import { useSharedData } from '@/composables/useSharedData';

const props = defineProps<{ fields: ProposedActionField[] }>();
const emit = defineEmits<{ (e: 'change', overrides: Record<string, unknown>): void }>();

const { t } = useI18n();
const sharedData = useSharedData();
const wallets = sharedData.wallets;
const categories = sharedData.categories;
const parties = sharedData.parties;

// A readonly row is context for the reader, not something to send back.
const editable = computed(() => props.fields.filter((f) => f.type !== 'readonly'));

const draft = reactive<Record<string, unknown>>({});

const nowLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

onMounted(() => {
  editable.value.forEach((f) => {
    if (f.type === 'datetime') {
      draft[f.key] = typeof f.value === 'string' && f.value ? f.value.slice(0, 16) : nowLocal();
      return;
    }
    draft[f.key] = f.value;
  });

  if (editable.value.some((f) => f.type === 'wallet')) sharedData.loadWallets?.();
  if (editable.value.some((f) => f.type === 'category')) sharedData.loadCategories?.();
  if (editable.value.some((f) => f.type === 'party')) sharedData.loadParties?.();
});

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

watch(
  draft,
  () => {
    const out: Record<string, unknown> = {};
    editable.value.forEach((f) => {
      const value = draft[f.key];
      // Blank means "untouched", not "clear it": sending an empty datetime would
      // be recorded as the Unix epoch rather than defaulted server-side.
      if (value === '' || value === null || value === undefined) return;
      // The payload carries one category as a list, while the control is single.
      out[f.key] = f.key === 'categories' ? [value] : value;
    });
    emit('change', out);
  },
  { deep: true, immediate: false }
);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.af {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.af-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-3;
}

.af-label {
  color: $text-muted;
  font-size: $font-size-xs;
  flex-shrink: 0;
}

.af-input {
  flex: 1;
  min-width: 0;
  max-width: 62%;
  padding: 5px 8px;
  border: 1px solid $border-light;
  border-radius: 8px;
  background: $bg-white;
  color: $text-primary;
  font-size: $font-size-xs;
  font-family: inherit;
  transition: border-color 0.15s ease;

  &:focus {
    outline: none;
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.14);
  }
}
</style>
