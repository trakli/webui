<template>
  <div class="entity-content">
    <ContentTopCard :pageName="pageName" :pageNamePlural="pageNamePlural" @add="handleFormToggle" />
    <div class="content-area">
      <div v-if="showForm" class="form-section">
        <div class="form-wrapper">
          <component
            :is="currentForm"
            :pageName="pageName"
            :editingItem="editingItem"
            @created="handleCreate"
            @updated="handleUpdate"
            @close="handleFormClose"
          />
        </div>
        <TipsSection v-if="isGroupsPage" :pageName="pageName" />
      </div>
      <EmptyState
        v-if="items.length === 0 && !showForm"
        :pageName="pageName"
        @create="handleFormToggle"
      />
      <!-- Party Cards View -->
      <PartyCardList
        v-if="items.length > 0 && isPartiesPage"
        :parties="items"
        @edit="handleEdit"
        @delete="handleDelete"
        @view="handleView"
        @menu="handleMenu"
      />

      <!-- Regular Table View for other pages -->
      <ContentTable
        v-if="items.length > 0 && !isPartiesPage"
        :pageName="pageName"
        :pageNamePlural="pageNamePlural"
        :entities="items"
        @edit="handleEdit"
        @delete="handleDelete"
        @item-add-complete="handleFormClose"
      />
    </div>
    <div class="footer-section">
      <TFooter />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, toRefs, nextTick } from 'vue';
import ContentTopCard from './TTopCard.vue';
import EmptyState from './EmptyState.vue';
import CategoryForm from './categories/CategoryForm.vue';
import GroupForm from './groups/GroupForm.vue';
import PartyForm from './PartiesForm.vue';
import WalletForm from './WalletForm.vue';
import ContentTable from './ContentTable.vue';
import PartyCardList from './PartyCardList.vue';
import TipsSection from './TipsSection.vue';
import TFooter from '@/components/TFooter.vue';

const props = defineProps({
  pageName: {
    type: String,
    required: true
  },
  pageNamePlural: {
    type: String,
    required: true
  }
});

// Destructure props to use them in the setup function
const { pageName, pageNamePlural } = toRefs(props);

const showForm = ref(false);
const items = ref([]);
const editingItem = ref(null);
let lastClickTime = 0;

// Sample data for parties page demonstration
const sampleParties = [
  {
    id: '1',
    name: 'John Smith',
    partyType: 'individual',
    icon: 'User',
    description: 'Regular client with monthly payment schedule',
    receivedAmount: 520,
    spentAmount: 180,
    lastUpdated: new Date(Date.now() - 2 * 60 * 1000)
  },
  {
    id: '2',
    name: 'Sarah Johnson',
    partyType: 'individual',
    icon: 'UserCheck',
    description: 'Contractor with bi-weekly invoices',
    receivedAmount: 1250,
    spentAmount: 0,
    lastUpdated: new Date(Date.now() - 60 * 60 * 1000)
  },
  {
    id: '3',
    name: 'Acme Corporation',
    partyType: 'company',
    icon: 'Building2',
    description: 'Primary vendor for office supplies and services',
    receivedAmount: 0,
    spentAmount: 3750,
    lastUpdated: new Date(Date.now() - 3 * 60 * 60 * 1000)
  },
  {
    id: '4',
    name: 'Tech Innovators LLC',
    partyType: 'company',
    icon: 'Rocket',
    description: 'Software subscription and IT services',
    receivedAmount: 0,
    spentAmount: 899,
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  },
  {
    id: '5',
    name: 'Michael Brown',
    partyType: 'individual',
    icon: 'Star',
    description: 'Investor with quarterly dividend payments',
    receivedAmount: 4200,
    spentAmount: 1500,
    lastUpdated: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  },
  {
    id: '6',
    name: 'Global Enterprises Inc',
    partyType: 'company',
    icon: 'Globe',
    description: 'International client with foreign currency transactions',
    receivedAmount: 8700,
    spentAmount: 2300,
    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
  }
];

// Initialize with sample data for parties page
if (props.pageName === 'Party') {
  items.value = sampleParties;
}

const isGroupsPage = computed(() => props.pageName === 'Group');
const isPartiesPage = computed(() => props.pageName === 'Party');

const formMap = {
  Category: CategoryForm,
  Group: GroupForm,
  Party: PartyForm,
  Wallet: WalletForm
};

const currentForm = computed(() => formMap[props.pageName]);

const handleFormToggle = () => {
  const now = Date.now();
  // Only open the form if it's currently closed. Do not toggle.
  if (now - lastClickTime > 300 && !showForm.value) {
    editingItem.value = null; // Clear any existing editing item
    showForm.value = true;
    lastClickTime = now;

    // Scroll to the form after a brief delay to ensure it's rendered
    nextTick(() => {
      const formSection = document.querySelector('.form-section');
      if (formSection) {
        formSection.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest'
        });
      }
    });
  }
};

const handleFormClose = () => {
  showForm.value = false;
  editingItem.value = null; // Clear editing item when form closes
};

const handleCreate = (newItem) => {
  const itemWithId = {
    ...newItem,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    // Add party-specific fields if this is a party
    ...(props.pageName === 'Party' && {
      receivedAmount: Math.floor(Math.random() * 5000),
      spentAmount: Math.floor(Math.random() * 3000),
      lastUpdated: new Date()
    })
  };
  items.value.push(itemWithId);
  // Auto-close form after successful creation
  handleFormClose();
};

const handleEdit = (itemToEdit) => {
  console.log('Edit clicked:', itemToEdit);

  // 1. Set the editing item so the form knows what to populate
  editingItem.value = { ...itemToEdit };

  // 2. Show the form immediately
  showForm.value = true;

  // 3. Scroll to the form after a brief delay to ensure it's rendered
  nextTick(() => {
    const formSection = document.querySelector('.form-section');
    if (formSection) {
      formSection.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  });
};

const handleUpdate = (updatedItem) => {
  const index = items.value.findIndex((item) => item.id === updatedItem.id);
  if (index !== -1) {
    // For parties, preserve the additional fields that cards need
    if (props.pageName === 'Party') {
      const existingItem = items.value[index];
      items.value[index] = {
        ...existingItem,
        ...updatedItem,
        // Preserve party-specific fields
        receivedAmount: existingItem.receivedAmount,
        spentAmount: existingItem.spentAmount,
        lastUpdated: existingItem.lastUpdated
      };
    } else {
      // Replace the old item with the updated one for other pages
      items.value[index] = { ...updatedItem };
    }
  }
  // Close the form after update
  handleFormClose();
};

const handleDelete = (itemToDelete) => {
  items.value = items.value.filter((item) => item.id !== itemToDelete.id);
};

const handleView = (item) => {
  console.log('View clicked:', item);
  // In a real app, this would navigate to a detail page or open a modal
};

const handleMenu = (item) => {
  console.log('Menu clicked:', item);
  // In a real app, this would open a context menu or dropdown
};
</script>

<style lang="scss" scoped>
@use '~/assets/scss/_variables' as *;

.entity-content {
  width: calc(100% - 0.5rem);
  max-width: 1400px;
  min-height: 100vh;
  background-color: $bg-white;
  border-radius: 2rem;
  border: 1px solid $bg-gray;
  margin: 0 1.5rem 1rem;
  padding: 1.5rem;
  box-sizing: border-box;
  overflow: hidden;

  @media (min-width: 768px) {
    padding: 1.25rem;
  }
}

.content-area {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  width: 100%;
}

.form-section {
  display: flex;
  justify-content: space-between;
  gap: 3rem;
  width: 100%;
  max-width: 1400px;
  align-self: center;
  margin: 0 auto;
}

.form-wrapper {
  flex: 1;
  min-width: 0;
  max-width: 800px;
}

.footer-section {
  display: flex;
  justify-content: center;
  margin-top: 10rem;
}
</style>
