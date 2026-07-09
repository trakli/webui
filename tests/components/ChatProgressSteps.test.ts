import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import ChatProgressSteps from '@/components/ai/ChatProgressSteps.vue';

const mountSteps = (steps: string[]) => mount(ChatProgressSteps, { props: { steps } });

describe('ChatProgressSteps', () => {
  it('renders every step label', () => {
    const w = mountSteps(['Looking through your records', 'Crunching the numbers']);
    expect(w.text()).toContain('Looking through your records');
    expect(w.text()).toContain('Crunching the numbers');
  });

  it('marks all but the last step as done and spins the last', () => {
    const w = mountSteps(['A', 'B', 'C']);
    expect(w.findAll('.progress-step.done')).toHaveLength(2);
    expect(w.findAll('.step-spinner')).toHaveLength(1);
  });

  it('shows a single active step with no done markers', () => {
    const w = mountSteps(['Only step']);
    expect(w.findAll('.progress-step.done')).toHaveLength(0);
    expect(w.findAll('.step-spinner')).toHaveLength(1);
  });
});
