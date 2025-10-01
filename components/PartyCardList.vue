<template>
  <div class="party-card-list">
    <!-- Header Section -->
    <div class="list-header">
      <div class="header-content">
        <div class="header-text">
          <h2 class="page-title">All Parties</h2>
          <p class="page-subtitle">View transaction history and financial relationships.</p>
        </div>
      </div>

      <!-- Search and Filter Section -->
      <div class="search-filter-section">
        <div class="search-container">
          <div class="search-icon">
            <LucideSearch />
          </div>
          <input
            v-model="searchQuery"
            type="text"
            class="search-input"
            placeholder="Search financial contacts..."
            @input="handleSearch"
          />
        </div>

        <div class="filter-container">
          <div class="filter-icon">
            <LucideFilter />
          </div>
          <select v-model="selectedFilter" class="filter-dropdown" @change="handleFilter">
            <option value="all">All Types</option>
            <option value="individual">Individual</option>
            <option value="company">Company</option>
          </select>
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
    filtered = filtered.filter((party) => party.partyType === selectedFilter.value);
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

const handleMenu = (party) => {
  // Emit menu event for parent to handle
  // This could open a dropdown menu or context menu
  console.log('Menu clicked for party:', party);
};
</script>

<style lang="scss" scoped>
@use '~/assets/scss/_variables' as *;

.party-card-list {
  width: 100%;
}

.list-header {
  margin-bottom: $spacing-8;
}

.header-content {
  margin-bottom: $spacing-6;
}

.header-text {
  text-align: left;
  margin-bottom: $spacing-4;

  @media (max-width: $breakpoint-sm) {
    margin-bottom: $spacing-3;
  }
}

.page-title {
  font-size: $font-size-2xl;
  font-weight: $font-bold;
  color: $text-primary;
  margin: 0 0 $spacing-2 0;

  @media (max-width: $breakpoint-md) {
    font-size: $font-size-xl;
  }

  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-lg;
  }
}

.page-subtitle {
  font-size: $font-size-base;
  color: $text-muted;
  margin: 0;
  line-height: 1.5;

  @media (max-width: $breakpoint-sm) {
    font-size: $font-size-sm;
  }
}

.search-filter-section {
  display: flex;
  gap: $spacing-4;
  align-items: center;
  width: 100%;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: $spacing-2;

  @media (max-width: $breakpoint-md) {
    flex-direction: column;
    align-items: stretch;
    gap: $spacing-3;
  }
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  width: 86%;
  @media (max-width: $breakpoint-md) {
    max-width: 100%;
    width: 100%;
  }
}

.search-icon {
  position: absolute;
  left: $spacing-3;
  color: $text-muted;
  z-index: 1;
  pointer-events: none;

  svg {
    width: 18px;
    height: 18px;
  }
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1.5px solid $border-light;
  border-radius: 12px;
  font-size: $font-size-sm;
  background: $bg-white;
  color: $text-primary;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  &:focus {
    outline: none;
    border-color: $primary;
    box-shadow:
      0 0 0 3px rgba(34, 197, 94, 0.1),
      0 2px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }

  &:hover {
    border-color: darken($border-light, 10%);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  }

  &::placeholder {
    color: $text-muted;
    font-weight: 400;
  }

  @media (max-width: $breakpoint-sm) {
    padding: 10px 14px 10px 40px;
    font-size: $font-size-xs;
  }
}

.filter-container {
  position: relative;
  display: flex;
  align-items: center;
  min-width: 160px;

  @media (max-width: $breakpoint-md) {
    width: 100%;
  }
}

.filter-icon {
  position: absolute;
  left: $spacing-3;
  color: $text-muted;
  z-index: 1;
  pointer-events: none;

  svg {
    width: 16px;
    height: 16px;
  }
}

.filter-dropdown {
  width: 100%;
  padding: 12px 16px 12px 44px;
  border: 1.5px solid $border-light;
  border-radius: 12px;
  font-size: $font-size-sm;
  background: $bg-white;
  color: $text-secondary;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px;

  &:focus {
    outline: none;
    border-color: $primary;
    box-shadow:
      0 0 0 3px rgba(34, 197, 94, 0.1),
      0 2px 8px rgba(0, 0, 0, 0.15);
    transform: translateY(-1px);
  }

  &:hover {
    border-color: darken($border-light, 10%);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.12);
  }

  @media (max-width: $breakpoint-sm) {
    padding: 10px 14px 10px 40px;
    font-size: $font-size-xs;
  }
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: $spacing-6;
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
    gap: $spacing-4;
  }

  .page-title {
    font-size: $font-size-xl;
  }

  .page-subtitle {
    font-size: $font-size-sm;
  }
}

@media (min-width: $breakpoint-xl) {
  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  }
}
</style>
