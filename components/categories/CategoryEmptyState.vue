<template>
  <div class="empty-state">
    <img src="/box.svg" alt="Empty Box" class="empty-icon" />
    <h2 class="empty-title">You don't have any Category for the moment</h2>
    <p class="empty-subtitle">Please add at least one Category to be able to view it.</p>
    <button class="add-category-btn" @click="$emit('add')">
      Add Category <span class="plus">+</span>
    </button>
  </div>
</template>

<script setup>
// Emits 'add' when the button is clicked
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  text-align: center;
  padding: 2rem 1rem;
}
.empty-icon {
  width: 220px;
  height: 180px;
  margin-bottom: 2rem;
}
.empty-title {
  color: #371e48;
  font-size: 2.2rem;
  font-weight: 700;
  margin-bottom: 1rem;
}
.empty-subtitle {
  color: #371e48cc;
  font-size: 1.2rem;
  margin-bottom: 2.5rem;
}
.add-category-btn {
  background: #047844;
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
}
.add-category-btn:hover {
  background: #035c32;
}
.plus {
  font-size: 1.5rem;
  font-weight: 700;
}
</style>
