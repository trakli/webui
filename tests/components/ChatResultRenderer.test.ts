import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ChatResultRenderer from '@/components/ai/ChatResultRenderer.vue';
import type { ChatMessageResult } from '@/services/api/aiApi';

const render = (result: ChatMessageResult) =>
  mount(ChatResultRenderer, {
    props: { result, sessionId: 1 },
    global: { stubs: { ClientOnly: true, NuxtLink: true } }
  });

describe('ChatResultRenderer (block dispatcher)', () => {
  it('renders a markdown block as sanitized HTML', () => {
    const w = render({
      source: 'agent',
      blocks: [{ type: 'markdown', text: 'Spending is **down**.' }]
    });
    expect(w.html()).toContain('<strong>down</strong>');
  });

  it('renders a multi-row table block as a table', () => {
    const w = render({
      source: 'agent',
      blocks: [
        {
          type: 'table',
          columns: ['category', 'total'],
          rows: [
            { category: 'Food', total: 120 },
            { category: 'Rent', total: 500 }
          ]
        }
      ]
    });
    expect(w.find('table').exists()).toBe(true);
    expect(w.text()).toContain('Food');
    expect(w.text()).toContain('Rent');
  });

  it('renders a single-row table as a record card, not a table', () => {
    const w = render({
      source: 'agent',
      blocks: [{ type: 'table', columns: ['total'], rows: [{ total: 500 }] }]
    });
    expect(w.find('table').exists()).toBe(false);
    expect(w.find('.record-card').exists()).toBe(true);
  });

  it('renders KPI cards', () => {
    const w = render({
      source: 'agent',
      blocks: [
        { type: 'kpi', items: [{ label: 'Income', value: 1000, delta_percent: 12, trend: 'up' }] }
      ]
    });
    expect(w.text()).toContain('Income');
    expect(w.text()).toContain('12.0%');
  });

  it('falls back gracefully for an unknown block type', () => {
    const w = render({
      source: 'agent',
      blocks: [{ type: 'some_future_widget', summary: 'A new thing' }]
    });
    expect(w.text()).toContain('A new thing');
  });

  it('still renders a legacy SmartQL scalar result', () => {
    const w = render({ source: 'smartql', format_type: 'scalar', rows: [{ total: 500 }] });
    expect(w.find('.result-scalar').text()).toBe('500');
  });
});
