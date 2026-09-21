import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import FeedbackPage from '@/pages/feedback.vue';

vi.stubGlobal('definePageMeta', vi.fn());

vi.mock('@/composables/useFeedback', () => ({
  useFeedback: () => ({ list: async () => [], send: async () => ({}) })
}));

vi.mock('~/composables/useNotifications', () => ({
  useNotifications: () => ({ showSuccess: vi.fn(), showError: vi.fn() })
}));

describe('feedback page', () => {
  it('has a button that actually submits the form', () => {
    const wrapper = mount(FeedbackPage);

    expect(wrapper.find('form button').attributes('type')).toBe('submit');
  });
});
