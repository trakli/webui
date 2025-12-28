<template>
  <div class="party-card" :style="statusStyle">
    <div class="card-header">
      <div class="party-info">
        <div class="party-icon" :class="party.type">
          <component :is="resolvedIcon" />
        </div>
        <div class="party-details">
          <h3 class="party-name">{{ party.name }}</h3>
          <span class="party-type-badge" :class="party.type">
            {{ party.type }}
          </span>
        </div>
      </div>
      <div class="card-actions">
        <div class="action-menu-container" @click.stop>
          <button class="action-menu" title="More actions" @click="toggleMenu">
            <LucideMoreVertical />
          </button>

          <div v-if="showMenu" class="action-dropdown">
            <button class="dropdown-item edit" @click="handleEdit">
              <LucideEdit />
              Edit
            </button>
            <button class="dropdown-item delete" @click="handleDelete">
              <LucideTrash />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="card-description">
      {{ party.description }}
    </div>

    <div class="financial-insights">
      <h4 class="insights-header">FINANCIAL INSIGHTS</h4>

      <div class="insight-row received">
        <div class="insight-icon">
          <LucideArrowUp />
        </div>
        <div class="insight-text">
          Received <span class="amount">${{ party.receivedAmount || 0 }}</span> from
          {{ party.name }} in the last 3 months
        </div>
      </div>

      <div class="insight-row spent">
        <div class="insight-icon">
          <LucideArrowDown />
        </div>
        <div class="insight-text">
          Spent <span class="amount">${{ party.spentAmount || 0 }}</span> on transactions pertaining
          to {{ party.name }}
        </div>
      </div>

      <div class="last-updated">
        <div class="insight-icon">
          <LucideClock />
        </div>
        <span class="update-time">{{ formatLastUpdated(party.lastUpdated) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue';
import {
  MoreVertical as LucideMoreVertical,
  ArrowUp as LucideArrowUp,
  ArrowDown as LucideArrowDown,
  Clock as LucideClock,
  Edit as LucideEdit,
  Trash as LucideTrash
} from 'lucide-vue-next';
import * as LucideIcons from 'lucide-vue-next';

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
  if (!timestamp) return '1h ago';

  const now = new Date();
  const updated = new Date(timestamp);
  const diffMs = now - updated;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffWeeks = Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${diffWeeks}w ago`;
};
</script>

<style lang="scss" scoped>
@use '~/assets/scss/_variables' as *;

.party-card {
  background: $bg-white;
  border-radius: $radius-lg;
  padding: $spacing-3;
  box-shadow: $shadow-sm;
  transition: $transition-base;
  border-left: 3px solid var(--party-strip-color, $border-medium);
  cursor: pointer;

  &:hover {
    box-shadow: $shadow-md;
  }
}

/* Colors adapt via CSS vars from script */
.party-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: var(--party-accent-bg, $border-medium);
  color: $bg-white;

  svg {
    width: 1rem;
    height: 1rem;
  }
}

.party-type-badge {
  display: inline-block;
  padding: 0.125rem 0.5rem;
  border-radius: 0.75rem;
  font-size: 0.6875rem;
  font-weight: $font-medium;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  width: fit-content;
  background: var(--party-accent-bg, $border-medium);
  color: $bg-white;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $spacing-2;
}

.party-info {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  flex: 1;
}

.party-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.party-name {
  margin: 0;
  font-size: $font-size-base;
  font-weight: $font-semibold;
  color: #1f2937;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-actions {
  flex-shrink: 0;
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
  border-radius: $radius-xl;
  box-shadow: $shadow-md;
  min-width: 8.75rem;
  z-index: $z-index-dropdown;
  overflow: hidden;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.625rem 0.75rem;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: $font-size-sm;
  color: $text-secondary;
  transition: background-color 0.2s ease;

  &:hover {
    background: $bg-gray;
  }

  &:first-child {
    border-top-left-radius: $radius-xl;
    border-top-right-radius: $radius-xl;
  }

  &:last-child {
    border-bottom-left-radius: $radius-xl;
    border-bottom-right-radius: $radius-xl;
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
      background: $bg-light;
    }
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
}

.card-description {
  color: $text-muted;
  font-size: $font-size-xs;
  line-height: 1.4;
  margin-bottom: $spacing-2;
}

.financial-insights {
  .insights-header {
    font-size: 0.625rem;
    font-weight: $font-medium;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 0.375rem 0;
  }
}

.insight-row {
  display: flex;
  align-items: flex-start;
  gap: 0.375rem;
  margin-bottom: 0.25rem;

  &.received {
    .insight-icon {
      color: $primary;
    }

    .amount {
      color: $primary;
      font-weight: $font-medium;
    }
  }

  &.spent {
    .insight-icon {
      color: $error-color;
    }

    .amount {
      color: $error-color;
      font-weight: $font-medium;
    }
  }
}

.insight-icon {
  flex-shrink: 0;
  margin-top: 0.125rem;

  svg {
    width: 0.875rem;
    height: 0.875rem;
  }
}

.insight-text {
  font-size: $font-size-xs;
  color: $text-muted;
  line-height: 1.3;
  flex: 1;
}

.last-updated {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  margin-top: 0.375rem;

  .insight-icon {
    color: #9ca3af;
  }

  .update-time {
    font-size: 0.625rem;
    color: #9ca3af;
  }
}
</style>
