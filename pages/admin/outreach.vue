<template>
  <AdminPage
    :title="t('User outreach')"
    :description="composing ? t('Compose a new outreach.') : t('Emails you have sent to users.')"
  >
    <template #actions>
      <DsButton v-if="!composing" @click="composing = true">{{ t('New outreach') }}</DsButton>
      <DsButton v-else variant="secondary" @click="composing = false">{{ t('Back') }}</DsButton>
    </template>

    <DsCard v-if="composing" padding="md">
      <OutreachComposer @sent="onSent" />
    </DsCard>

    <template v-else>
      <DsStatePanel v-if="pending" state="loading" :title="t('Loading outreach')" />
      <DsStatePanel
        v-else-if="failed"
        state="error"
        :title="t('Could not load outreach')"
        :description="t('The admin service did not answer. Nothing has changed.')"
        :action-label="t('Try again')"
        @action="load"
      />
      <DsStatePanel
        v-else-if="!items.length"
        art="mail"
        area="slate"
        :title="t('No outreach sent yet')"
        :description="
          t(
            'Write to your users from here and every send is listed, so you can see what was said and when.'
          )
        "
        :action-label="t('New outreach')"
        @action="composing = true"
      />
      <DsDataTable v-else :columns="columns" :rows="items" :empty-text="t('No outreaches yet')">
        <template #cell-subject="{ value }">
          <strong>{{ value }}</strong>
        </template>
        <template #cell-created_at="{ value }">
          {{ value ? new Date(String(value)).toLocaleDateString() : '' }}
        </template>
      </DsDataTable>
    </template>
  </AdminPage>
</template>

<script setup lang="ts">
import {
  DsButton,
  DsCard,
  DsDataTable,
  DsStatePanel,
  type DataTableColumn
} from '@whilesmart/design';
import OutreachComposer from '@/components/admin/OutreachComposer.vue';
import { adminApi, type OutreachSummary } from '@/services/api/adminApi';

definePageMeta({ layout: 'admin', middleware: ['auth', 'admin'] });

const { t } = useI18n();

const composing = ref(false);
const pending = ref(true);
const failed = ref(false);
const items = ref<OutreachSummary[]>([]);

const columns = computed<DataTableColumn[]>(() => [
  { key: 'subject', label: t('Subject') },
  { key: 'audience', label: t('Audience') },
  { key: 'sent', label: t('Sent') },
  { key: 'created_at', label: t('Date') }
]);

async function load() {
  pending.value = true;
  failed.value = false;
  try {
    items.value = await adminApi.outreachHistory();
  } catch {
    failed.value = true;
  } finally {
    pending.value = false;
  }
}

function onSent() {
  composing.value = false;
  load();
}

onMounted(load);
</script>
