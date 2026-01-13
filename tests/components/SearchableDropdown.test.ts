import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import SearchableDropdown from '@/components/SearchableDropdown.vue';

const stubs = {
  MagnifyingGlassIcon: { template: '<span class="search-icon" />' },
  ChevronDownIcon: { template: '<span class="chevron-icon" />' }
};

const mockOptions = [
  { id: 1, name: 'Groceries' },
  { id: 2, name: 'Transport' },
  { id: 3, name: 'Entertainment' },
  { id: 4, name: 'Utilities' }
];

describe('SearchableDropdown', () => {
  describe('single select mode', () => {
    it('emits single option on select', async () => {
      const wrapper = mount(SearchableDropdown, {
        props: {
          options: mockOptions,
          multiple: false
        },
        global: { stubs }
      });

      await wrapper.find('input').trigger('focus');
      await nextTick();

      const firstOption = wrapper.findAll('li')[0];
      await firstOption.trigger('mousedown');

      expect(wrapper.emitted('select')).toBeTruthy();
      expect(wrapper.emitted('select')?.[0]?.[0]).toEqual({ id: 1, name: 'Groceries' });
    });

    it('emits option label via update:modelValue', async () => {
      const wrapper = mount(SearchableDropdown, {
        props: {
          options: mockOptions,
          multiple: false
        },
        global: { stubs }
      });

      await wrapper.find('input').trigger('focus');
      await nextTick();

      const firstOption = wrapper.findAll('li')[0];
      await firstOption.trigger('mousedown');

      expect(wrapper.emitted('update:modelValue')).toBeTruthy();
      expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('Groceries');
    });
  });

  describe('multi-select mode', () => {
    it('emits array of IDs on select', async () => {
      const wrapper = mount(SearchableDropdown, {
        props: {
          options: mockOptions,
          multiple: true
        },
        global: { stubs }
      });

      await wrapper.find('input').trigger('focus');
      await nextTick();

      const firstOption = wrapper.findAll('li')[0];
      await firstOption.trigger('mousedown');

      expect(wrapper.emitted('select')).toBeTruthy();
      expect(wrapper.emitted('select')?.[0]?.[0]).toEqual([1]);
    });

    it('emits cumulative array when selecting multiple items', async () => {
      const wrapper = mount(SearchableDropdown, {
        props: {
          options: mockOptions,
          multiple: true
        },
        global: { stubs }
      });

      await wrapper.find('input').trigger('focus');
      await nextTick();

      const options = wrapper.findAll('li');
      await options[0].trigger('mousedown');
      await options[1].trigger('mousedown');

      const selectEvents = wrapper.emitted('select');
      expect(selectEvents).toBeTruthy();
      expect(selectEvents?.[0]?.[0]).toEqual([1]);
      expect(selectEvents?.[1]?.[0]).toEqual([1, 2]);
    });

    it('removes ID from array when deselecting', async () => {
      const wrapper = mount(SearchableDropdown, {
        props: {
          options: mockOptions,
          multiple: true
        },
        global: { stubs }
      });

      await wrapper.find('input').trigger('focus');
      await nextTick();

      const options = wrapper.findAll('li');
      await options[0].trigger('mousedown');
      await options[1].trigger('mousedown');
      await options[0].trigger('mousedown');

      const selectEvents = wrapper.emitted('select');
      expect(selectEvents?.[2]?.[0]).toEqual([2]);
    });

    it('emits array of IDs via update:modelValue', async () => {
      const wrapper = mount(SearchableDropdown, {
        props: {
          options: mockOptions,
          multiple: true
        },
        global: { stubs }
      });

      await wrapper.find('input').trigger('focus');
      await nextTick();

      const options = wrapper.findAll('li');
      await options[0].trigger('mousedown');
      await options[2].trigger('mousedown');

      const modelValueEvents = wrapper.emitted('update:modelValue');
      expect(modelValueEvents?.[1]?.[0]).toEqual([1, 3]);
    });
  });

  describe('selected prop initialization', () => {
    it('initializes selectedItems from selected prop', async () => {
      const wrapper = mount(SearchableDropdown, {
        props: {
          options: mockOptions,
          multiple: true,
          selected: [1, 3]
        },
        global: { stubs }
      });

      await nextTick();

      const chips = wrapper.findAll('.input-chip');
      expect(chips.length).toBe(2);
      expect(chips[0].text()).toContain('Groceries');
      expect(chips[1].text()).toContain('Entertainment');
    });

    it('re-initializes when options load after selected', async () => {
      const wrapper = mount(SearchableDropdown, {
        props: {
          options: [],
          multiple: true,
          selected: [1, 3]
        },
        global: { stubs }
      });

      expect(wrapper.findAll('.input-chip').length).toBe(0);

      await wrapper.setProps({ options: mockOptions });
      await nextTick();

      const chips = wrapper.findAll('.input-chip');
      expect(chips.length).toBe(2);
    });

    it('updates selectedItems when selected prop changes', async () => {
      const wrapper = mount(SearchableDropdown, {
        props: {
          options: mockOptions,
          multiple: true,
          selected: [1]
        },
        global: { stubs }
      });

      await nextTick();
      expect(wrapper.findAll('.input-chip').length).toBe(1);

      await wrapper.setProps({ selected: [1, 2, 3] });
      await nextTick();

      expect(wrapper.findAll('.input-chip').length).toBe(3);
    });
  });

  describe('remove selected item', () => {
    it('emits array of remaining IDs when removing item via chip button', async () => {
      const wrapper = mount(SearchableDropdown, {
        props: {
          options: mockOptions,
          multiple: true,
          selected: [1, 2, 3]
        },
        global: { stubs }
      });

      await nextTick();

      const removeButtons = wrapper.findAll('.input-chip-remove');
      await removeButtons[1].trigger('click');

      const selectEvents = wrapper.emitted('select');
      expect(selectEvents).toBeTruthy();
      expect(selectEvents?.[0]?.[0]).toEqual([1, 3]);
    });
  });

  describe('filtering', () => {
    it('filters options based on search query', async () => {
      const wrapper = mount(SearchableDropdown, {
        props: {
          options: mockOptions,
          multiple: false
        },
        global: { stubs }
      });

      await wrapper.find('input').trigger('focus');
      await wrapper.find('input').setValue('Trans');
      await nextTick();

      const visibleOptions = wrapper.findAll('li');
      expect(visibleOptions.length).toBe(1);
      expect(visibleOptions[0].text()).toContain('Transport');
    });
  });
});
