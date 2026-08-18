import { beforeEach, describe, expect, it, vi } from 'vitest';
import { adminApi, type AdminUserPage } from '@/services/api/adminApi';

const mockApi = vi.fn();

vi.mock('#imports', () => ({
  useApi: () => mockApi
}));

vi.stubGlobal('useApi', () => mockApi);

describe('adminApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('lists a filtered page of users', async () => {
    const page: AdminUserPage = {
      data: [],
      current_page: 2,
      last_page: 3,
      per_page: 15,
      total: 31
    };
    mockApi.mockResolvedValueOnce({ success: true, message: 'ok', data: page });

    const result = await adminApi.users({
      page: 2,
      perPage: 15,
      search: 'ada',
      joinedOn: '2026-08-10'
    });

    expect(mockApi).toHaveBeenCalledWith(
      '/admin/users?page=2&per_page=15&search=ada&joined_on=2026-08-10'
    );
    expect(result).toEqual(page);
  });
});
