<template>
  <div class="wallet-list-card" :class="{ 'is-default': isDefault }">
    <div class="card-actions">
      <div class="action-menu-container" @click.stop>
        <button class="action-menu" :title="t('More actions')" @click="toggleMenu">
          <MoreVertical :size="16" />
        </button>
        <div v-if="showMenu" class="action-dropdown">
          <button class="dropdown-item edit" @click="handleEdit">
            <Edit :size="14" />
            {{ t('Edit') }}
          </button>
          <button class="dropdown-item delete" @click="handleDelete">
            <Trash :size="14" />
            {{ t('Delete') }}
          </button>
        </div>
      </div>
    </div>

    <div class="wallet-icon">
      <component :is="resolvedIcon" v-if="resolvedIcon" />
      <Wallet v-else />
    </div>

    <div class="wallet-header">
      <h3 class="wallet-name">{{ wallet.name }}</h3>
      <span v-if="isDefault" class="default-badge">{{ t('Default') }}</span>
    </div>
    <span class="wallet-currency">{{ wallet.currency }}</span>

    <div class="balance-section">
      <span class="balance-label">{{ t('Balance') }}</span>
      <span class="balance-amount" :class="balanceClass">{{ formattedBalance }}</span>
    </div>

    <div class="stats-section">
      <div class="stat income">
        <ArrowDownLeft class="stat-icon" />
        <div class="stat-content">
          <span class="stat-label">{{ t('Income') }}</span>
          <span class="stat-value">{{ formattedIncome }}</span>
        </div>
      </div>
      <div class="stat expense">
        <ArrowUpRight class="stat-icon" />
        <div class="stat-content">
          <span class="stat-label">{{ t('Expense') }}</span>
          <span class="stat-value">{{ formattedExpense }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { MoreVertical, Edit, Trash, Wallet, ArrowDownLeft, ArrowUpRight } from 'lucide-vue-next';
import * as LucideIcons from 'lucide-vue-next';
import { getCurrencySymbol } from '@/utils/currency';

const { t } = useI18n();

const props = defineProps({
  wallet: {
    type: Object,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['edit', 'delete']);

const showMenu = ref(false);

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const handleEdit = () => {
  showMenu.value = false;
  emit('edit', props.wallet);
};

const handleDelete = () => {
  showMenu.value = false;
  emit('delete', props.wallet);
};

const resolvedIcon = computed(() => {
  const iconValue = props.wallet.icon?.path || props.wallet.icon?.content || props.wallet.icon;
  if (!iconValue) return null;
  return LucideIcons[iconValue] || null;
});

const formatCurrency = (value) => {
  if (value == null) return '—';
  const symbol = getCurrencySymbol(props.wallet.currency);
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(value));
  return `${value < 0 ? '-' : ''}${formatted} ${symbol}`;
};

const formattedBalance = computed(() => formatCurrency(props.wallet.balance));
const formattedIncome = computed(() => formatCurrency(props.wallet.stats?.total_income || 0));
const formattedExpense = computed(() => formatCurrency(props.wallet.stats?.total_expense || 0));

const balanceClass = computed(() => {
  const balance = props.wallet.balance || 0;
  if (balance > 0) return 'positive';
  if (balance < 0) return 'negative';
  return '';
});

const handleClickOutside = () => {
  if (showMenu.value) {
    showMenu.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style lang="scss" scoped>
@use '~/assets/scss/_variables' as *;

.wallet-list-card {
  background: $bg-white;
  border-radius: $radius-xl;
  padding: $spacing-4;
  box-shadow: $shadow-sm;
  transition: $transition-base;
  border: 1px solid $border-light;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  min-height: 220px;

  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-2px);
    border-color: $primary-lighter;
  }

  &.is-default {
    border-color: $primary;
    background: linear-gradient(135deg, rgba(var(--color-primary-rgb), 0.03) 0%, $bg-white 100%);
  }
}

.card-actions {
  position: absolute;
  top: $spacing-2;
  right: $spacing-2;
}

.action-menu-container {
  position: relative;
}

.action-menu {
  background: transparent;
  border: none;
  padding: 0.5rem;
  border-radius: $radius-lg;
  cursor: pointer;
  color: $text-muted;
  transition: $transition-base;

  &:hover {
    background: $bg-gray;
    color: $text-secondary;
  }
}

.action-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  background: $bg-white;
  border: 1px solid $border-color;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  min-width: 7rem;
  z-index: $z-index-dropdown;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  width: 100%;
  padding: 0.5rem 0.625rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: $font-size-xs;
  color: $text-secondary;
  transition: background-color 0.2s ease;

  &:hover {
    background: $bg-gray;
  }

  &.edit {
    color: $primary;

    &:hover {
      background: $primary-light;
    }
  }

  &.delete {
    color: $error-color;

    &:hover {
      background: rgba(var(--color-error-rgb), 0.1);
    }
  }
}

.wallet-icon {
  width: 3rem;
  height: 3rem;
  border-radius: $radius-lg;
  display: flex;
  align-items: center;
  justify-content: center;
  background: $primary;
  color: white;
  margin-bottom: $spacing-2;

  svg {
    width: 1.5rem;
    height: 1.5rem;
  }
}

.wallet-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: $spacing-2;
  margin-bottom: 0.125rem;
}

.wallet-name {
  margin: 0;
  font-size: $font-size-base;
  font-weight: $font-semibold;
  color: $text-primary;
  line-height: 1.2;
}

.wallet-currency {
  font-size: $font-size-xs;
  color: $text-muted;
  margin-bottom: $spacing-2;
}

.default-badge {
  display: inline-flex;
  align-items: center;
  background: $primary;
  color: white;
  font-size: 0.55rem;
  font-weight: 700;
  padding: 2px 5px;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.balance-section {
  margin-bottom: $spacing-3;
}

.balance-label {
  display: block;
  font-size: 0.625rem;
  color: $text-muted;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.125rem;
}

.balance-amount {
  display: block;
  font-size: 1.25rem;
  font-weight: $font-bold;
  color: $text-primary;

  &.positive {
    color: $success;
  }

  &.negative {
    color: $error-color;
  }
}

.stats-section {
  display: flex;
  gap: $spacing-2;
  width: 100%;
  margin-top: auto;
  padding-top: $spacing-3;
  border-top: 1px solid $border-light;
}

.stat {
  flex: 1;
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2;
  border-radius: $radius-md;
  text-align: left;

  &.income {
    background: rgba(var(--color-success-rgb), 0.08);

    .stat-icon {
      color: $success;
    }

    .stat-value {
      color: $success;
    }
  }

  &.expense {
    background: rgba(var(--color-error-rgb), 0.08);

    .stat-icon {
      color: $error-color;
    }

    .stat-value {
      color: $error-color;
    }
  }
}

.stat-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.stat-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.stat-label {
  font-size: 0.5625rem;
  color: $text-muted;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.stat-value {
  font-size: $font-size-xs;
  font-weight: $font-semibold;
}
</style>
