<template>
  <div class="lw" :class="{ 'lw--with-inspector': !!$slots.inspector || open }">
    <section class="lw-main">
      <header class="lw-head">
        <h1>{{ title }}</h1>
        <span v-if="subtitle" class="lw-sub">{{ subtitle }}</span>
        <div v-if="$slots.actions" class="lw-end"><slot name="actions" /></div>
      </header>
      <div class="lw-body"><slot /></div>
    </section>
    <aside v-if="open" class="lw-insp" :aria-label="t('New transaction')">
      <LedgerAddPanel />
    </aside>
    <aside v-else-if="$slots.inspector" class="lw-insp" :aria-label="inspectorLabel">
      <slot name="inspector" />
    </aside>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import LedgerAddPanel from './LedgerAddPanel.vue';
import { useLedgerAdd } from '@/composables/useLedgerAdd';

defineProps<{ title: string; subtitle?: string; inspectorLabel?: string }>();

const { t } = useI18n();
const { open, hosts, close } = useLedgerAdd();
onMounted(() => hosts.value++);
onBeforeUnmount(() => {
  hosts.value--;
  close();
});
</script>

<style scoped>
.lw {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  height: 100%;
  min-height: 0;
}

.lw--with-inspector {
  grid-template-columns: minmax(0, 1fr) 312px;
}

.lw-main {
  min-width: 0;
  min-height: 0;
  overflow: auto;
}

.lw-head {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 6px 12px;
  padding: 16px 20px 12px;
}

.lw-head h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--ledger-ink);
}

.lw-sub {
  color: var(--ledger-ink-3);
  font-size: 13px;
  padding-bottom: 3px;
}

.lw-end {
  margin-left: auto;
  display: flex;
  gap: 8px;
  align-items: center;
}

.lw-body {
  padding: 0 20px 20px;
}

.lw-insp {
  border-left: 1px solid var(--ledger-line);
  background: var(--ledger-surface);
  overflow: auto;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 0;
}

@media (max-width: 1099px) {
  .lw,
  .lw--with-inspector {
    grid-template-columns: minmax(0, 1fr);
    height: auto;
  }

  .lw-main {
    overflow: visible;
  }

  .lw-insp {
    border-left: 0;
    border-top: 1px solid var(--ledger-line);
    overflow: visible;
  }
}

@media (max-width: 767px) {
  .lw-head {
    padding: 14px 14px 10px;
  }

  .lw-body {
    padding: 0 14px 16px;
  }

  .lw-insp {
    padding: 16px 14px;
  }
}
</style>
