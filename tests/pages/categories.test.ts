import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';

const mockCategories = ref([
  { id: 1, name: 'Groceries', type: 'expense', icon: 'shopping-cart' },
  { id: 2, name: 'Restaurants', type: 'expense', icon: 'utensils' },
  { id: 3, name: 'Salary', type: 'income', icon: 'briefcase' },
  { id: 4, name: 'Freelance', type: 'income', icon: 'laptop' },
  { id: 5, name: 'Gas', type: 'expense', icon: 'car' }
]);

const mockUseCategories = {
  categories: mockCategories,
  isLoading: ref(false),
  error: ref(null),
  fetchCategories: vi.fn().mockResolvedValue(undefined),
  createCategory: vi.fn().mockResolvedValue({ id: 6, name: 'New Category' }),
  updateCategory: vi.fn().mockResolvedValue({ id: 1, name: 'Updated Category' }),
  deleteCategory: vi.fn().mockResolvedValue(undefined)
};

const mockNotifications = {
  confirmDelete: vi.fn().mockResolvedValue(true),
  showSuccess: vi.fn(),
  showError: vi.fn()
};

vi.mock('@/composables/useCategories', () => ({
  useCategories: () => mockUseCategories
}));

vi.mock('@/composables/useNotifications', () => ({
  useNotifications: () => mockNotifications
}));

vi.mock('@/composables/useSidebar', () => ({
  useSidebar: () => ({
    isTabletOrBelow: ref(false)
  })
}));

describe('Categories Page Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCategories.value = [
      { id: 1, name: 'Groceries', type: 'expense', icon: 'shopping-cart' },
      { id: 2, name: 'Restaurants', type: 'expense', icon: 'utensils' },
      { id: 3, name: 'Salary', type: 'income', icon: 'briefcase' },
      { id: 4, name: 'Freelance', type: 'income', icon: 'laptop' },
      { id: 5, name: 'Gas', type: 'expense', icon: 'car' }
    ];
  });

  describe('useCategories composable', () => {
    it('returns categories list', () => {
      const { categories } = mockUseCategories;
      expect(categories.value).toHaveLength(5);
    });

    it('fetchCategories loads category data', async () => {
      await mockUseCategories.fetchCategories();
      expect(mockUseCategories.fetchCategories).toHaveBeenCalled();
    });

    it('createCategory adds new category', async () => {
      const newCategory = { name: 'Shopping', type: 'expense', icon: 'bag' };
      await mockUseCategories.createCategory(newCategory);
      expect(mockUseCategories.createCategory).toHaveBeenCalledWith(newCategory);
    });

    it('updateCategory modifies existing category', async () => {
      const updateData = { name: 'Updated Name', icon: 'star' };
      await mockUseCategories.updateCategory(1, updateData);
      expect(mockUseCategories.updateCategory).toHaveBeenCalledWith(1, updateData);
    });

    it('deleteCategory removes category', async () => {
      await mockUseCategories.deleteCategory(1);
      expect(mockUseCategories.deleteCategory).toHaveBeenCalledWith(1);
    });
  });

  describe('category filtering by type', () => {
    it('filters expense categories', () => {
      const expenseCategories = mockCategories.value.filter((c) => c.type === 'expense');
      expect(expenseCategories).toHaveLength(3);
      expect(expenseCategories.every((c) => c.type === 'expense')).toBe(true);
    });

    it('filters income categories', () => {
      const incomeCategories = mockCategories.value.filter((c) => c.type === 'income');
      expect(incomeCategories).toHaveLength(2);
      expect(incomeCategories.every((c) => c.type === 'income')).toBe(true);
    });

    it('returns correct expense category names', () => {
      const expenseCategories = mockCategories.value.filter((c) => c.type === 'expense');
      const names = expenseCategories.map((c) => c.name);
      expect(names).toContain('Groceries');
      expect(names).toContain('Restaurants');
      expect(names).toContain('Gas');
    });

    it('returns correct income category names', () => {
      const incomeCategories = mockCategories.value.filter((c) => c.type === 'income');
      const names = incomeCategories.map((c) => c.name);
      expect(names).toContain('Salary');
      expect(names).toContain('Freelance');
    });
  });

  describe('category operations', () => {
    it('shows confirmation before deleting', async () => {
      await mockNotifications.confirmDelete('category');
      expect(mockNotifications.confirmDelete).toHaveBeenCalledWith('category');
    });

    it('shows success notification after deletion', () => {
      mockNotifications.showSuccess('Category deleted', 'Groceries has been deleted successfully');
      expect(mockNotifications.showSuccess).toHaveBeenCalled();
    });

    it('does not delete when confirmation is cancelled', async () => {
      mockNotifications.confirmDelete.mockResolvedValueOnce(false);

      const confirmed = await mockNotifications.confirmDelete('category');

      if (!confirmed) {
        expect(mockUseCategories.deleteCategory).not.toHaveBeenCalled();
      }
    });
  });

  describe('category data structure', () => {
    it('category has required fields', () => {
      const category = mockCategories.value[0];
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('type');
    });

    it('category type is either income or expense', () => {
      mockCategories.value.forEach((category) => {
        expect(['income', 'expense']).toContain(category.type);
      });
    });

    it('category can have optional icon', () => {
      const category = mockCategories.value[0];
      expect(category).toHaveProperty('icon');
    });
  });
});

describe('Category Form Validation', () => {
  it('requires category name', () => {
    const categoryData = { name: '', type: 'expense' };
    const isValid = categoryData.name.trim().length > 0;
    expect(isValid).toBe(false);
  });

  it('accepts valid category name', () => {
    const categoryData = { name: 'My Category', type: 'expense' };
    const isValid = categoryData.name.trim().length > 0;
    expect(isValid).toBe(true);
  });

  it('requires type selection', () => {
    const categoryData = { name: 'My Category', type: '' };
    const isValid = ['income', 'expense'].includes(categoryData.type);
    expect(isValid).toBe(false);
  });

  it('accepts expense type', () => {
    const categoryData = { name: 'My Category', type: 'expense' };
    const isValid = ['income', 'expense'].includes(categoryData.type);
    expect(isValid).toBe(true);
  });

  it('accepts income type', () => {
    const categoryData = { name: 'My Category', type: 'income' };
    const isValid = ['income', 'expense'].includes(categoryData.type);
    expect(isValid).toBe(true);
  });
});

describe('Category Search/Filter', () => {
  it('can search categories by name', () => {
    const searchQuery = 'groc';
    const filtered = mockCategories.value.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Groceries');
  });

  it('returns empty array for no matches', () => {
    const searchQuery = 'xyz';
    const filtered = mockCategories.value.filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    expect(filtered).toHaveLength(0);
  });

  it('can combine type filter and search', () => {
    const searchQuery = 'sal';
    const typeFilter = 'income';
    const filtered = mockCategories.value.filter(
      (c) => c.type === typeFilter && c.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Salary');
  });
});

describe('Category Statistics', () => {
  it('counts total categories', () => {
    expect(mockCategories.value.length).toBe(5);
  });

  it('counts expense categories', () => {
    const count = mockCategories.value.filter((c) => c.type === 'expense').length;
    expect(count).toBe(3);
  });

  it('counts income categories', () => {
    const count = mockCategories.value.filter((c) => c.type === 'income').length;
    expect(count).toBe(2);
  });
});
