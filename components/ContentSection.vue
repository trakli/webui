<template>
  <ContentTopCard
    :pageName="pageName"
    :pageNamePlural="pageNamePlural"
    @add="handleOpenFormForCreation"
  />
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
      <TipsSection v-if="isGroupsPage && !isMobile" :pageName="pageName" />
    </div>
    <EmptyState
      v-if="items.length === 0 && !showForm"
      :pageName="pageName"
      @create="handleOpenFormForCreation"
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
import { useSidebar } from '@/composables/useSidebar';

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

// Mobile detection
const { isMobile } = useSidebar();

const showForm = ref(false);
const items = ref([]);
const editingItem = ref(null);

const isGroupsPage = computed(() => props.pageName === 'Group');
const isPartiesPage = computed(() => props.pageName === 'Party');

const formMap = {
  Category: CategoryForm,
  Group: GroupForm,
  Party: PartyForm,
  Wallet: WalletForm
};

const currentForm = computed(() => formMap[props.pageName]);

const handleOpenFormForCreation = () => {
  // Only open the form if it's currently closed.
  if (!showForm.value) {
    editingItem.value = null; // Clear any existing editing item
    showForm.value = true;

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
  editingItem.value = null;
};

const handleCreate = (newItem) => {
  const itemWithId = {
    ...newItem,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
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
    items.value[index] = { ...items.value[index], ...updatedItem };
  }
  // Close the form after update
  handleFormClose();
};

const handleDelete = (itemToDelete) => {
  items.value = items.value.filter((item) => item.id !== itemToDelete.id);
};
</script>

<style lang="scss" scoped>
@use '~/assets/scss/_variables' as *;

.content-area {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  align-items: center;
  width: 100%;

  @media (max-width: $breakpoint-md) {
    margin-top: 1.5rem;
    gap: 1.5rem;
  }

  @media (max-width: $breakpoint-sm) {
    margin-top: 1rem;
    gap: 1rem;
  }
}

.form-section {
  display: flex;
  justify-content: space-between;
  gap: 3rem;
  width: 100%;
  max-width: 1400px;
  align-self: center;
  margin: 0 auto;
  padding: 0 1rem;

  @media (max-width: $breakpoint-lg) {
    gap: 2rem;
    padding: 0 0.75rem;
  }

  @media (max-width: $breakpoint-md) {
    gap: 1.5rem;
    padding: 0 0.5rem;
  }

  @media (max-width: $breakpoint-sm) {
    flex-direction: column;
    gap: 1rem;
    padding: 0 0.25rem;
  }
}

.form-wrapper {
  flex: 1;
  min-width: 0;
  max-width: 800px;

  @media (max-width: $breakpoint-sm) {
    max-width: 100%;
    width: 100%;
  }
}

.footer-section {
  display: flex;
  justify-content: center;
  margin-top: 10rem;
}
</style>
