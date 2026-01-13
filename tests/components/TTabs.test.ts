import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TTabs from '@/components/TTabs.vue';

const mockIcon = {
  template: '<span class="mock-icon" />'
};

const defaultTabs = [
  { id: 'tab1', label: 'Tab One', icon: mockIcon },
  { id: 'tab2', label: 'Tab Two', icon: mockIcon },
  { id: 'tab3', label: 'Tab Three', icon: mockIcon }
];

describe('TTabs', () => {
  describe('rendering', () => {
    it('renders tabs container', () => {
      const wrapper = mount(TTabs, {
        props: { tabs: defaultTabs, activeTab: 'tab1' }
      });

      expect(wrapper.find('.tabs-container').exists()).toBe(true);
    });

    it('renders all provided tabs as buttons', () => {
      const wrapper = mount(TTabs, {
        props: { tabs: defaultTabs, activeTab: 'tab1' }
      });

      const buttons = wrapper.findAll('.tab-btn');
      expect(buttons.length).toBe(3);
    });

    it('renders tab labels', () => {
      const wrapper = mount(TTabs, {
        props: { tabs: defaultTabs, activeTab: 'tab1' }
      });

      expect(wrapper.text()).toContain('Tab One');
      expect(wrapper.text()).toContain('Tab Two');
      expect(wrapper.text()).toContain('Tab Three');
    });

    it('renders tab icons', () => {
      const wrapper = mount(TTabs, {
        props: { tabs: defaultTabs, activeTab: 'tab1' }
      });

      const icons = wrapper.findAll('.tab-icon');
      expect(icons.length).toBe(3);
    });

    it('renders tabs content area', () => {
      const wrapper = mount(TTabs, {
        props: { tabs: defaultTabs, activeTab: 'tab1' }
      });

      expect(wrapper.find('.tabs-content').exists()).toBe(true);
    });
  });

  describe('active state', () => {
    it('applies active class to selected tab', () => {
      const wrapper = mount(TTabs, {
        props: { tabs: defaultTabs, activeTab: 'tab2' }
      });

      const buttons = wrapper.findAll('.tab-btn');
      expect(buttons[0].classes()).not.toContain('active');
      expect(buttons[1].classes()).toContain('active');
      expect(buttons[2].classes()).not.toContain('active');
    });

    it('changes active class when activeTab prop changes', async () => {
      const wrapper = mount(TTabs, {
        props: { tabs: defaultTabs, activeTab: 'tab1' }
      });

      expect(wrapper.findAll('.tab-btn')[0].classes()).toContain('active');

      await wrapper.setProps({ activeTab: 'tab3' });

      expect(wrapper.findAll('.tab-btn')[0].classes()).not.toContain('active');
      expect(wrapper.findAll('.tab-btn')[2].classes()).toContain('active');
    });
  });

  describe('events', () => {
    it('emits update:activeTab when tab is clicked', async () => {
      const wrapper = mount(TTabs, {
        props: { tabs: defaultTabs, activeTab: 'tab1' }
      });

      await wrapper.findAll('.tab-btn')[1].trigger('click');

      expect(wrapper.emitted('update:activeTab')).toBeTruthy();
      expect(wrapper.emitted('update:activeTab')![0]).toEqual(['tab2']);
    });

    it('emits correct tab id for each tab click', async () => {
      const wrapper = mount(TTabs, {
        props: { tabs: defaultTabs, activeTab: 'tab1' }
      });

      await wrapper.findAll('.tab-btn')[2].trigger('click');

      expect(wrapper.emitted('update:activeTab')![0]).toEqual(['tab3']);
    });
  });

  describe('slots', () => {
    it('renders slot content for active tab', () => {
      const wrapper = mount(TTabs, {
        props: { tabs: defaultTabs, activeTab: 'tab1' },
        slots: {
          tab1: '<div class="tab1-content">Content for Tab 1</div>'
        }
      });

      expect(wrapper.find('.tab1-content').exists()).toBe(true);
      expect(wrapper.text()).toContain('Content for Tab 1');
    });

    it('shows different slot content when active tab changes', async () => {
      const wrapper = mount(TTabs, {
        props: { tabs: defaultTabs, activeTab: 'tab1' },
        slots: {
          tab1: '<div class="tab1-content">Tab 1 Content</div>',
          tab2: '<div class="tab2-content">Tab 2 Content</div>'
        }
      });

      expect(wrapper.find('.tab1-content').exists()).toBe(true);

      await wrapper.setProps({ activeTab: 'tab2' });

      expect(wrapper.find('.tab2-content').exists()).toBe(true);
    });
  });
});
