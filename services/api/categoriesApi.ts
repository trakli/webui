import type {
  Category,
  CategoryCreatePayload,
  CategoryUpdatePayload,
  CategoriesResponse,
  ApiResponse
} from '~/types/category';

/**
 * Categories API Service
 * Handles all HTTP requests to the categories endpoints
 */
const categoriesApi = {
  /**
   * Fetch categories by type
   * GET /categories?type={type}
   */
  async fetchByType(type: 'income' | 'expense'): Promise<CategoriesResponse> {
    const api = useApi();
    const url = `/categories?type=${type}`;

    const response = await api<ApiResponse<CategoriesResponse>>(url);

    if (response?.data) {
      return response.data;
    } else if (response?.last_sync) {
      // Direct response format without nested data
      return response as unknown as CategoriesResponse;
    }

    // Fallback
    return {
      last_sync: new Date().toISOString(),
      data: []
    };
  },

  /**
   * Fetch all categories
   * GET /categories
   */
  async fetchAll(): Promise<CategoriesResponse> {
    const api = useApi();
    const response = await api<ApiResponse<CategoriesResponse>>('/categories');

    if (response?.data) {
      return response.data;
    } else if (response?.last_sync) {
      return response as unknown as CategoriesResponse;
    }

    return {
      last_sync: new Date().toISOString(),
      data: []
    };
  },

  /**
   * Create a new category
   * POST /categories
   */
  async create(data: CategoryCreatePayload): Promise<Category | null> {
    const api = useApi();

    const payload = {
      ...data,
      ...(typeof data.icon === 'string' && data.icon.trim() !== ''
        ? { icon: data.icon, icon_type: 'image' }
        : {})
    };

    try {
      const response = await api<ApiResponse<Category>>('/categories', {
        method: 'POST',
        body: payload
      });
      return response?.data || null;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },

  /**
   * Update an existing category
   * PUT /categories/{id}
   */
  async update(id: number, data: CategoryUpdatePayload): Promise<Category | null> {
    const api = useApi();

    const payload = {
      ...data,
      ...(typeof data.icon === 'string' && data.icon.trim() !== ''
        ? { icon: data.icon, icon_type: 'image' }
        : {})
    };

    try {
      const response = await api<ApiResponse<Category>>(`/categories/${id}`, {
        method: 'PUT',
        body: payload
      });
      return response?.data || null;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  /**
   * Delete a category
   * DELETE /categories/{id}
   */
  async delete(id: number): Promise<boolean> {
    const api = useApi();
    try {
      await api(`/categories/${id}`, {
        method: 'DELETE'
      });
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
};

export default categoriesApi;
export { categoriesApi };
