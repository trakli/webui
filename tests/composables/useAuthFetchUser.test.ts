import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ref, computed, readonly } from 'vue';
import { useAuth } from '~/composables/useAuth';

// useAuth leans on Nuxt auto-imports, which a bare vitest run does not provide.
vi.stubGlobal('computed', computed);
vi.stubGlobal('ref', ref);
vi.stubGlobal('readonly', readonly);

const cookies: Record<string, { value: unknown }> = {};
const states: Record<string, { value: unknown }> = {};

const apiMock = vi.fn();
const clearData = vi.fn();

vi.stubGlobal('useCookie', (key: string, opts?: { default?: () => unknown }) => {
  if (!cookies[key]) cookies[key] = ref(opts?.default ? opts.default() : null);
  return cookies[key];
});
vi.stubGlobal('useState', (key: string, init?: () => unknown) => {
  if (!states[key]) states[key] = ref(init ? init() : null);
  return states[key];
});
vi.stubGlobal('useApi', () => apiMock);
vi.stubGlobal('navigateTo', vi.fn());
vi.stubGlobal('useDataManager', () => ({ clearData }));

/** ofetch attaches the status to the error; see IFetchError in ofetch's types. */
const fetchError = (status: number) =>
  Object.assign(new Error(`HTTP ${status}`), {
    response: { status },
    statusCode: status
  });

/** useAuth exposes user and token readonly, so seed the state behind them. */
const signedIn = () => {
  states['auth.user'] = ref({ id: 1, email: 'a@b.com', is_admin: false });
  states['auth.token'] = ref('a-valid-token');
  cookies['auth.user'] = ref({ id: 1, email: 'a@b.com', is_admin: false });
  cookies['auth.token'] = ref('a-valid-token');

  return useAuth();
};

describe('fetchUser', () => {
  beforeEach(() => vi.clearAllMocks());

  it('keeps the session when the server errors', async () => {
    const auth = signedIn();
    apiMock.mockRejectedValueOnce(fetchError(500));

    await auth.fetchUser();

    // A 500 says nothing about their credentials.
    expect(auth.token.value).toBe('a-valid-token');
    expect(auth.user.value).not.toBeNull();
    expect(clearData).not.toHaveBeenCalled();
  });

  it('keeps the session when the network drops', async () => {
    const auth = signedIn();
    apiMock.mockRejectedValueOnce(new Error('Failed to fetch'));

    await auth.fetchUser();

    expect(auth.token.value).toBe('a-valid-token');
    expect(auth.user.value).not.toBeNull();
  });

  it('ends the session on a 401', async () => {
    const auth = signedIn();
    apiMock.mockRejectedValueOnce(fetchError(401));

    await auth.fetchUser();

    expect(auth.token.value).toBeNull();
    expect(auth.user.value).toBeNull();
    expect(clearData).toHaveBeenCalled();
  });

  it('picks up a role granted since the user last signed in', async () => {
    const auth = signedIn();
    apiMock.mockResolvedValueOnce({ data: { id: 1, email: 'a@b.com', is_admin: true } });

    await auth.fetchUser();

    expect(auth.user.value.is_admin).toBe(true);
  });
});
