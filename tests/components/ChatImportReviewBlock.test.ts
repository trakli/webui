import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { h } from 'vue';
import ChatImportReviewBlock from '@/components/ai/blocks/ChatImportReviewBlock.vue';

const mockGetSession = vi.fn();
vi.mock('@/services/api/importsApi', () => ({
  importsApi: { getSession: (...a: unknown[]) => mockGetSession(...a) }
}));

// Render NuxtLink as a plain anchor so we can read the resolved `to`.
const NuxtLink = {
  props: ['to'],
  setup(props: { to: string }, { slots }: { slots: { default?: () => unknown } }) {
    return () => h('a', { href: props.to }, slots.default ? (slots.default() as never) : []);
  }
};

const mountBlock = async (block: Record<string, unknown>) => {
  const w = mount(ChatImportReviewBlock, { props: { block }, global: { stubs: { NuxtLink } } });
  await flushPromises();
  return w;
};

describe('ChatImportReviewBlock', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deep-links to the specific import session', async () => {
    mockGetSession.mockResolvedValue({ status: 'ready' });
    const w = await mountBlock({
      type: 'import_review',
      import_session_id: 42,
      status: 'analyzing',
      file_name: 'statement.csv'
    });
    expect(w.find('a').attributes('href')).toBe('/imports?session=42');
    expect(w.text()).toContain('statement.csv');
  });

  it('reflects the live status: a failed import shows failed, not analyzing', async () => {
    mockGetSession.mockResolvedValue({ status: 'failed' });
    const w = await mountBlock({
      type: 'import_review',
      import_session_id: 7,
      status: 'analyzing'
    });
    expect(w.text()).toContain('Import failed');
    expect(w.text()).not.toContain('Analyzing');
    expect(w.find('.spin').exists()).toBe(false);
  });

  it('shows the spinner while the import is still in progress', async () => {
    mockGetSession.mockResolvedValue({ status: 'enriching' });
    const w = await mountBlock({
      type: 'import_review',
      import_session_id: 8,
      status: 'analyzing'
    });
    expect(w.find('.spin').exists()).toBe(true);
  });

  it('shows unavailable (no link) when the session is gone', async () => {
    mockGetSession.mockRejectedValue(new Error('404'));
    const w = await mountBlock({
      type: 'import_review',
      import_session_id: 9,
      status: 'analyzing'
    });
    expect(w.text()).toContain('Import unavailable');
    expect(w.find('a').exists()).toBe(false);
  });

  it('renders no link when there is no session id', async () => {
    const w = await mountBlock({ type: 'import_review', status: 'analyzing' });
    expect(w.find('a').exists()).toBe(false);
    expect(mockGetSession).not.toHaveBeenCalled();
  });
});
