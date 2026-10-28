<template>
  <TModal
    :model-value="!!transaction"
    :title="t('Label this transaction')"
    :description="t('Labels here only apply inside this space. The original stays as it is.')"
    :error="error"
    @update:model-value="$emit('close')"
  >
    <div class="fields">
      <fieldset class="form-group chips">
        <legend class="form-label">{{ t('Categories') }}</legend>
        <button
          v-for="category in overview.categories"
          :key="category.id"
          type="button"
          class="chip"
          :class="{ active: categoryIds.includes(category.id) }"
          :aria-pressed="categoryIds.includes(category.id)"
          @click="toggle(categoryIds, category.id)"
        >
          {{ category.name }}
        </button>
        <p v-if="!overview.categories.length" class="hint">
          {{ t('No categories in this space yet.') }}
        </p>
      </fieldset>
      <fieldset class="form-group chips">
        <legend class="form-label">{{ t('Groups') }}</legend>
        <button
          v-for="group in overview.groups"
          :key="group.id"
          type="button"
          class="chip"
          :class="{ active: groupIds.includes(group.id) }"
          :aria-pressed="groupIds.includes(group.id)"
          @click="toggle(groupIds, group.id)"
        >
          {{ group.name }}
        </button>
        <p v-if="!overview.groups.length" class="hint">{{ t('No groups in this space yet.') }}</p>
      </fieldset>
    </div>
    <template #actions>
      <TButton variant="secondary" :text="t('Create a category')" @click="$emit('create-label')" />
      <TButton :loading="saving" :text="t('Save labels')" @click="save" />
    </template>
  </TModal>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import TModal from '@/components/TModal.vue';
import TButton from '@/components/TButton.vue';
import type { WorkspaceTransaction } from '~/types/workspace';
import { extractApiErrors } from '~/utils/apiErrors';

const props = defineProps<{ transaction: WorkspaceTransaction | null }>();
const emit = defineEmits<{ close: []; 'create-label': [] }>();
const { t } = useI18n();
const { overview, classify } = useSpaceFinance();
const { handle } = useUpsell();
const categoryIds = ref<number[]>([]);
const groupIds = ref<number[]>([]);
const error = ref('');
const saving = ref(false);

watch(
  () => props.transaction,
  (entry) => {
    categoryIds.value = [...(entry?.category_ids ?? [])];
    groupIds.value = [...(entry?.group_ids ?? [])];
    error.value = '';
  }
);

function toggle(list: number[], id: number) {
  const index = list.indexOf(id);
  if (index >= 0) list.splice(index, 1);
  else list.push(id);
}

async function save() {
  if (!props.transaction) return;
  saving.value = true;
  error.value = '';
  try {
    await classify(props.transaction.id, categoryIds.value, groupIds.value);
    emit('close');
  } catch (cause) {
    if (handle(cause)) emit('close');
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
