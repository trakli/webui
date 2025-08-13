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
      <ContentTable
        v-if="items.length > 0"
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
import { ref, computed, toRefs } from 'vue';
import ContentTopCard from './TTopCard.vue';
import EmptyState from './EmptyState.vue';
import CategoryForm from './categories/CategoryForm.vue';
import GroupForm from './groups/GroupForm.vue';
import ContentTable from './ContentTable.vue';
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

const isGroupsPage = computed(() => props.pageName === 'Group');

const formMap = {
  Category: CategoryForm,
  Group: GroupForm
};

var currentForm = computed(() => formMap[props.pageName]);

const handleFormToggle = () => {
  const now = Date.now();
  // Only open the form if it's currently closed. Do not toggle.
  if (now - lastClickTime > 300 && !showForm.value) {
    editingItem.value = null; // Clear any existing editing item
    showForm.value = true;
    lastClickTime = now;
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
    createdAt: new Date().toISOString()
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
};

const handleUpdate = (updatedItem) => {
  const index = items.value.findIndex((item) => item.id === updatedItem.id);
  if (index !== -1) {
    // Replace the old item with the updated one
    items.value[index] = { ...updatedItem };
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
