import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ChatExperience from '@/components/ai/ChatExperience.vue';

// Stub the API so the surface mounts clean.
vi.mock('@/services/api/aiApi', () => ({
  default: { exportCanvasUrl: vi.fn() },
  aiApi: {
    listSessions: vi.fn().mockResolvedValue({ data: [], current_page: 1, last_page: 1, total: 0 }),
    getSession: vi.fn(),
    createSession: vi.fn(),
    addMessage: vi.fn(),
    deleteSession: vi.fn(),
    uploadFiles: vi.fn()
  }
}));

describe('ChatExperience (landing mode)', () => {
  it('renders the centered chat hero with no history sidebar', async () => {
    const w = mount(ChatExperience, {
      props: { mode: 'landing' },
      global: {
        stubs: { Teleport: true, ClientOnly: true, NuxtLink: true, ChatLandingInsights: true }
      }
    });
    await flushPromises();

    expect(w.find('.hero').exists()).toBe(true);
    expect(w.text()).toContain('What can I help with?');
    expect(w.find('.attach-btn').exists()).toBe(true);
    // Landing has no history sidebar.
    expect(w.find('.experience-sidebar').exists()).toBe(false);
  });

  it('shows the centered hero in full mode too until the first message', async () => {
    const w = mount(ChatExperience, {
      props: { mode: 'full' },
      global: {
        stubs: { Teleport: true, ClientOnly: true, NuxtLink: true, ChatLandingInsights: true }
      }
    });
    await flushPromises();

    // Harmonized empty state: full mode opens on the same centered hero rather
    // than a bottom-docked composer.
    expect(w.find('.hero').exists()).toBe(true);
    expect(w.find('.composer-dock').exists()).toBe(false);
    // Full mode keeps the history sidebar.
    expect(w.find('.experience-sidebar').exists()).toBe(true);
  });
});
