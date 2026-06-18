<template>
  <div class="proposed-action" :class="`risk-${block.risk}`">
    <div class="pa-head">
      <component :is="icon" :size="18" class="pa-icon" />
      <span class="pa-summary">{{ block.summary }}</span>
    </div>

    <!-- Editable review form while pending: the exact fields that will be saved. -->
    <div v-if="state === 'pending' && fields.length" class="pa-form">
      <label v-for="f in fields" :key="f.key" class="pa-field-edit">
        <span class="pa-field-label">{{ f.label }}</span>

        <select v-if="f.type === 'enum'" v-model="edited[f.key]" class="pa-input">
          <option v-for="opt in f.options || []" :key="opt" :value="opt">{{ cap(opt) }}</option>
        </select>

        <select v-else-if="f.type === 'wallet'" v-model="edited[f.key]" class="pa-input">
          <option v-for="w in wallets" :key="w.id" :value="w.id">{{ w.name }}</option>
        </select>

        <select v-else-if="f.type === 'party'" v-model="edited[f.key]" class="pa-input">
          <option :value="null">{{ t('None') }}</option>
          <option v-for="p in parties" :key="p.id" :value="p.id">{{ p.name }}</option>
        </select>

        <select
          v-else-if="f.type === 'categories'"
          v-model="edited[f.key]"
          multiple
          class="pa-input pa-input--multi"
        >
          <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
        </select>

        <input
          v-else-if="f.type === 'number'"
          v-model.number="edited[f.key]"
          type="number"
          step="0.01"
          class="pa-input"
        />
        <input
          v-else-if="f.type === 'datetime'"
          v-model="edited[f.key]"
          type="datetime-local"
          class="pa-input"
        />
        <input v-else v-model="edited[f.key]" type="text" class="pa-input" />
      </label>
    </div>

    <!-- Read-only summary once acted on. -->
    <dl v-else-if="fields.length" class="pa-fields">
      <div v-for="(f, i) in fields" :key="i" class="pa-field">
        <dt class="pa-field-label">{{ f.label }}</dt>
        <dd class="pa-field-value">{{ f.display || f.value }}</dd>
      </div>
    </dl>

    <div v-if="state === 'pending'" class="pa-actions">
      <button class="pa-btn pa-confirm" :disabled="busy" @click="confirm">
        {{ busy ? t('Working…') : t('Confirm') }}
      </button>
      <button class="pa-btn pa-reject" :disabled="busy" @click="reject">
        {{ t('Dismiss') }}
      </button>
    </div>
    <div v-else class="pa-status" :class="`is-${state}`">
      <component :is="statusIcon" :size="15" />
      {{ statusLabel }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, onMounted } from 'vue';
import { Check, X, AlertTriangle, ShoppingCart } from 'lucide-vue-next';
import { aiApi, type ProposedActionBlock } from '@/services/api/aiApi';
import { useSharedData } from '@/composables/useSharedData';

interface EditableField {
  key: string;
  label: string;
  type: string;
  value: unknown;
  display?: string;
  options?: string[];
}

const props = defineProps<{ block: ProposedActionBlock; sessionId: number }>();
const emit = defineEmits<{ (e: 'changed'): void }>();

const { t } = useI18n();
const { showError } = useNotifications();
const sharedData = useSharedData();
const wallets = sharedData.wallets;
const categories = sharedData.categories;
const parties = sharedData.parties;

const nowLocal = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};

const fields = computed<EditableField[]>(() => (props.block.fields as EditableField[]) ?? []);

const edited = reactive<Record<string, unknown>>({});

onMounted(() => {
  fields.value.forEach((f) => {
    if (f.type === 'datetime') {
      edited[f.key] = typeof f.value === 'string' && f.value ? f.value.slice(0, 16) : nowLocal();
      return;
    }
    edited[f.key] = f.value;
  });
  if (fields.value.some((f) => f.type === 'wallet')) sharedData.loadWallets?.();
  if (fields.value.some((f) => f.type === 'categories')) sharedData.loadCategories?.();
  if (fields.value.some((f) => f.type === 'party')) sharedData.loadParties?.();
});

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const state = ref<'pending' | 'executed' | 'rejected'>(
  props.block.status === 'executed'
    ? 'executed'
    : props.block.status === 'rejected'
      ? 'rejected'
      : 'pending'
);
const busy = ref(false);

const icon = computed(() => (props.block.risk === 'high' ? AlertTriangle : ShoppingCart));
const statusIcon = computed(() => (state.value === 'executed' ? Check : X));
const statusLabel = computed(() => (state.value === 'executed' ? t('Done') : t('Dismissed')));

function overrides(): Record<string, unknown> {
  const o: Record<string, unknown> = {};
  fields.value.forEach((f) => {
    const value = edited[f.key];
    // Skip untouched/blank fields so an empty "When" isn't sent as "" (which the
    // server would record as 01/01/1970); the backend defaults it to now.
    if (value === '' || value === null || value === undefined) return;
    o[f.key] = value;
  });
  return o;
}

async function confirm() {
  busy.value = true;
  try {
    await aiApi.confirmAction(props.sessionId, props.block.id, overrides());
    state.value = 'executed';
    emit('changed');
  } catch {
    showError(t('Could not complete the action'));
  } finally {
    busy.value = false;
  }
}

async function reject() {
  busy.value = true;
  try {
    await aiApi.rejectAction(props.sessionId, props.block.id);
    state.value = 'rejected';
    emit('changed');
  } catch {
    showError(t('Could not dismiss the action'));
  } finally {
    busy.value = false;
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_variables.scss' as *;

.proposed-action {
  border: 1px solid $primary-muted;
  border-left: 3px solid $primary;
  border-radius: $radius-lg;
  padding: $spacing-3;
  background: $bg-white;
  display: flex;
  flex-direction: column;
  gap: $spacing-3;

  &.risk-high {
    border-left-color: $warning;
  }
}

.pa-form {
  display: flex;
  flex-direction: column;
  gap: $spacing-2;
}

.pa-field-edit {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-3;

  .pa-field-label {
    color: $text-muted;
    font-size: $font-size-sm;
    flex-shrink: 0;
  }
}

.pa-input {
  flex: 1;
  min-width: 0;
  max-width: 60%;
  padding: 6px 8px;
  border: 1px solid $primary-muted;
  border-radius: $radius-md;
  background: $bg-white;
  color: $text-primary;
  font-size: $font-size-sm;
  font-family: inherit;

  &:focus {
    outline: none;
    border-color: $primary;
  }
}

.pa-input--multi {
  min-height: 64px;
}

.pa-fields {
  margin: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid $primary-muted;
  border-radius: $radius-md;
  overflow: hidden;
}

.pa-field {
  display: flex;
  justify-content: space-between;
  gap: $spacing-3;
  padding: $spacing-2 $spacing-3;
  border-bottom: 1px solid $primary-muted;

  &:last-child {
    border-bottom: none;
  }

  .pa-field-label {
    margin: 0;
    color: $text-muted;
    font-size: $font-size-sm;
  }

  .pa-field-value {
    margin: 0;
    font-weight: $font-semibold;
    text-align: right;
    word-break: break-word;
  }
}

.pa-head {
  display: flex;
  align-items: center;
  gap: $spacing-2;

  .pa-icon {
    color: $primary;
    flex-shrink: 0;
  }

  .pa-summary {
    font-weight: $font-semibold;
    font-size: $font-size-sm;
  }
}

.pa-actions {
  display: flex;
  gap: $spacing-2;
}

.pa-btn {
  border: none;
  border-radius: $radius-md;
  padding: $spacing-2 $spacing-4;
  font-size: $font-size-sm;
  font-weight: $font-semibold;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
}

.pa-confirm {
  background: $primary;
  color: $text-inverse;
}

.pa-reject {
  background: $bg-gray;
  color: $text-secondary;
}

.pa-status {
  display: inline-flex;
  align-items: center;
  gap: $spacing-1;
  font-size: $font-size-sm;
  font-weight: $font-semibold;

  &.is-executed {
    color: $income;
  }

  &.is-rejected {
    color: $text-muted;
  }
}
</style>
