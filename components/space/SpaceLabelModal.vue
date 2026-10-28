<template>
  <TModal
    :model-value="modelValue"
    size="small"
    :title="kind === 'categories' ? t('Create a category') : t('Create a group')"
    :description="
      kind === 'categories'
        ? t('Categories sort shared spending, such as groceries or bills.')
        : t('Groups bundle spending across categories, such as a trip.')
    "
    :error="error"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <form id="space-label" class="fields" @submit.prevent="save">
      <label class="form-group">
        <span class="form-label">{{ t('Name') }}</span>
        <input v-model="name" class="form-input" maxlength="255" required />
      </label>
      <label v-if="kind === 'categories'" class="form-group">
        <span class="form-label">{{ t('Type') }}</span>
        <select v-model="type" class="form-select">
          <option value="expense">{{ t('Expense') }}</option>
          <option value="income">{{ t('Income') }}</option>
        </select>
      </label>
    </form>
    <template #actions>
      <TButton variant="secondary" :text="t('Cancel')" @click="$emit('update:modelValue', false)" />
      <TButton type="submit" form="space-label" :loading="saving" :text="t('Create')" />
    </template>
  </TModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import TModal from '@/components/TModal.vue';
import TButton from '@/components/TButton.vue';
import { extractApiErrors } from '~/utils/apiErrors';

const props = defineProps<{ modelValue: boolean; kind: 'categories' | 'groups' }>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>();
const { t } = useI18n();
const { saveLabel } = useSpaceFinance();
const { handle } = useUpsell();
const name = ref('');
const type = ref('expense');
const error = ref('');
const saving = ref(false);

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      name.value = '';
      type.value = 'expense';
      error.value = '';
    }
  }
);

async function save() {
  saving.value = true;
  error.value = '';
  try {
    await saveLabel(props.kind, name.value, type.value);
    emit('update:modelValue', false);
  } catch (cause) {
    if (handle(cause)) emit('update:modelValue', false);
    else error.value = extractApiErrors(cause);
  } finally {
    saving.value = false;
  }
}
</script>

<style lang="scss" scoped>
@use '@/assets/scss/_form-styles.scss';
@use './space-form' as *;
</style>
