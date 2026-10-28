import { describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { ref } from 'vue';
import BudgetForm from '@/components/budgets/BudgetForm.vue';

vi.mock('~/composables/useSharedData', () => ({
  useSharedData: () => ({
    wallets: ref([{ id: 99, name: 'Private account', currency: 'EUR' }]),
    categories: ref([{ id: 98, name: 'Private category' }]),
    groups: ref([])
  })
}));

const targets = {
  wallets: [{ id: 10, name: 'Household cash', currency: 'USD' }],
  categories: [{ id: 20, name: 'Shared groceries' }],
  groups: []
};

describe('workspace budget editing', () => {
  it('only offers workspace targets and submits the chosen category', async () => {
    const wrapper = mount(BudgetForm, { props: { workspaceTargets: targets } });
    expect(wrapper.text()).toContain('Shared groceries');
    expect(wrapper.text()).not.toContain('Private category');
    await wrapper.get('input[type="text"]').setValue('Food together');
    await wrapper.get('input[type="number"]').setValue('200');
    await wrapper.get('.target-list input[type="checkbox"]').setValue(true);
    await wrapper.get('form').trigger('submit');
    expect(wrapper.emitted('created')?.[0]?.[0]).toMatchObject({
      name: 'Food together',
      amount: 200,
      targets: [{ type: 'category', id: 20 }]
    });
    const walletTab = wrapper
      .findAll('button')
      .find((button) => button.text().startsWith('Wallets'))!;
    await walletTab.trigger('click');
    expect(wrapper.text()).toContain('Household cash');
    expect(wrapper.text()).not.toContain('Private account');
  });

  it('does not fall back to private targets when a workspace has no labels', () => {
    const wrapper = mount(BudgetForm, {
      props: { workspaceTargets: { wallets: [], categories: [], groups: [] } }
    });
    expect(wrapper.text()).toContain('No categories yet.');
    expect(wrapper.findAll('.target-list input[type="checkbox"]')).toHaveLength(0);
    expect(wrapper.text()).not.toContain('Private category');
  });
});
