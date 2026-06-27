import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import TAvatar from '@/components/TAvatar.vue';

const push = vi.fn();
vi.mock('vue-router', () => ({ useRouter: () => ({ push }) }));

const mockUser = ref<Record<string, unknown> | null>(null);
vi.mock('@/composables/useAuth', () => ({
  useAuth: () => ({ user: mockUser, logout: vi.fn() })
}));

vi.mock('@/composables/useDropdown', () => ({
  useDropdown: () => ({ isOpen: ref(true), rootRef: ref(null), toggle: vi.fn(), close: vi.fn() })
}));

const mountAvatar = () => mount(TAvatar, { props: { imageUrl: '/a.png' } });

describe('TAvatar admin entry', () => {
  it('hides the admin button for non-admins', () => {
    mockUser.value = { first_name: 'Sam', last_name: 'Lee', email: 's@x.io', is_admin: false };
    const w = mountAvatar();
    expect(w.text()).not.toContain('Admin');
  });

  it('shows the admin button for admins', () => {
    mockUser.value = { first_name: 'Sam', last_name: 'Lee', email: 's@x.io', is_admin: true };
    const w = mountAvatar();
    expect(w.text()).toContain('Admin');
  });

  it('navigates to the admin area when clicked', async () => {
    mockUser.value = { first_name: 'Sam', last_name: 'Lee', email: 's@x.io', is_admin: true };
    const w = mountAvatar();

    const adminButton = w.findAll('.menu-item').find((b) => b.text().includes('Admin'));
    await adminButton!.trigger('click');

    expect(push).toHaveBeenCalledWith('/admin');
  });
});
