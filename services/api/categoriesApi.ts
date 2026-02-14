import type {
  Category,
  CategoryCreatePayload,
  CategoryUpdatePayload,
  CategoriesResponse,
  ApiResponse
} from '~/types/category';
import { buildIconPayload, extractResponseData } from './apiHelpers';

function createApiBusinessError(message: string, errors: string[] = []): Error {
  const err = new Error(message) as Error & { _data?: { message: string; errors: string[] } };
  err._data = { message, errors };
  return err;
}

function extractCategoryMutationResult(
  response: ApiResponse<Category> | Category | null | undefined,
  fallbackMessage: string
): Category {
  if (!response) {
    throw createApiBusinessError(fallbackMessage);
  }

  if (
    typeof response === 'object' &&
    'id' in response &&
    typeof (response as Category).id === 'number'
  ) {
    return response as Category;
  }

  const apiResponse = response as ApiResponse<Category>;

  if (apiResponse.success === false) {
    throw createApiBusinessError(apiResponse.message || fallbackMessage, apiResponse.errors || []);
  }

  if (apiResponse.data) {
    return apiResponse.data;
  }

  throw createApiBusinessError(apiResponse.message || fallbackMessage, apiResponse.errors || []);
}

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

    return extractResponseData(response, {
      last_sync: new Date().toISOString(),
      data: []
    });
  },

  /**
   * Fetch all categories
   * GET /categories
   */
  async fetchAll(): Promise<CategoriesResponse> {
    const api = useApi();
    const response = await api<ApiResponse<CategoriesResponse>>('/categories');

    return extractResponseData(response, {
      last_sync: new Date().toISOString(),
      data: []
    });
  },

  /**
   * Create a new category
   * POST /categories
   */
  async create(data: CategoryCreatePayload): Promise<Category | null> {
    const api = useApi();

    const payload = {
      ...data,
      ...buildIconPayload(data.icon)
    };

    try {
      const response = await api<ApiResponse<Category>>('/categories', {
        method: 'POST',
        body: payload
      });
      return extractCategoryMutationResult(response, 'Failed to create category');
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
      ...buildIconPayload(data.icon)
    };

    try {
      const response = await api<ApiResponse<Category>>(`/categories/${id}`, {
        method: 'PUT',
        body: payload
      });
      return extractCategoryMutationResult(response, 'Failed to update category');
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
  },

  /**
   * Seed default categories for the user
   * POST /categories/seed-defaults
   */
  async seedDefaults(): Promise<{
    created: number;
    skipped: number;
    categories: Category[];
  } | null> {
    const api = useApi();
    try {
      const response = await api<
        ApiResponse<{ created: number; skipped: number; categories: Category[] }>
      >('/categories/seed-defaults', { method: 'POST' });
      return response?.data || null;
    } catch (error) {
      console.error('Error seeding default categories:', error);
      throw error;
    }
  }
};

export default categoriesApi;
export { categoriesApi };
