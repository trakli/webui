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
  margin-bottom: $spacing-6;
}

.page-title {
  font-size: $font-size-2xl;
  font-weight: $font-bold;
  color: $text-primary;
  margin: 0 0 $spacing-2 0;
}

.page-subtitle {
  font-size: $font-size-base;
  color: $text-muted;
  margin: 0;
}

.search-filter-section {
  display: flex;
  gap: $spacing-4;
  align-items: center;
  width: 100%;
  flex-wrap: wrap;
  justify-content: space-between;
}

.search-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 86%;
}

.search-icon {
  position: absolute;
  left: $spacing-3;
  color: $text-muted;

  svg {
    width: 18px;
    height: 18px;
  }
}

.search-input {
  padding: $spacing-3 $spacing-3 $spacing-3 40px;
  border: 1px solid $border-light;
  border-radius: $radius-lg;
  font-size: $font-size-sm;
  flex: 1;
  background: $bg-white;
  transition: $transition-base;

  &:focus {
    outline: none;
    border-color: $primary;
    box-shadow: 0 0 0 3px $input-focus;
  }

  &::placeholder {
    color: $text-muted;
  }
}

.filter-container {
  display: flex;
  align-items: center;
  gap: $spacing-2;
}

.filter-icon {
  color: $text-muted;

  svg {
    width: 18px;
    height: 18px;
  }
}

.filter-dropdown {
  padding: $spacing-3 $spacing-4;
  border: 1px solid $border-light;
  border-radius: $radius-lg;
  font-size: $font-size-sm;
  background: $bg-white;
  color: $text-secondary;
  cursor: pointer;
  width: 140px;
  transition: $transition-base;

  &:focus {
    outline: none;
    border-color: $primary;
    box-shadow: 0 0 0 3px $input-focus;
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
  .search-filter-section {
    flex-direction: column;
    align-items: stretch;
  }

  .search-input {
    width: 100%;
  }

  .filter-dropdown {
    width: 100%;
  }

  .cards-grid {
    grid-template-columns: 1fr;
    gap: $spacing-4;
  }
}

@media (min-width: $breakpoint-xl) {
  .cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  }
}
</style>
