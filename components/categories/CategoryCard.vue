<template>
    <div class="category-card">
      <div class="category-icon-name">
        <component :is="icon" class="category-icon" />
        <span class="name">{{ name }}</span>
      </div>
      <div class="category-description">
        {{ description }}
      </div>
      <div class="category-actions">
        <button class="action-button edit" @click="$emit('edit')" title="Edit Category">
          <LucideEdit class="action-icon" />
          <span class="tooltip">Edit</span>
        </button>
        <button class="action-button delete" @click="$emit('delete')" title="Delete Category">
          <LucideTrash class="action-icon" />
          <span class="tooltip">Delete</span>
        </button>
      </div>
    </div>
  </template>
  
  <script setup>
  import { defineProps, defineEmits, computed } from 'vue';
  import { Edit as LucideEdit, Trash as LucideTrash } from 'lucide-vue-next';
  import * as LucideIcons from 'lucide-vue-next';
  
  const props = defineProps({
    name: String,
    icon: {
      type: String,
      default: 'Box' 
    },
    description: String,
  });
  
  // Dynamically get the icon component
  const icon = computed(() => {
    return LucideIcons[props.icon] || LucideIcons.Box;
  });
  
  defineEmits(['edit', 'delete']);
  </script>
  
  <style lang="scss" scoped>
  @use '~/assets/_variables' as *;
  .category-card {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid #ddd;
    gap: 1rem;
    background: $bg-gray;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
  
    &:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      background: whitesmoke;
  
      .category-icon {
        transform: scale(1.1);
      }
  
      .action-button {
        opacity: 1;
        transform: translateX(0);
      }
    }
  }
  .category-icon {
    width: 24px;
    height: 24px;
    color: #047844;
    transition: transform 0.2s ease;
  }
  .category-icon-name {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 15%;
  }
  .category-description {
    flex: 1;
    color: #444;
    font-size: 0.95rem;
  }
  .category-actions {
    display: flex;
    gap: 2rem;
    align-items: center;
    width: 10%;
    opacity: 0.7;
    transition: opacity 0.2s ease;
  
    &:hover {
      opacity: 1;
    }
  }
  .action-button {
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    padding: 8px;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
    opacity: 0.7;
    transform: translateX(10px);
  
    &:hover {
      background: rgba(0, 0, 0, 0.05);
  
      .tooltip {
        opacity: 1;
        visibility: visible;
        transform: translateY(-5px);
      }
    }
  
    &.edit:hover {
      color: $primary;
    }
  
    &.delete:hover {
      color: #dc2626;
    }
  
    .tooltip {
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%) translateY(0);
      background: #333;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      white-space: nowrap;
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s ease;
  
      &:after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 50%;
        transform: translateX(-50%);
        border-left: 4px solid transparent;
        border-right: 4px solid transparent;
        border-top: 4px solid #333;
      }
    }
  }
  .action-icon {
    cursor: pointer;
    width: 20px;
    height: 20px;
    transition: transform 0.2s ease;
  }
  .edit {
    color: #047844;
  }
  .delete {
    color: #eb5757;
  }
  </style>