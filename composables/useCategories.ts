import { ref, readonly } from 'vue';
import type {
  Category,
  CategoryCreatePayload,
  CategoryUpdatePayload,
  CategoriesResponse,
  ApiResponse
} from '~/types/category';

export const useCategories = () => {
  const api = useApi();
  const categories = ref<Category[]>([]);
  const lastSync = ref<string | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Helper function to normalize icon to string
  const normalizeIcon = (icon: any): string => {
    if (typeof icon === 'string') return icon;
    if (typeof icon === 'object' && icon?.path) return icon.path;
    return '';
  };

  // Helper function to extract API errors
  const extractApiErrors = (err: any): string => {
    if (typeof err === 'string') return err;
    if (err?.response?._data?.message) return err.response._data.message;
    if (err?.response?._data?.errors?.length) return err.response._data.errors.join(', ');
    if (err?.message) return err.message;
    if (err?._data?.message) return err._data.message;
    if (err?._data?.errors?.length) return err._data.errors.join(', ');
    return 'An unknown error occurred';
  };

  const fetchCategories = async (type: 'income' | 'expense') => {
    isLoading.value = true;
    error.value = null;
    try {
      const url = `/categories?type=${type}`;

      const response = await api<ApiResponse<CategoriesResponse>>(url);

      let newCategories: Category[] = [];
      if (response?.data) {
        newCategories = response.data.data || [];
        lastSync.value = response.data.last_sync || new Date().toISOString();
      } else if (response?.last_sync && response?.data) {
        // Direct response format
        newCategories = (response as any).data || [];
        lastSync.value = (response as any).last_sync || new Date().toISOString();
      }

      // Remove existing categories of this type, then add new ones
      const otherTypeCategories = categories.value.filter((cat) => cat.type !== type);
      categories.value = [...otherTypeCategories, ...newCategories];

      console.log(
        `✅ Fetched ${newCategories.length} ${type} categories. Total: ${categories.value.length}`
      );
    } catch (err: any) {
      const msg = extractApiErrors(err);
      console.error('Error fetching categories:', msg, err);
      error.value = msg;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const createCategory = async (data: CategoryCreatePayload) => {
    isLoading.value = true;
    error.value = null;
    try {
      const payload = {
        ...data,
        icon: normalizeIcon(data.icon),
        icon_type: 'image'
      };

      const response = await api<ApiResponse<Category>>('/categories', {
        method: 'POST',
        body: payload
      });

      // Add to local state if successful
      if (response?.data) {
        categories.value.unshift(response.data);
      }

      return response;
    } catch (err: any) {
      const msg = extractApiErrors(err);
      console.error('Error creating category:', msg, err);
      error.value = msg;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const updateCategory = async (id: number, data: CategoryUpdatePayload) => {
    isLoading.value = true;
    error.value = null;
    try {
      const payload = {
        ...data,
        ...(data.icon && { icon: normalizeIcon(data.icon), icon_type: 'image' })
      };

      const response = await api<ApiResponse<Category>>(`/categories/${id}`, {
        method: 'PUT',
        body: payload
      });

      // Update local state
      const index = categories.value.findIndex((cat) => cat.id === id);
      if (index !== -1 && response?.data) {
        categories.value[index] = response.data;
      }

      return response;
    } catch (err: any) {
      const msg = extractApiErrors(err);
      console.error('Error updating category:', msg, err);
      error.value = msg;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  const deleteCategory = async (id: number) => {
    isLoading.value = true;
    error.value = null;
    try {
      await api(`/categories/${id}`, {
        method: 'DELETE'
      });

      // Remove from local state
      categories.value = categories.value.filter((cat) => cat.id !== id);
    } catch (err: any) {
      const msg = extractApiErrors(err);
      console.error('Error deleting category:', msg, err);
      error.value = msg;
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  return {
    categories: readonly(categories),
    lastSync: readonly(lastSync),
    isLoading: readonly(isLoading),
    error: readonly(error),
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory
  };
};
