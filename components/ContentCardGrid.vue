<template>
  <div class="card-grid">
    <div
      v-for="entity in entities"
      :key="entity.id"
      class="entity-card"
      :class="{ 'is-default': String(entity.id) === defaultItemId }"
    >
      <div class="card-header">
        <div class="entity-info">
          <div v-if="getIcon(entity)" class="entity-icon">
            <component :is="getIcon(entity)" />
          </div>
          <div class="entity-details">
            <h3 class="entity-name">{{ entity.name }}</h3>
            <span v-if="String(entity.id) === defaultItemId" class="default-badge">
              {{ t('Default') }}
            </span>
          </div>
        </div>
        <div class="card-actions">
          <div class="action-menu-container" @click.stop>
            <button class="action-menu" :title="t('More actions')" @click="toggleMenu(entity.id)">
              <MoreVertical :size="16" />
            </button>
            <div v-if="openMenuId === entity.id" class="action-dropdown">
              <button class="dropdown-item edit" @click="handleEdit(entity)">
                <Edit :size="14" />
                {{ t('Edit') }}
              </button>
              <button class="dropdown-item delete" @click="handleDelete(entity)">
                <Trash :size="14" />
                {{ t('Delete') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="entity.description" class="card-description">
        {{ entity.description }}
      </div>

      <div v-if="cardFields && cardFields.length > 0" class="card-fields">
        <div v-for="field in cardFields" :key="field.key" class="field-row">
          <span class="field-label">{{ t(field.label) }}</span>
          <span class="field-value" :class="field.class">
            <template v-if="field.render">
              {{ field.render(entity[field.key], entity) }}
            </template>
            <template v-else>
              {{ getCellValue(entity, field.key) }}
            </template>
          </span>
        </div>
      </div>
    </div>

    <div v-if="entities.length === 0" class="empty-state">
      <p>{{ t('No items found.') }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { MoreVertical, Edit, Trash } from 'lucide-vue-next';
import * as LucideIcons from 'lucide-vue-next';

const { t } = useI18n();

defineProps({
  entities: {
    type: Array,
    default: () => []
  },
  cardFields: {
    type: Array,
    default: () => []
  },
  defaultItemId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['edit', 'delete']);

const openMenuId = ref(null);

const toggleMenu = (id) => {
  openMenuId.value = openMenuId.value === id ? null : id;
};

const handleEdit = (entity) => {
  openMenuId.value = null;
  emit('edit', entity);
};

const handleDelete = (entity) => {
  openMenuId.value = null;
  emit('delete', entity);
};

const getIcon = (entity) => {
  const iconValue = entity.icon?.path || entity.icon?.content || entity.icon;
  if (!iconValue) return null;
  return LucideIcons[iconValue] || LucideIcons.Box;
};

const getCellValue = (entity, key) => {
  if (key.includes('.')) {
    return key.split('.').reduce((obj, k) => obj?.[k], entity) ?? '';
  }
  return entity[key] ?? '';
};

const handleClickOutside = () => {
  if (openMenuId.value !== null) {
    openMenuId.value = null;
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

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: $spacing-3;
  width: 100%;
}

.entity-card {
  background: $bg-white;
  border-radius: $radius-lg;
  padding: $spacing-3;
  box-shadow: $shadow-sm;
  transition: $transition-base;
  border-left: 3px solid $border-medium;

  &:hover {
    box-shadow: $shadow-md;
  }

  &.is-default {
    border-left-color: $primary;
    background: rgba($success, 0.04);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: $spacing-2;
}

.entity-info {
  display: flex;
  align-items: center;
  gap: $spacing-2;
  flex: 1;
  min-width: 0;
}

.entity-icon {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: rgba($primary, 0.1);
  color: $primary;

  svg {
    width: 1rem;
    height: 1rem;
  }
}

.entity-details {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.entity-name {
  margin: 0;
  font-size: $font-size-base;
  font-weight: $font-semibold;
  color: $text-primary;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.default-badge {
  display: inline-flex;
  align-items: center;
  background: $primary;
  color: white;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
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
      background: $bg-light;
    }
  }
}

.card-description {
  color: $text-muted;
  font-size: $font-size-xs;
  line-height: 1.4;
  margin-bottom: $spacing-2;
}

.card-fields {
  border-top: 1px solid $border-light;
  padding-top: $spacing-2;
  margin-top: $spacing-2;
}

.field-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.25rem 0;
  font-size: $font-size-xs;

  &:not(:last-child) {
    border-bottom: 1px dashed $border-light;
    padding-bottom: 0.375rem;
    margin-bottom: 0.25rem;
  }
}

.field-label {
  color: $text-muted;
  font-weight: $font-medium;
}

.field-value {
  color: $text-primary;
  font-weight: $font-semibold;

  &.positive {
    color: $success;
  }

  &.negative {
    color: $error-color;
  }
}

.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: $spacing-8;
  color: $text-muted;
}

@media (max-width: $breakpoint-md) {
  .card-grid {
    grid-template-columns: 1fr;
    gap: $spacing-2;
  }
}
</style>
