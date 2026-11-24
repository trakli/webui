<template>
  <div class="ledger-shell" :class="{ 'ledger-shell--rail-open': railOpen }">
    <header class="lg-top">
      <button
        type="button"
        class="lg-icon lg-menu"
        :aria-label="t('Menu')"
        :aria-expanded="railOpen"
        @click="railOpen = !railOpen"
      >
        <Menu />
      </button>
      <NuxtLink to="/dashboard" class="lg-brand" :aria-label="t('Dashboard')">
        <LedgerLogo />
      </NuxtLink>
      <button type="button" class="lg-cmd" data-testid="ledger-command" @click="paletteOpen = true">
        <Search class="lg-cmd-icon" />
        <span class="lg-cmd-text">{{ t('Jump, search or ask') }}</span>
        <kbd class="lg-kbd">{{ shortcutLabel }}</kbd>
      </button>
      <div class="lg-top-end">
        <button
          v-if="isShared"
          type="button"
          class="lg-log"
          :aria-label="t('Log a transaction')"
          :title="t('Log a transaction')"
          data-testid="ledger-log"
          @click="addInSpace"
        >
          <Plus />
        </button>
        <button
          v-else
          type="button"
          class="lg-log"
          :aria-label="t('Log a transaction')"
          :title="t('Log a transaction')"
          data-testid="ledger-log"
          @click="startAdd"
        >
          <Plus />
        </button>
        <LanguageSelector class="lg-hide-sm" />
        <ThemeSelector />
        <NotificationBell />
        <TAvatar v-if="user" :image-url="getAvatarUrl(user)" :show-dropdown="true" show-space />
      </div>
    </header>

    <div class="lg-body">
      <LedgerRail :open="railOpen" @navigate="railOpen = false" />
      <div v-if="railOpen" class="lg-scrim" @click="railOpen = false" />
      <LedgerScopeTree v-if="!isShared" class="lg-tree" />
      <main class="lg-main" :class="{ 'lg-main--framed': framed }">
        <div class="ledger-content" :class="{ 'ledger-content--framed': framed }">
          <SpaceBar />
          <slot />
        </div>
      </main>
    </div>
    <LedgerStatusBar v-if="!isShared" />

    <LedgerPalette :open="paletteOpen" @close="paletteOpen = false" />
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { Menu, Plus, Search } from 'lucide-vue-next';
import LedgerLogo from './LedgerLogo.vue';
import LedgerRail from './LedgerRail.vue';
import LedgerPalette from './LedgerPalette.vue';
import LedgerScopeTree from './LedgerScopeTree.vue';
import { useLedgerAdd } from '@/composables/useLedgerAdd';
import LedgerStatusBar from './LedgerStatusBar.vue';
import LanguageSelector from '@/components/LanguageSelector.vue';
import ThemeSelector from '@/components/ThemeSelector.vue';
import NotificationBell from '@/components/NotificationBell.vue';
import TAvatar from '@/components/TAvatar.vue';
import SpaceBar from '@/components/space/SpaceBar.vue';
import { useAuth } from '@/composables/useAuth';
import { useAvatar } from '@/composables/useAvatar';

const { t } = useI18n();
const route = useRoute();
const { user } = useAuth();
const { getAvatarUrl } = useAvatar();
const { isShared, canWrite } = useActiveSpace();
const { compose } = useSpaceComposer();
const { prompt } = useUpsell();

const { start: startAdd } = useLedgerAdd();
const framed = computed(
  () => route.meta.ledgerFrame === true && (!isShared.value || route.path === '/dashboard')
);

const railOpen = ref(false);
const paletteOpen = ref(false);
const isMac = ref(false);

const shortcutLabel = computed(() => (isMac.value ? '⌘ K' : 'Ctrl K'));

const addInSpace = () => {
  if (canWrite.value) compose();
  else prompt('workspace');
};

const onKeydown = (event: KeyboardEvent) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    paletteOpen.value = !paletteOpen.value;
  }
};

watch(
  () => route.fullPath,
  () => {
    railOpen.value = false;
  }
);

onMounted(() => {
  isMac.value = /mac|iphone|ipad/i.test(navigator.platform || navigator.userAgent);
  window.addEventListener('keydown', onKeydown);
});

onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
</script>

<style scoped>
.ledger-shell {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--ledger-bg);
  color: var(--ledger-ink);
  overflow: hidden;
}

.lg-top {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 14px;
  border-bottom: 1px solid var(--ledger-line);
  background: var(--ledger-surface);
  min-height: 52px;
}

.lg-brand {
  display: inline-flex;
  align-items: center;
  padding-right: 4px;
}

.lg-cmd {
  height: 34px;
  flex: 1;
  max-width: 560px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--ledger-line);
  background: var(--ledger-bg);
  border-radius: var(--ledger-r-sm);
  padding: 7px 10px;
  font-size: 13px;
  color: var(--ledger-ink-3);
  cursor: pointer;
  text-align: left;
  min-width: 0;
}

.lg-cmd-icon {
  width: 16px;
  height: 16px;
  flex: none;
}

.lg-cmd-text {
  flex: 1;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.lg-kbd {
  font-family: var(--ledger-mono);
  font-size: 11px;
  border: 1px solid var(--ledger-line);
  border-bottom-width: 2px;
  border-radius: 3px;
  padding: 0 5px;
  background: var(--ledger-surface);
  color: var(--ledger-ink-2);
}

.lg-top-end {
  display: flex;
  align-items: center;
  gap: 6px;
}

.lg-top-end :deep(.icon-button) {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  padding: 0;
  border: 1px solid var(--ledger-line);
  border-radius: var(--ledger-r-sm);
  background: var(--ledger-surface);
  color: var(--ledger-ink-2);
}

.lg-top-end :deep(.icon-button:hover) {
  background: var(--ledger-surface-2);
}

.lg-top-end :deep(.icon-button svg),
.lg-top-end :deep(.icon-button .flag-icon) {
  width: 18px;
  height: 18px;
}

.lg-top-end :deep(.icon-button .flag-icon) {
  height: 13px;
  border-radius: 2px;
  object-fit: cover;
}

.lg-top-end :deep(.t-avatar-button) {
  height: 34px;
  padding: 0 8px 0 3px;
  gap: 8px;
  border: 1px solid var(--ledger-line);
  border-radius: var(--ledger-r-sm);
  background: var(--ledger-surface);
}

.lg-top-end :deep(.t-avatar-button .avatar-image) {
  width: 26px;
  height: 26px;
  border-radius: 3px;
}

.lg-log {
  width: 34px;
  height: 34px;
  flex: none;
  display: grid;
  place-items: center;
  border-radius: var(--ledger-r-sm);
  background: var(--ledger-brand);
  color: var(--ledger-on-brand);
  text-decoration: none;
  border: 0;
  cursor: pointer;
}

.lg-log:hover {
  filter: brightness(1.08);
}

.lg-log :deep(svg) {
  width: 18px;
  height: 18px;
}

.lg-icon {
  width: 34px;
  height: 34px;
  display: none;
  place-items: center;
  border: 1px solid var(--ledger-line);
  background: var(--ledger-surface);
  border-radius: var(--ledger-r-sm);
  color: var(--ledger-ink-2);
  cursor: pointer;
}

.lg-icon :deep(svg) {
  width: 18px;
  height: 18px;
}

.lg-body {
  flex: 1;
  display: flex;
  min-height: 0;
  position: relative;
}

.lg-main {
  flex: 1;
  min-width: 0;
  overflow: auto;
}

.ledger-content {
  padding: 20px 24px 32px;
  max-width: 1480px;
  margin: 0 auto;
}

.lg-main--framed {
  overflow: hidden;
}

.ledger-content--framed {
  padding: 0;
  max-width: none;
  height: 100%;
}

.lg-scrim {
  display: none;
}

@media (max-width: 1199px) {
  .lg-tree {
    display: none;
  }
}

@media (max-width: 1099px) {
  .lg-main--framed {
    overflow: auto;
  }

  .ledger-content--framed {
    height: auto;
  }
}

@media (max-width: 767px) {
  .lg-icon {
    display: grid;
  }

  .lg-cmd-text,
  .lg-kbd,
  .lg-hide-sm {
    display: none;
  }

  .lg-cmd {
    flex: 0 0 auto;
    margin: 0 0 0 auto;
    width: 34px;
    height: 34px;
    justify-content: center;
    padding: 0;
  }

  .lg-top {
    gap: 8px;
    padding: 8px 10px;
  }

  .ledger-content {
    padding: 14px 14px 24px;
  }

  .lg-scrim {
    display: block;
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.32);
    z-index: 30;
  }
}
</style>
