<template>
  <div class="party-card" :class="party.partyType">
    <div class="card-header">
      <div class="party-info">
        <div class="party-icon" :class="party.partyType">
          <component :is="resolvedIcon" />
        </div>
        <div class="party-details">
          <h3 class="party-name">{{ party.name }}</h3>
          <span class="party-type-badge" :class="party.partyType">
            {{ party.partyType }}
          </span>
        </div>
      </div>
      <div class="card-actions">
        <div class="action-menu-container" @click.stop>
          <button class="action-menu" @click="toggleMenu" title="More actions">
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

const resolvedIcon = computed(() => {
  if (!props.party.icon) {
    // Default icons based on party type
    return props.party.partyType === 'individual' ? LucideIcons.User : LucideIcons.Building2;
  }

  // Try to get the icon from Lucide icons library
  let iconComponent = LucideIcons[props.party.icon];

  if (iconComponent) {
    return iconComponent;
  }

  // If not found, try to find a similar icon by searching through available icons
  const availableIcons = Object.keys(LucideIcons);
  const similarIcon = availableIcons.find(
    (iconName) =>
      iconName.toLowerCase().includes(props.party.icon.toLowerCase()) ||
      props.party.icon.toLowerCase().includes(iconName.toLowerCase())
  );

  if (similarIcon) {
    return LucideIcons[similarIcon];
  }

  // Fallback to default icons based on party type
  return props.party.partyType === 'individual' ? LucideIcons.User : LucideIcons.Building2;
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

// Custom variables for this file
$party-individual: #3b82f6;
$party-company: $primary;
$party-edit: $primary-hover;
$party-edit-hover: $primary-light;
$party-delete: $error-color;
$party-delete-hover: $bg-light;
$party-card-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.1);
$party-card-shadow-hover: 0 0.25rem 1rem rgba(0, 0, 0, 0.15);
$party-card-radius: $radius-xl;
$party-card-padding: $spacing-6;
$party-card-border-width: 0.25rem; // 4px
$party-card-action-radius: $radius-lg;
$party-card-action-dropdown-radius: $radius-xl;
$party-card-action-dropdown-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.15);

.party-card {
  background: $bg-white;
  border-radius: $party-card-radius;
  padding: $party-card-padding;
  box-shadow: $party-card-shadow;
  transition: $transition-base;
  border-top: $party-card-border-width solid;
  cursor: pointer;

  &:hover {
    transform: translateY(-0.125rem);
    box-shadow: $party-card-shadow-hover;
  }

  &.individual {
    border-top-color: $party-individual;

    .party-icon {
      background: $party-individual;
      color: $bg-white;
    }

    .party-type-badge {
      background: $party-individual;
      color: $bg-white;
    }
  }

  &.company {
    border-top-color: $party-company;

    .party-icon {
      background: $party-company;
      color: $bg-white;
    }

    .party-type-badge {
      background: $party-company;
      color: $bg-white;
    }
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $spacing-4;
}

.party-info {
  display: flex;
  align-items: center;
  gap: $spacing-3;
  flex: 1;
}

.party-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;

  svg {
    width: 1.25rem;
    height: 1.25rem;
  }
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
  color: #1f2937; // Not in variables, so keep as is
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  border-radius: $party-card-action-radius;
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
  border-radius: $party-card-action-dropdown-radius;
  box-shadow: $party-card-action-dropdown-shadow;
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
    border-top-left-radius: $party-card-action-dropdown-radius;
    border-top-right-radius: $party-card-action-dropdown-radius;
  }

  &:last-child {
    border-bottom-left-radius: $party-card-action-dropdown-radius;
    border-bottom-right-radius: $party-card-action-dropdown-radius;
  }

  &.edit {
    color: $party-edit;

    &:hover {
      background: $party-edit-hover;
    }
  }

  &.delete {
    color: $party-delete;

    &:hover {
      background: $party-delete-hover;
    }
  }

  svg {
    width: 1rem;
    height: 1rem;
  }
}

.card-description {
  color: $text-muted;
  font-size: $font-size-sm;
  line-height: 1.4;
  margin-bottom: $spacing-5;
  min-height: 2.5rem;
}

.financial-insights {
  .insights-header {
    font-size: 0.6875rem;
    font-weight: $font-semibold;
    color: #9ca3af; // Not in variables, so keep as is
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 0.75rem 0;
  }
}

.insight-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.5rem;

  &.received {
    .insight-icon {
      color: $party-company;
    }

    .amount {
      color: $party-company;
      font-weight: $font-semibold;
    }
  }

  &.spent {
    .insight-icon {
      color: $party-delete;
    }

    .amount {
      color: $party-delete;
      font-weight: $font-semibold;
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
  font-size: 0.8125rem;
  color: $text-muted;
  line-height: 1.3;
  flex: 1;
}

.last-updated {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;

  .insight-icon {
    color: #9ca3af; // Not in variables, so keep as is
  }

  .update-time {
    font-size: 0.75rem;
    color: #9ca3af; // Not in variables, so keep as is
  }
}
</style>
