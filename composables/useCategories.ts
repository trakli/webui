import { api } from '~/services/api';
import { useSharedData } from '~/composables/useSharedData';
import type { CategoryCreatePayload, CategoryUpdatePayload } from '~/types/category';

export const useCategories = () => {
  const sharedData = useSharedData();

  const fetchCategories = async (_type: 'income' | 'expense') => {
    return sharedData.loadCategories();
  };

  const createCategory = async (data: CategoryCreatePayload) => {
    try {
      const created = await api.categories.create(data);
      if (created) {
        sharedData.addCategory(created);
      }
      return { data: created };
    } catch (err) {
      console.error('Error creating category:', err);
      throw err;
    }
  };

  const updateCategory = async (id: number, data: CategoryUpdatePayload) => {
    try {
      const updated = await api.categories.update(id, data);
      if (updated) {
        sharedData.updateCategory(id, updated);
      }
      return { data: updated };
    } catch (err) {
      console.error('Error updating category:', err);
      throw err;
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      const success = await api.categories.delete(id);
      if (success) {
        sharedData.removeCategory(id);
      }
      return success;
    } catch (err) {
      console.error('Error deleting category:', err);
      throw err;
    }
  };

  return {
    categories: sharedData.categories,
    lastSync: sharedData.categoriesLastSync,
    isLoading: sharedData.categoriesLoading,
    error: sharedData.categoriesError,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
};
