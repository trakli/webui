<template>
  <div class="entity-content">
    <ContentTopCard :pageName="pageName" :pageNamePlural="pageNamePlural" @add="handleFormToggle" />

    <div class="content-area">
      <div v-if="showForm" class="form-wrapper">
        <ContentForm
          :pageName="pageName"
          :showIcon="showIcon"
          @created="handleCreate"
          @close="handleFormClose"
        />
      </div>

      <EmptyState
        v-if="items.length === 0 && !showForm"
        :pageName="pageName"
        @create="handleFormToggle"
      />

      <ContentList
        v-if="items.length > 0"
        :pageName="pageName"
        :pageNamePlural="pageNamePlural"
        :entities="items"
        @edit="handleEdit"
        @delete="handleDelete"
      />
    </div>

    <div class="footer-section">
      <TFooter />
    </div>
  </div>
</template>

<script setup>
import { ref, toRefs } from 'vue';
import ContentTopCard from './ContentTopCard.vue';
import EmptyState from './EmptyState.vue';
import ContentForm from './ContentForm.vue';
import ContentList from './ContentList.vue';
import TFooter from '@/components/TFooter.vue';

const props = defineProps({
  pageName: {
    type: String,
    required: true
  },
  pageNamePlural: {
    type: String,
    required: true
  },
  showIcon: {
    type: Boolean,
    default: true
  }
});

// Destructure props to use them in the setup function
const { pageName, pageNamePlural, showIcon } = toRefs(props);

const showForm = ref(false);
const items = ref([]);
let lastClickTime = 0;

const handleFormToggle = () => {
  const now = Date.now();
  if (now - lastClickTime > 300) {
    // 300ms debounce
    showForm.value = true;
    lastClickTime = now;
  }
};

const handleFormClose = () => {
  showForm.value = false;
};

const handleCreate = (newItem) => {
  const itemWithId = {
    ...newItem,
    id: Date.now(),
    createdAt: new Date().toISOString()
  };
  items.value.push(itemWithId);
};

const handleEdit = (itemToEdit) => {
  console.log('Edit clicked:', itemToEdit);
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

.form-wrapper {
  display: flex;
  justify-content: flex-start;
  width: 100%;
  max-width: 1200px;
  align-self: flex-start;
}

.footer-section {
  display: flex;
  justify-content: center;
  margin-top: 10rem;
}
</style>
