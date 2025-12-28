<template>
  <div class="party-card-list">
    <div class="list-header">
      <div class="header-row">
        <h2 class="page-title">All Parties</h2>
        <div class="search-filter-section">
          <div class="search-container">
            <LucideSearch class="search-icon" />
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              placeholder="Search..."
              @input="handleSearch"
            />
          </div>
          <div class="filter-container">
            <select v-model="selectedFilter" class="filter-dropdown" @change="handleFilter">
              <option value="all">All</option>
              <option value="individual">Individual</option>
              <option value="company">Company</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="cards-grid">
      <PartyCard
        v-for="party in filteredParties"
        :key="party.id"
        :party="party"
        @menu="handleMenu"
        @edit="$emit('edit', party)"
        @delete="$emit('delete', party)"
        @view="$emit('view', party)"
      />
    </div>

    <div v-if="filteredParties.length === 0" class="empty-state">
      <p v-if="parties.length === 0">No parties found. Create your first party to get started.</p>
      <p v-else>No parties match your search criteria. Try adjusting your search or filters.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { Search as LucideSearch, Filter as LucideFilter } from 'lucide-vue-next';
import PartyCard from './PartyCard.vue';

const props = defineProps({
  parties: {
    type: Array,
    default: () => []
  }
});

defineEmits(['edit', 'delete', 'view', 'menu']);

// Search and filter state
const searchQuery = ref('');
const selectedFilter = ref('all');
const debouncedSearchQuery = ref('');

// Debounced search for better performance
let searchTimeout;
watch(searchQuery, (newQuery) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    debouncedSearchQuery.value = newQuery;
  }, 300);
});

// Computed filtered parties
const filteredParties = computed(() => {
  let filtered = props.parties;

  // Apply type filter
  if (selectedFilter.value !== 'all') {
    filtered = filtered.filter((party) => party.type === selectedFilter.value);
  }

  // Apply search filter
  if (debouncedSearchQuery.value.trim()) {
    const query = debouncedSearchQuery.value.toLowerCase().trim();
    filtered = filtered.filter(
      (party) =>
        party.name.toLowerCase().includes(query) || party.description.toLowerCase().includes(query)
    );
  }

  return filtered;
});

// Search handler
const handleSearch = () => {
  // Search is handled reactively through computed property
};

// Filter handler
const handleFilter = () => {
  // Filter is handled reactively through computed property
};

const handleMenu = (_party) => {
  // Emit menu event for parent to handle
  // This could open a dropdown menu or context menu
};
</script>

<style lang="scss" scoped>
@use '~/assets/scss/_variables' as *;
@use 'sass:color';

.party-card-list {
  width: 100%;
}

.list-header {
  margin-bottom: $spacing-3;
}

.header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: $spacing-3;

  @media (max-width: $breakpoint-sm) {
    flex-direction: column;
    align-items: stretch;
    gap: $spacing-2;
  }
}

.page-title {
  font-size: $font-size-base;
  font-weight: $font-medium;
  color: $text-primary;
  margin: 0;
  white-space: nowrap;
}

.search-filter-section {
  display: flex;
  gap: $spacing-2;
  align-items: center;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 8px;
  color: $text-muted;
  width: 14px;
  height: 14px;
  pointer-events: none;
}

.search-input {
  width: 160px;
  padding: 6px 10px 6px 28px;
  border: 1px solid $border-light;
  border-radius: $radius-md;
  font-size: $font-size-xs;
  background: $bg-white;
  color: $text-primary;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: $primary;
    width: 200px;
  }

  &::placeholder {
    color: $text-muted;
  }

  @media (max-width: $breakpoint-sm) {
    width: 100%;

    &:focus {
      width: 100%;
    }
  }
}

.filter-container {
  display: flex;
  align-items: center;
}

.filter-dropdown {
  padding: 6px 24px 6px 10px;
  border: 1px solid $border-light;
  border-radius: $radius-md;
  font-size: $font-size-xs;
  background: $bg-white;
  color: $text-secondary;
  cursor: pointer;
  transition: all 0.2s ease;
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 6px center;
  background-repeat: no-repeat;
  background-size: 14px;

  &:focus {
    outline: none;
    border-color: $primary;
  }
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: $spacing-3;
  width: 100%;
}

.empty-state {
  text-align: center;
  padding: $spacing-12 $spacing-6;
  color: $text-muted;
  font-size: $font-size-base;
}

@media (max-width: $breakpoint-md) {
  .cards-grid {
    grid-template-columns: 1fr;
    gap: $spacing-2;
  }
}

@media (min-width: $breakpoint-xl) {
  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}
</style>
