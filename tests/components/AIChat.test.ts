import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import ChatExperience from '@/components/ai/ChatExperience.vue';
import type { ChatSession } from '@/services/api/aiApi';

const mockListSessions = vi.fn();
const mockGetSession = vi.fn();
const mockCreateSession = vi.fn();
const mockAddMessage = vi.fn();
const mockDeleteSession = vi.fn();

vi.mock('@/services/api/aiApi', () => ({
  default: { exportCanvasUrl: vi.fn() },
  aiApi: {
    listSessions: (...args: unknown[]) => mockListSessions(...args),
    getSession: (...args: unknown[]) => mockGetSession(...args),
    createSession: (...args: unknown[]) => mockCreateSession(...args),
    addMessage: (...args: unknown[]) => mockAddMessage(...args),
    deleteSession: (...args: unknown[]) => mockDeleteSession(...args)
  }
}));

const mountChat = () =>
  mount(ChatExperience, {
    props: { mode: 'full' },
    global: { stubs: { ChatLandingInsights: true } }
  });

const emptyPage = { data: [], current_page: 1, last_page: 1, total: 0 };

const session = (overrides: Partial<ChatSession> = {}): ChatSession => ({
  id: 1,
  title: 'Spending question',
  created_at: '2026-04-18T00:00:00Z',
  updated_at: '2026-04-18T00:00:00Z',
  messages: [],
  ...overrides
});

describe('ChatExperience (full mode)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockListSessions.mockResolvedValue(emptyPage);
  });

  it('renders the centered hero when no session is active', async () => {
    const wrapper = mountChat();
    await flushPromises();

    expect(wrapper.find('.hero').exists()).toBe(true);
    expect(wrapper.text()).toContain('What can I help with?');
  });

  it('creates a new session on first send', async () => {
    const created = session({
      messages: [
        {
          id: 10,
          user_id: 1,
          role: 'user',
          content: 'How much on food?',
          status: null,
          format_hint: null,
          language: 'en',
          result: null,
          error: null,
          completed_at: null,
          created_at: '',
          updated_at: ''
        },
        {
          id: 11,
          user_id: null,
          role: 'assistant',
          content: null,
          status: 'pending',
          format_hint: null,
          language: 'en',
          result: null,
          error: null,
          completed_at: null,
          created_at: '',
          updated_at: ''
        }
      ]
    });
    mockCreateSession.mockResolvedValueOnce(created);

    const wrapper = mountChat();
    await flushPromises();

    await wrapper.find('.chat-input').setValue('How much on food?');
    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(mockCreateSession).toHaveBeenCalledWith({
      message: 'How much on food?',
      format_hint: undefined,
      defer_processing: false
    });
    expect(wrapper.text()).toContain('How much on food?');
    expect(wrapper.findComponent({ name: 'TypingDots' }).exists()).toBe(true);
  });

  it('renders a completed assistant message with scalar result', async () => {
    const existing = session({
      messages: [
        {
          id: 10,
          user_id: 1,
          role: 'user',
          content: 'Total?',
          status: null,
          format_hint: null,
          language: 'en',
          result: null,
          error: null,
          completed_at: null,
          created_at: '',
          updated_at: ''
        },
        {
          id: 11,
          user_id: null,
          role: 'assistant',
          content: 'You spent $500.',
          status: 'completed',
          format_hint: null,
          language: 'en',
          result: {
            source: 'smartql',
            format_type: 'scalar',
            rows: [{ total: 500 }],
            human_response: 'You spent $500.'
          },
          error: null,
          completed_at: '',
          created_at: '',
          updated_at: ''
        }
      ]
    });
    mockListSessions.mockResolvedValueOnce({
      data: [existing],
      current_page: 1,
      last_page: 1,
      total: 1
    });
    mockGetSession.mockResolvedValueOnce(existing);

    const wrapper = mountChat();
    await flushPromises();

    await wrapper.findAll('.session-item')[0].trigger('click');
    await flushPromises();

    // The prose answer is shown; the scalar echo is suppressed to avoid the
    // "$500" + "500" duplicate.
    expect(wrapper.find('.result-scalar').exists()).toBe(false);
    expect(wrapper.text()).toContain('You spent $500.');
  });

  it('renders failed assistant message with error', async () => {
    const existing = session({
      messages: [
        {
          id: 10,
          user_id: 1,
          role: 'user',
          content: 'bad',
          status: null,
          format_hint: null,
          language: 'en',
          result: null,
          error: null,
          completed_at: null,
          created_at: '',
          updated_at: ''
        },
        {
          id: 11,
          user_id: null,
          role: 'assistant',
          content: null,
          status: 'failed',
          format_hint: null,
          language: 'en',
          result: null,
          error: 'AI service unavailable',
          completed_at: '',
          created_at: '',
          updated_at: ''
        }
      ]
    });
    mockListSessions.mockResolvedValueOnce({
      data: [existing],
      current_page: 1,
      last_page: 1,
      total: 1
    });
    mockGetSession.mockResolvedValueOnce(existing);

    const wrapper = mountChat();
    await flushPromises();
    await wrapper.findAll('.session-item')[0].trigger('click');
    await flushPromises();

    expect(wrapper.text()).toContain('AI service unavailable');
    expect(wrapper.find('.bubble.error').exists()).toBe(true);
  });

  it('lists sessions in the sidebar', async () => {
    const s1 = session({ id: 1, title: 'First chat' });
    const s2 = session({ id: 2, title: 'Second chat' });
    mockListSessions.mockResolvedValueOnce({
      data: [s1, s2],
      current_page: 1,
      last_page: 1,
      total: 2
    });

    const wrapper = mountChat();
    await flushPromises();

    expect(wrapper.findAll('.session-item').length).toBe(2);
    expect(wrapper.text()).toContain('First chat');
    expect(wrapper.text()).toContain('Second chat');
  });

  it('does not send empty messages', async () => {
    const wrapper = mountChat();
    await flushPromises();

    await wrapper.find('form').trigger('submit');
    await flushPromises();

    expect(mockCreateSession).not.toHaveBeenCalled();
  });

  it('deletes a session when the remove button is clicked', async () => {
    const s1 = session({ id: 1, title: 'Goodbye' });
    mockListSessions.mockResolvedValueOnce({
      data: [s1],
      current_page: 1,
      last_page: 1,
      total: 1
    });
    mockDeleteSession.mockResolvedValueOnce(true);

    const wrapper = mountChat();
    await flushPromises();
    await wrapper.find('.remove-btn').trigger('click');
    await flushPromises();

    expect(mockDeleteSession).toHaveBeenCalledWith(1);
  });
});
