import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { h } from 'vue';
import ChatChartBlock from '@/components/ai/blocks/ChatChartBlock.vue';

// Record the chart type the component asks ApexCharts to render.
vi.mock('vue3-apexcharts', () => ({
  __esModule: true,
  default: {
    name: 'apexchart',
    inheritAttrs: false,
    setup:
      (_props: unknown, { attrs }: { attrs: Record<string, unknown> }) =>
      () =>
        h('div', { class: 'apexchart-stub', 'data-type': attrs.type })
  }
}));

const ClientOnly = {
  name: 'ClientOnly',
  setup(_: unknown, { slots }: { slots: { default?: () => unknown } }) {
    return () => h('div', slots.default ? (slots.default() as never) : []);
  }
};

const mountChart = (props: Record<string, unknown>) =>
  mount(ChatChartBlock, { props, global: { stubs: { ClientOnly } } });

const renderedType = async (props: Record<string, unknown>) => {
  const w = mountChart(props);
  await vi.dynamicImportSettled();
  await flushPromises();
  return w.find('.apexchart-stub').attributes('data-type');
};

describe('ChatChartBlock (chart-type mapping)', () => {
  it('renders a pie hint as a pie, not a donut', async () => {
    const type = await renderedType({
      chart_hint: 'pie',
      data: [
        { category: 'Food', total: 120 },
        { category: 'Rent', total: 500 }
      ]
    });
    expect(type).toBe('pie');
  });

  it('keeps a line hint as a multi-series chart', async () => {
    const type = await renderedType({
      chart_hint: 'line',
      data: [
        { month: 'Jan', income: 100, expense: 60 },
        { month: 'Feb', income: 120, expense: 80 }
      ]
    });
    expect(type).toBe('line');
  });

  it('falls back to bar when a single-series shape is asked of multi-column data', async () => {
    const type = await renderedType({
      chart_hint: 'pie',
      data: [{ month: 'Jan', income: 100, expense: 60 }]
    });
    expect(type).toBe('bar');
  });

  it('keeps a donut for the built-in dataset shape (ignores id/count/percentage columns)', async () => {
    const type = await renderedType({
      chart_hint: 'donut',
      data: [
        { id: 1, name: 'Food', amount: 120, transaction_count: 8, percentage: 20 },
        { id: 2, name: 'Rent', amount: 500, transaction_count: 1, percentage: 80 }
      ]
    });
    expect(type).toBe('donut');
  });

  it('charts a count-only single-series dataset when no value column exists', async () => {
    const type = await renderedType({
      chart_hint: 'pie',
      data: [
        { category: 'Food', transaction_count: 8 },
        { category: 'Rent', transaction_count: 1 }
      ]
    });
    expect(type).toBe('pie');
  });

  it('renders horizontal bar as an apex bar', async () => {
    const type = await renderedType({
      chart_hint: 'hbar',
      data: [
        { category: 'Food', total: 120 },
        { category: 'Rent', total: 500 }
      ]
    });
    expect(type).toBe('bar');
  });
});
