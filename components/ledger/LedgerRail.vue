<template>
  <nav class="lg-rail" :class="{ 'lg-rail--open': open }" :aria-label="t('Main')">
    <NuxtLink
      v-for="item in primaryItems"
      :key="item.to"
      :to="item.to"
      class="lg-rail-item"
      :class="{ 'is-active': isActive(item) }"
      :aria-current="isActive(item) ? 'page' : undefined"
      :data-rail="item.key"
      @click="emit('navigate')"
    >
      <component :is="item.icon" class="lg-rail-icon" />
      <span>{{ t(item.label) }}</span>
    </NuxtLink>

    <div v-if="moreItems.length" class="lg-rail-more">
      <button
        type="button"
        class="lg-rail-item"
        :class="{ 'is-active': moreActive }"
        :aria-expanded="moreOpen"
        @click="moreOpen = !moreOpen"
      >
        <Ellipsis class="lg-rail-icon" />
        <span>{{ t('More') }}</span>
      </button>
      <div v-if="moreOpen" class="lg-rail-pop" role="menu">
        <NuxtLink
          v-for="item in moreItems"
          :key="item.to"
          :to="item.to"
          class="lg-rail-pop-item"
          :class="{ 'is-active': isActive(item) }"
          role="menuitem"
          @click="onMore"
        >
          <component :is="item.icon" class="lg-rail-icon" />
          {{ t(item.label) }}
        </NuxtLink>
      </div>
    </div>

    <span class="lg-rail-spacer" />

    <NuxtLink
      to="/settings"
      class="lg-rail-item"
      :class="{ 'is-active': isActive({ to: '/settings' }) }"
      data-rail="settings"
      @click="emit('navigate')"
    >
      <Settings2 class="lg-rail-icon" />
      <span>{{ t('Settings') }}</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  Bell,
  ChartNoAxesCombined,
  Coins,
  CreditCard,
  Ellipsis,
  FileDown,
  Folder,
  LayoutDashboard,
  List,
  MessageCircle,
  Scale,
  Settings2,
  Tag,
  Target,
  Users,
  UsersRound,
  Wallet
} from 'lucide-vue-next';
import { spaceSupports } from '~/utils/activeSpace';

interface RailItem {
  key?: string;
  to: string;
  label: string;
  icon?: unknown;
  also?: string[];
}

defineProps<{ open?: boolean }>();
const emit = defineEmits<{ navigate: [] }>();

const { t } = useI18n();
const route = useRoute();
const { space, isOwner } = useActiveSpace();
const { resolveComponent } = useExtensionSlots();

const moreOpen = ref(false);

const personalPrimary: RailItem[] = [
  { key: 'overview', to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { key: 'ask', to: '/home', label: 'Ask', icon: MessageCircle, also: ['/assistant'] },
  { key: 'ledger', to: '/transactions', label: 'Ledger', icon: List },
  { key: 'wallets', to: '/wallets', label: 'Wallets', icon: Wallet },
  { key: 'reports', to: '/reports', label: 'Reports', icon: ChartNoAxesCombined },
  { key: 'budgets', to: '/budgets', label: 'Budgets', icon: Target },
  { key: 'people', to: '/parties', label: 'People', icon: Users },
  { key: 'imports', to: '/imports', label: 'Imports', icon: FileDown },
  { key: 'shared', to: '/workspaces', label: 'Shared', icon: UsersRound }
];

const personalMore: RailItem[] = [
  { to: '/financial-position', label: 'Position', icon: Scale },
  { to: '/holdings', label: 'Holdings', icon: Coins },
  { to: '/categories', label: 'Categories', icon: Tag },
  { to: '/groups', label: 'Groups', icon: Folder },
  { to: '/reminders', label: 'Reminders', icon: Bell }
];

const primaryItems = computed<RailItem[]>(() => {
  if (!space.value) return personalPrimary;
  const items = personalPrimary.filter((item) => spaceSupports(item.to));
  items.push({ key: 'members', to: '/people', label: 'People', icon: UsersRound });
  if (isOwner.value && resolveComponent('cloud.workspace.billing')) {
    items.push({ key: 'billing', to: '/space-billing', label: 'Billing', icon: CreditCard });
  }
  return items;
});

const moreItems = computed<RailItem[]>(() =>
  space.value ? personalMore.filter((item) => spaceSupports(item.to)) : personalMore
);

const matches = (path: string) => route.path === path || route.path.startsWith(path + '/');

const isActive = (item: Pick<RailItem, 'to' | 'also'>) =>
  matches(item.to) || (item.also ?? []).some((path) => matches(path));

const moreActive = computed(() => moreItems.value.some(isActive));

const onMore = () => {
  moreOpen.value = false;
  emit('navigate');
};
</script>

<style scoped>
.lg-rail {
  width: 72px;
  flex: none;
  border-right: 1px solid var(--ledger-line);
  background: var(--ledger-surface);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 0;
  overflow-y: auto;
  z-index: 31;
}

.lg-rail-item {
  width: 62px;
  border: 0;
  background: none;
  border-radius: var(--ledger-r-sm);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 7px 0;
  color: var(--ledger-ink-3);
  font-size: 10.5px;
  text-decoration: none;
  cursor: pointer;
  text-align: center;
}

.lg-rail-item:hover {
  background: var(--ledger-surface-2);
  color: var(--ledger-ink);
}

.lg-rail-item.is-active {
  background: var(--ledger-brand-soft);
  color: var(--ledger-brand-text);
  font-weight: 600;
}

.lg-rail-icon {
  width: 19px;
  height: 19px;
  flex: none;
}

.lg-rail-spacer {
  flex: 1;
}

.lg-rail-more {
  position: relative;
}

.lg-rail-pop {
  position: fixed;
  margin-left: 66px;
  margin-top: -44px;
  min-width: 200px;
  background: var(--ledger-surface);
  border: 1px solid var(--ledger-line);
  border-radius: var(--ledger-r);
  box-shadow: 0 16px 40px -20px rgba(0, 0, 0, 0.45);
  padding: 4px;
  z-index: 50;
}

.lg-rail-pop-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: var(--ledger-r-sm);
  color: var(--ledger-ink-2);
  font-size: 13.5px;
  text-decoration: none;
}

.lg-rail-pop-item:hover,
.lg-rail-pop-item.is-active {
  background: var(--ledger-surface-2);
  color: var(--ledger-ink);
}

@media (max-width: 767px) {
  .lg-rail {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 232px;
    align-items: stretch;
    padding: 10px;
    transform: translateX(-100%);
    transition: transform 0.2s ease;
  }

  .lg-rail--open {
    transform: translateX(0);
  }

  .lg-rail-item {
    width: auto;
    flex-direction: row;
    gap: 12px;
    padding: 10px;
    font-size: 14px;
  }

  .lg-rail-pop {
    position: static;
    margin: 4px 0 0;
    box-shadow: none;
  }
}
</style>
