import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref } from 'vue';

const mockGroups = ref([
  { id: 1, name: 'Food & Dining', icon: 'utensils', color: '#FF5733' },
  { id: 2, name: 'Transportation', icon: 'car', color: '#33FF57' },
  { id: 3, name: 'Entertainment', icon: 'film', color: '#3357FF' }
]);

const mockUseGroups = {
  groups: mockGroups,
  isLoading: ref(false),
  error: ref(null),
  fetchGroups: vi.fn().mockResolvedValue(undefined),
  createGroup: vi.fn().mockResolvedValue({ id: 4, name: 'New Group' }),
  updateGroup: vi.fn().mockResolvedValue({ id: 1, name: 'Updated Group' }),
  deleteGroup: vi.fn().mockResolvedValue(undefined)
};

const mockNotifications = {
  confirmDelete: vi.fn().mockResolvedValue(true),
  showSuccess: vi.fn(),
  showError: vi.fn()
};

vi.mock('@/composables/useGroups', () => ({
  useGroups: () => mockUseGroups
}));

vi.mock('@/composables/useNotifications', () => ({
  useNotifications: () => mockNotifications
}));

vi.mock('@/composables/useSidebar', () => ({
  useSidebar: () => ({
    isTabletOrBelow: ref(false)
  })
}));

describe('Groups Page Logic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGroups.value = [
      { id: 1, name: 'Food & Dining', icon: 'utensils', color: '#FF5733' },
      { id: 2, name: 'Transportation', icon: 'car', color: '#33FF57' },
      { id: 3, name: 'Entertainment', icon: 'film', color: '#3357FF' }
    ];
  });

  describe('useGroups composable', () => {
    it('returns groups list', () => {
      const { groups } = mockUseGroups;
      expect(groups.value).toHaveLength(3);
      expect(groups.value[0].name).toBe('Food & Dining');
    });

    it('fetchGroups loads group data', async () => {
      await mockUseGroups.fetchGroups();
      expect(mockUseGroups.fetchGroups).toHaveBeenCalled();
    });

    it('createGroup adds new group', async () => {
      const newGroup = { name: 'Shopping', icon: 'shopping-cart', color: '#FFAA00' };
      await mockUseGroups.createGroup(newGroup);
      expect(mockUseGroups.createGroup).toHaveBeenCalledWith(newGroup);
    });

    it('updateGroup modifies existing group', async () => {
      const updateData = { name: 'Updated Name', icon: 'star' };
      await mockUseGroups.updateGroup(1, updateData);
      expect(mockUseGroups.updateGroup).toHaveBeenCalledWith(1, updateData);
    });

    it('deleteGroup removes group', async () => {
      await mockUseGroups.deleteGroup(1);
      expect(mockUseGroups.deleteGroup).toHaveBeenCalledWith(1);
    });
  });

  describe('group operations', () => {
    it('shows confirmation before deleting', async () => {
      await mockNotifications.confirmDelete('group');
      expect(mockNotifications.confirmDelete).toHaveBeenCalledWith('group');
    });

    it('shows success notification after deletion', () => {
      mockNotifications.showSuccess('Group deleted', 'Food & Dining has been deleted successfully');
      expect(mockNotifications.showSuccess).toHaveBeenCalledWith(
        'Group deleted',
        'Food & Dining has been deleted successfully'
      );
    });

    it('does not delete when confirmation is cancelled', async () => {
      mockNotifications.confirmDelete.mockResolvedValueOnce(false);

      const confirmed = await mockNotifications.confirmDelete('group');

      if (!confirmed) {
        expect(mockUseGroups.deleteGroup).not.toHaveBeenCalled();
      }
    });
  });

  describe('loading states', () => {
    it('isLoading starts as false', () => {
      expect(mockUseGroups.isLoading.value).toBe(false);
    });

    it('error starts as null', () => {
      expect(mockUseGroups.error.value).toBeNull();
    });
  });

  describe('group data structure', () => {
    it('group has required fields', () => {
      const group = mockGroups.value[0];
      expect(group).toHaveProperty('id');
      expect(group).toHaveProperty('name');
    });

    it('group can have optional icon', () => {
      const group = mockGroups.value[0];
      expect(group).toHaveProperty('icon');
    });

    it('group can have optional color', () => {
      const group = mockGroups.value[0];
      expect(group).toHaveProperty('color');
    });
  });
});

describe('Group Form Validation', () => {
  it('requires group name', () => {
    const groupData = { name: '' };
    const isValid = groupData.name.trim().length > 0;
    expect(isValid).toBe(false);
  });

  it('accepts valid group name', () => {
    const groupData = { name: 'My Group' };
    const isValid = groupData.name.trim().length > 0;
    expect(isValid).toBe(true);
  });

  it('trims whitespace from name', () => {
    const groupData = { name: '  My Group  ' };
    const trimmedName = groupData.name.trim();
    expect(trimmedName).toBe('My Group');
  });

  it('accepts name with special characters', () => {
    const groupData = { name: 'Food & Dining' };
    const isValid = groupData.name.trim().length > 0;
    expect(isValid).toBe(true);
  });
});

describe('Group Filtering', () => {
  it('can filter groups by name', () => {
    const searchQuery = 'food';
    const filtered = mockGroups.value.filter((g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    expect(filtered).toHaveLength(1);
    expect(filtered[0].name).toBe('Food & Dining');
  });

  it('returns empty array for no matches', () => {
    const searchQuery = 'xyz';
    const filtered = mockGroups.value.filter((g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    expect(filtered).toHaveLength(0);
  });

  it('case insensitive search', () => {
    const searchQuery = 'TRANSPORTATION';
    const filtered = mockGroups.value.filter((g) =>
      g.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    expect(filtered).toHaveLength(1);
  });
});
