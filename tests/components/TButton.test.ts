import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import TButton from '@/components/TButton.vue';

const stubs = {
  NuxtLink: {
    template: '<a :href="to"><slot /></a>',
    props: ['to']
  },
  Loader2: {
    template: '<span class="loader-stub">Loading...</span>'
  }
};

describe('TButton', () => {
  describe('rendering', () => {
    it('renders with default props', () => {
      const wrapper = mount(TButton, { global: { stubs } });

      expect(wrapper.find('button').exists()).toBe(true);
      expect(wrapper.text()).toContain('Button');
    });

    it('renders custom text via prop', () => {
      const wrapper = mount(TButton, {
        props: { text: 'Submit' },
        global: { stubs }
      });

      expect(wrapper.text()).toContain('Submit');
    });

    it('renders slot content instead of text prop', () => {
      const wrapper = mount(TButton, {
        slots: { default: 'Click Me' },
        global: { stubs }
      });

      expect(wrapper.text()).toContain('Click Me');
    });

    it('renders as NuxtLink when "to" prop is provided', () => {
      const wrapper = mount(TButton, {
        props: { to: '/dashboard' },
        global: { stubs }
      });

      expect(wrapper.find('a').exists()).toBe(true);
      expect(wrapper.find('button').exists()).toBe(false);
    });
  });

  describe('variants', () => {
    it('applies primary variant class by default', () => {
      const wrapper = mount(TButton, { global: { stubs } });

      expect(wrapper.classes()).toContain('button--primary');
    });

    it('applies secondary variant class', () => {
      const wrapper = mount(TButton, {
        props: { variant: 'secondary' },
        global: { stubs }
      });

      expect(wrapper.classes()).toContain('button--secondary');
    });

    it('applies outline variant class', () => {
      const wrapper = mount(TButton, {
        props: { variant: 'outline' },
        global: { stubs }
      });

      expect(wrapper.classes()).toContain('button--outline');
    });

    it('applies text variant class', () => {
      const wrapper = mount(TButton, {
        props: { variant: 'text' },
        global: { stubs }
      });

      expect(wrapper.classes()).toContain('button--text');
    });
  });

  describe('sizes', () => {
    it('applies medium size class by default', () => {
      const wrapper = mount(TButton, { global: { stubs } });

      expect(wrapper.classes()).toContain('button--medium');
    });

    it('applies small size class', () => {
      const wrapper = mount(TButton, {
        props: { size: 'small' },
        global: { stubs }
      });

      expect(wrapper.classes()).toContain('button--small');
    });

    it('applies large size class', () => {
      const wrapper = mount(TButton, {
        props: { size: 'large' },
        global: { stubs }
      });

      expect(wrapper.classes()).toContain('button--large');
    });
  });

  describe('states', () => {
    it('applies full-width class by default', () => {
      const wrapper = mount(TButton, { global: { stubs } });

      expect(wrapper.classes()).toContain('button--full-width');
    });

    it('does not apply full-width class when disabled', () => {
      const wrapper = mount(TButton, {
        props: { fullWidth: false },
        global: { stubs }
      });

      expect(wrapper.classes()).not.toContain('button--full-width');
    });

    it('is disabled when disabled prop is true', () => {
      const wrapper = mount(TButton, {
        props: { disabled: true },
        global: { stubs }
      });

      expect(wrapper.find('button').attributes('disabled')).toBeDefined();
      expect(wrapper.classes()).toContain('button--disabled');
    });

    it('is disabled when loading prop is true', () => {
      const wrapper = mount(TButton, {
        props: { loading: true },
        global: { stubs }
      });

      expect(wrapper.find('button').attributes('disabled')).toBeDefined();
      expect(wrapper.classes()).toContain('button--disabled');
    });

    it('shows loading spinner when loading', () => {
      const wrapper = mount(TButton, {
        props: { loading: true },
        global: { stubs }
      });

      expect(wrapper.find('.spinner').exists()).toBe(true);
    });

    it('hides slot content when loading', () => {
      const wrapper = mount(TButton, {
        props: { loading: true },
        slots: { default: 'Submit' },
        global: { stubs }
      });

      expect(wrapper.text()).not.toContain('Submit');
    });
  });

  describe('button type', () => {
    it('has type="button" by default', () => {
      const wrapper = mount(TButton, { global: { stubs } });

      expect(wrapper.find('button').attributes('type')).toBe('button');
    });

    it('can be type="submit"', () => {
      const wrapper = mount(TButton, {
        props: { type: 'submit' },
        global: { stubs }
      });

      expect(wrapper.find('button').attributes('type')).toBe('submit');
    });
  });

  describe('left icon slot', () => {
    it('renders left icon slot content', () => {
      const wrapper = mount(TButton, {
        slots: {
          'left-icon': '<span class="test-icon">Icon</span>'
        },
        global: { stubs }
      });

      expect(wrapper.find('.button__icon-left').exists()).toBe(true);
      expect(wrapper.find('.test-icon').exists()).toBe(true);
    });
  });
});
