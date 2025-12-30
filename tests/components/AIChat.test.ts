import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { ref, nextTick } from 'vue';
import AIChat from '@/components/ai/AIChat.vue';

const mockAsk = vi.fn();
vi.mock('@/services/api/aiApi', () => ({
  aiApi: {
    ask: (...args: unknown[]) => mockAsk(...args),
  },
}));

describe('AIChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders initial greeting message', () => {
    const wrapper = mount(AIChat);

    expect(wrapper.text()).toContain('Hello! I am your personal financial assistant');
  });

  it('displays user message when sent', async () => {
    mockAsk.mockResolvedValueOnce({
      success: true,
      data: {
        answer: 'Test response',
        format_type: 'scalar',
        results: [{ total: 100 }],
      },
    });

    const wrapper = mount(AIChat);
    const input = wrapper.find('.chat-input');
    const form = wrapper.find('form');

    await input.setValue('How much did I spend?');
    await form.trigger('submit');

    expect(wrapper.text()).toContain('How much did I spend?');
  });

  it('shows loading state while waiting for response', async () => {
    let resolvePromise: (value: unknown) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockAsk.mockReturnValueOnce(promise);

    const wrapper = mount(AIChat);
    const input = wrapper.find('.chat-input');
    const form = wrapper.find('form');

    await input.setValue('Test question');
    await form.trigger('submit');
    await nextTick();

    expect(wrapper.text()).toContain('Thinking...');

    resolvePromise!({
      success: true,
      data: { answer: 'Response', format_type: null, results: [] },
    });
    await flushPromises();

    expect(wrapper.text()).not.toContain('Thinking...');
  });

  it('displays AI response after successful request', async () => {
    mockAsk.mockResolvedValueOnce({
      success: true,
      data: {
        answer: 'You spent $500 on food last month.',
        format_type: 'scalar',
        results: [{ total: 500 }],
      },
    });

    const wrapper = mount(AIChat);
    const input = wrapper.find('.chat-input');
    const form = wrapper.find('form');

    await input.setValue('How much on food?');
    await form.trigger('submit');
    await flushPromises();

    expect(wrapper.text()).toContain('You spent $500 on food last month.');
  });

  it('displays error message on failed request', async () => {
    mockAsk.mockResolvedValueOnce({
      success: false,
      message: 'Service unavailable',
    });

    const wrapper = mount(AIChat);
    const input = wrapper.find('.chat-input');
    const form = wrapper.find('form');

    await input.setValue('Test');
    await form.trigger('submit');
    await flushPromises();

    expect(wrapper.text()).toContain('Service unavailable');
  });

  it('displays fallback error on exception', async () => {
    mockAsk.mockRejectedValueOnce(new Error('Network error'));

    const wrapper = mount(AIChat);
    const input = wrapper.find('.chat-input');
    const form = wrapper.find('form');

    await input.setValue('Test');
    await form.trigger('submit');
    await flushPromises();

    expect(wrapper.text()).toContain('AI service is currently unavailable');
  });

  it('disables input and button while loading', async () => {
    let resolvePromise: (value: unknown) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });
    mockAsk.mockReturnValueOnce(promise);

    const wrapper = mount(AIChat);
    const input = wrapper.find('.chat-input');
    const button = wrapper.find('.send-btn');
    const form = wrapper.find('form');

    await input.setValue('Test');
    await form.trigger('submit');
    await nextTick();

    expect(input.attributes('disabled')).toBeDefined();
    expect(button.attributes('disabled')).toBeDefined();

    resolvePromise!({
      success: true,
      data: { answer: 'Done', format_type: null, results: [] },
    });
    await flushPromises();

    expect(input.attributes('disabled')).toBeUndefined();
  });

  it('does not send empty messages', async () => {
    const wrapper = mount(AIChat);
    const form = wrapper.find('form');

    await form.trigger('submit');

    expect(mockAsk).not.toHaveBeenCalled();
  });

  it('clears input after sending message', async () => {
    mockAsk.mockResolvedValueOnce({
      success: true,
      data: { answer: 'Response', format_type: null, results: [] },
    });

    const wrapper = mount(AIChat);
    const input = wrapper.find('.chat-input');
    const form = wrapper.find('form');

    await input.setValue('Test message');
    await form.trigger('submit');

    expect((input.element as HTMLInputElement).value).toBe('');
  });
});

describe('AIChat format type rendering', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders scalar format as large bold value', async () => {
    mockAsk.mockResolvedValueOnce({
      success: true,
      data: {
        answer: 'Your total spending is:',
        format_type: 'scalar',
        results: [{ total: 5000 }],
      },
    });

    const wrapper = mount(AIChat);
    await wrapper.find('.chat-input').setValue('Total?');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('.result-scalar').exists()).toBe(true);
    expect(wrapper.find('.result-scalar').text()).toContain('5000');
  });

  it('renders pair format as label-value', async () => {
    mockAsk.mockResolvedValueOnce({
      success: true,
      data: {
        answer: 'Top category:',
        format_type: 'pair',
        results: [{ category: 'Food', amount: 1500 }],
      },
    });

    const wrapper = mount(AIChat);
    await wrapper.find('.chat-input').setValue('Top category?');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('.result-pair').exists()).toBe(true);
    expect(wrapper.find('.pair-label').text()).toContain('category');
  });

  it('renders record format as key-value rows', async () => {
    mockAsk.mockResolvedValueOnce({
      success: true,
      data: {
        answer: 'Transaction details:',
        format_type: 'record',
        results: [{ id: 1, name: 'Rent', amount: 2000, date: '2025-01-01' }],
      },
    });

    const wrapper = mount(AIChat);
    await wrapper.find('.chat-input').setValue('Show transaction');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('.result-record').exists()).toBe(true);
    expect(wrapper.findAll('.record-row').length).toBe(4);
  });

  it('renders list format as bullet points', async () => {
    mockAsk.mockResolvedValueOnce({
      success: true,
      data: {
        answer: 'Your categories:',
        format_type: 'list',
        results: [{ name: 'Food' }, { name: 'Transport' }, { name: 'Entertainment' }],
      },
    });

    const wrapper = mount(AIChat);
    await wrapper.find('.chat-input').setValue('List categories');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('.result-list').exists()).toBe(true);
    expect(wrapper.findAll('.result-list li').length).toBe(3);
  });

  it('renders pair_list format as multiple label-value pairs', async () => {
    mockAsk.mockResolvedValueOnce({
      success: true,
      data: {
        answer: 'Spending by category:',
        format_type: 'pair_list',
        results: [
          { category: 'Food', total: 500 },
          { category: 'Transport', total: 200 },
        ],
      },
    });

    const wrapper = mount(AIChat);
    await wrapper.find('.chat-input').setValue('Breakdown');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('.result-pair-list').exists()).toBe(true);
    expect(wrapper.findAll('.pair-row').length).toBe(2);
  });

  it('renders table format with headers and rows', async () => {
    mockAsk.mockResolvedValueOnce({
      success: true,
      data: {
        answer: 'Recent transactions:',
        format_type: 'table',
        results: [
          { date: '2025-01-01', description: 'Groceries', amount: 50 },
          { date: '2025-01-02', description: 'Gas', amount: 30 },
        ],
      },
    });

    const wrapper = mount(AIChat);
    await wrapper.find('.chat-input').setValue('Show transactions');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('.result-table').exists()).toBe(true);
    expect(wrapper.findAll('.result-table th').length).toBe(3);
    expect(wrapper.findAll('.result-table tbody tr').length).toBe(2);
  });

  it('renders raw format as JSON', async () => {
    mockAsk.mockResolvedValueOnce({
      success: true,
      data: {
        answer: 'Raw data:',
        format_type: 'raw',
        results: [{ complex: { nested: 'data' } }],
      },
    });

    const wrapper = mount(AIChat);
    await wrapper.find('.chat-input').setValue('Raw data');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('.result-raw').exists()).toBe(true);
    expect(wrapper.find('.result-raw').text()).toContain('nested');
  });

  it('does not render results container when results are empty', async () => {
    mockAsk.mockResolvedValueOnce({
      success: true,
      data: {
        answer: 'No data found.',
        format_type: 'table',
        results: [],
      },
    });

    const wrapper = mount(AIChat);
    await wrapper.find('.chat-input').setValue('Empty query');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('.results-container').exists()).toBe(false);
  });

  it('does not render results when format_type is null', async () => {
    mockAsk.mockResolvedValueOnce({
      success: true,
      data: {
        answer: 'Just a text response.',
        format_type: null,
        results: [{ data: 'value' }],
      },
    });

    const wrapper = mount(AIChat);
    await wrapper.find('.chat-input').setValue('Text only');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('.results-container').exists()).toBe(false);
  });
});

describe('AIChat formatValue helper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('formats decimal numbers with two decimal places', async () => {
    mockAsk.mockResolvedValueOnce({
      success: true,
      data: {
        answer: 'Amount:',
        format_type: 'scalar',
        results: [{ amount: 1234.5 }],
      },
    });

    const wrapper = mount(AIChat);
    await wrapper.find('.chat-input').setValue('Test');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('.result-scalar').text()).toContain('1,234.50');
  });

  it('formats integer numbers without decimal places', async () => {
    mockAsk.mockResolvedValueOnce({
      success: true,
      data: {
        answer: 'Count:',
        format_type: 'scalar',
        results: [{ count: 42 }],
      },
    });

    const wrapper = mount(AIChat);
    await wrapper.find('.chat-input').setValue('Test');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('.result-scalar').text()).toBe('42');
  });

  it('displays dash for null values', async () => {
    mockAsk.mockResolvedValueOnce({
      success: true,
      data: {
        answer: 'Record:',
        format_type: 'record',
        results: [{ name: 'Test', value: null }],
      },
    });

    const wrapper = mount(AIChat);
    await wrapper.find('.chat-input').setValue('Test');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('.result-record').text()).toContain('-');
  });
});

describe('AIChat formatKey helper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('converts snake_case to Title Case', async () => {
    mockAsk.mockResolvedValueOnce({
      success: true,
      data: {
        answer: 'Record:',
        format_type: 'record',
        results: [{ total_amount: 100 }],
      },
    });

    const wrapper = mount(AIChat);
    await wrapper.find('.chat-input').setValue('Test');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(wrapper.find('.record-key').text()).toContain('Total Amount');
  });
});
