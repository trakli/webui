<template>
  <div class="party-card" :style="statusStyle">
    <div class="card-actions">
      <div class="action-menu-container" @click.stop>
        <button class="action-menu" :title="t('More actions')" @click="toggleMenu">
          <LucideMoreVertical />
        </button>
        <div v-if="showMenu" class="action-dropdown">
          <button class="dropdown-item edit" @click="handleEdit">
            <LucideEdit />
            {{ t('Edit') }}
          </button>
          <button class="dropdown-item delete" @click="handleDelete">
            <LucideTrash />
            {{ t('Delete') }}
          </button>
        </div>
      </div>
    </div>

    <div class="party-avatar">
      <component :is="resolvedIcon" />
    </div>

    <h3 class="party-name">{{ party.name }}</h3>

    <span v-if="isValidPartyType" class="party-type-badge" :class="party.type">
      {{ displayPartyType }}
    </span>

    <p v-if="party.description" class="party-description">{{ party.description }}</p>

    <div class="financial-section">
      <div class="stat-row">
        <div class="stat received">
          <LucideArrowDownLeft class="stat-icon" />
          <div class="stat-content">
            <span class="stat-label">{{ t('Received') }}</span>
            <span class="stat-value">{{ receivedDisplay }}</span>
          </div>
        </div>
        <div class="stat spent">
          <LucideArrowUpRight class="stat-icon" />
          <div class="stat-content">
            <span class="stat-label">{{ t('Spent') }}</span>
            <span class="stat-value">{{ spentDisplay }}</span>
          </div>
        </div>
      </div>

      <div v-if="party.receivedAmount > 0 || party.spentAmount > 0" class="last-activity">
        <LucideClock class="clock-icon" />
        <span>{{ t('Last activity') }}: {{ formatLastUpdated(party.lastUpdated) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import {
  MoreVertical as LucideMoreVertical,
  ArrowDownLeft as LucideArrowDownLeft,
  ArrowUpRight as LucideArrowUpRight,
  Clock as LucideClock,
  Edit as LucideEdit,
  Trash as LucideTrash
} from 'lucide-vue-next';
import * as LucideIcons from 'lucide-vue-next';

const { t } = useI18n();

const props = defineProps({
  party: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['menu', 'edit', 'delete', 'view']);

const showMenu = ref(false);

const toggleMenu = () => {
  showMenu.value = !showMenu.value;
};

const handleEdit = () => {
  showMenu.value = false;
  emit('edit', props.party);
};

const handleDelete = () => {
  showMenu.value = false;
  emit('delete', props.party);
};

// Click outside handler to close dropdown
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

// Analysis:
// - $error-color is a SCSS variable, not available in JS at runtime.
// - We cannot directly import SCSS variables into JS, but we can hardcode the value from _variables.scss.
// - $error-color in _variables.scss is #dc2626.
// - Instead of using blue (#3b82f6) for "spent > received", we will use #dc2626 and treat it as the error color.
// - For primary, we can still use the fallback hex (#047844) as before, since $primary is also #047844 in _variables.scss.

const validPartyTypes = ['individual', 'business', 'organization', 'vendor', 'client'];

const isValidPartyType = computed(() => {
  return validPartyTypes.includes(props.party.type?.toLowerCase());
});

const displayPartyType = computed(() => {
  const type = props.party.type?.toLowerCase();
  const map = {
    individual: 'Individual',
    business: 'Business',
    organization: 'Organization',
    vendor: 'Vendor',
    client: 'Client'
  };

  const labelKey = map[type];
  return labelKey ? t(labelKey) : props.party.type;
});

const receivedDisplay = computed(() => `$${props.party.receivedAmount}`);
const spentDisplay = computed(() => `$${props.party.spentAmount}`);

const statusStyle = computed(() => {
  const received = Number(props.party.receivedAmount || 0);
  const spent = Number(props.party.spentAmount || 0);

  // Use $primary and $error-color from _variables.scss directly as hex values
  const primary = '#047844'; // $primary
  const errorColor = '#dc2626'; // $error-color
  const neutral = '#b0b8b4';

  let stripColor = neutral;
  let accentBg = neutral;

  if (received > spent) {
    stripColor = primary;
    accentBg = primary;
  } else if (spent > received) {
    stripColor = errorColor;
    accentBg = errorColor;
  }

  return {
    '--party-strip-color': stripColor,
    '--party-accent-bg': accentBg
  };
});

const resolvedIcon = computed(() => {
  // Extract icon value - could be from icon.path, icon.content, or direct string
  let iconValue = '';
  if (props.party.icon) {
    if (typeof props.party.icon === 'string') {
      iconValue = props.party.icon;
    } else if (props.party.icon.path) {
      iconValue = props.party.icon.path;
    } else if (props.party.icon.content) {
      iconValue = props.party.icon.content;
    }
  }

  if (!iconValue) {
    // Default icons based on party type
    return props.party.type === 'individual' ? LucideIcons.User : LucideIcons.Building2;
  }

  // Try to get the icon from Lucide icons library
  const iconComponent = LucideIcons[iconValue];

  if (iconComponent) {
    return iconComponent;
  }

  // If not found, try to find a similar icon by searching through available icons
  const availableIcons = Object.keys(LucideIcons);
  const similarIcon = availableIcons.find(
    (iconName) =>
      iconName.toLowerCase().includes(iconValue.toLowerCase()) ||
      iconValue.toLowerCase().includes(iconName.toLowerCase())
  );

  if (similarIcon) {
    return LucideIcons[similarIcon];
  }

  // Fallback to default icons based on party type
  return props.party.type === 'individual' ? LucideIcons.User : LucideIcons.Building2;
});

const formatLastUpdated = (timestamp) => {
  if (!timestamp) return t('{count}h ago', { count: 1 });

  const now = new Date();
  const updated = new Date(timestamp);
  const diffMs = now - updated;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));

  if (diffMins < 60) return t('{count}m ago', { count: diffMins });
  if (diffHours < 24) return t('{count}h ago', { count: diffHours });
  if (diffDays < 7) return t('{count}d ago', { count: diffDays });
  return t('{count}w ago', { count: diffWeeks });
};
</script>

<style lang="scss" scoped>
@use '~/assets/scss/_variables' as *;

.party-card {
  background: $bg-white;
  border-radius: $radius-xl;
  padding: $spacing-4;
  box-shadow: $shadow-sm;
  transition: $transition-base;
  border: 1px solid $border-light;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-height: 280px;

  &:hover {
    box-shadow: $shadow-md;
    transform: translateY(-2px);
    border-color: $border-medium;
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

  svg {
    width: 1rem;
    height: 1rem;
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
  min-width: 8rem;
  z-index: $z-index-dropdown;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: $font-size-sm;
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
      background: rgba($error-color, 0.1);
    }
  }

  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
}

.party-avatar {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--party-accent-bg, $border-medium);
  color: $bg-white;
  margin-bottom: $spacing-3;

  svg {
    width: 2rem;
    height: 2rem;
  }
}

.party-name {
  margin: 0 0 $spacing-1 0;
  font-size: $font-size-lg;
  font-weight: $font-semibold;
  color: $text-primary;
  line-height: 1.2;
}

.party-type-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: $font-size-xs;
  font-weight: $font-medium;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: var(--party-accent-bg, $border-medium);
  color: $bg-white;
  margin-bottom: $spacing-2;
}

.party-description {
  margin: 0 0 $spacing-3 0;
  color: $text-muted;
  font-size: $font-size-sm;
  line-height: 1.4;
  max-width: 100%;
}

.financial-section {
  width: 100%;
  margin-top: auto;
  padding-top: $spacing-3;
  border-top: 1px solid $border-light;
}

.stat-row {
  display: flex;
  gap: $spacing-2;
  margin-bottom: $spacing-2;
}

.stat {
  flex: 1;
  display: flex;
  align-items: center;
  gap: $spacing-2;
  padding: $spacing-2;
  border-radius: $radius-md;
  text-align: left;

  &.received {
    background: rgba($success, 0.08);

    .stat-icon {
      color: $success;
    }

    .stat-value {
      color: $success;
    }
  }

  &.spent {
    background: rgba($error-color, 0.08);

    .stat-icon {
      color: $error-color;
    }

    .stat-value {
      color: $error-color;
    }
  }
}

.stat-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.stat-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.stat-label {
  font-size: 0.625rem;
  color: $text-muted;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.stat-value {
  font-size: $font-size-sm;
  font-weight: $font-semibold;
}

.last-activity {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  font-size: $font-size-xs;
  color: $text-muted;

  .clock-icon {
    width: 0.75rem;
    height: 0.75rem;
  }
}
</style>
