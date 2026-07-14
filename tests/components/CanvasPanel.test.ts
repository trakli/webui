import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import CanvasPanel from '@/components/ai/CanvasPanel.vue';

describe('CanvasPanel', () => {
  it('renders the canvas title and its blocks when a canvas is open', () => {
    const w = mount(CanvasPanel, {
      props: {
        sessionId: 1,
        canvas: {
          type: 'canvas',
          title: 'Spending Habits Report',
          blocks: [{ type: 'markdown', text: 'You spent **a lot** on coffee.' }]
        }
      },
      global: { stubs: { Teleport: true, ClientOnly: true, NuxtLink: true } }
    });

    expect(w.text()).toContain('Spending Habits Report');
    // The composed blocks render via the dispatcher (markdown -> HTML).
    expect(w.html()).toContain('<strong>a lot</strong>');
  });

  it('renders nothing when no canvas is open', () => {
    const w = mount(CanvasPanel, {
      props: { canvas: null },
      global: { stubs: { Teleport: true } }
    });
    expect(w.text()).toBe('');
  });
});
