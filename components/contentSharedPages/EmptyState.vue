<template>
  <div class="empty-state">
    <img class="empty-icon" src="/box.svg" alt="Empty Icon" />
    <h2 class="empty-title">
      You don't have any {{ pageName }} for the <br />
      moment!
    </h2>
    <p class="empty-subtitle">Please add at least one {{ pageName }} to be able to view it.</p>
    <button class="add-entity-btn" @click="$emit('create')">Add {{ pageName }} +</button>
  </div>
</template>

<script setup>
defineProps({
  pageName: {
    type: String,
    required: true
  }
});

defineEmits(['create']);
</script>

<style scoped lang="scss">
@use '~/assets/scss/_variables' as *;

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-top: 5rem;
  margin-bottom: 0;
  padding: 2rem 1rem;
  height: 50vh;
}

.empty-icon {
  width: 220px;
  height: 220px;
  margin-bottom: 1rem;
}

.empty-title {
  color: $text-primary;
  font-size: 2.2rem;
  font-weight: 700;
  margin: 1rem 3rem;
}

.empty-subtitle {
  color: $text-secondary;
  font-size: 1.2rem;
  margin-bottom: 2.5rem;
}

.add-entity-btn {
  background: $primary;
  color: #fff;
  font-size: 1.3rem;
  font-weight: 600;
  border: none;
  border-radius: 14px;
  padding: 1rem 2.5rem;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    background: $primary-hover;
  }
}
</style>
