import { describe, it, expect } from 'vitest';
import { renderMarkdown } from '@/composables/useMarkdown';

describe('renderMarkdown', () => {
  it('renders GitHub-flavored markdown', () => {
    const html = renderMarkdown('# Title\n\nSome **bold** and a list:\n\n- one\n- two');
    expect(html).toContain('<strong>bold</strong>');
    expect(html).toContain('<li>one</li>');
  });

  it('renders tables', () => {
    const html = renderMarkdown('| a | b |\n|---|---|\n| 1 | 2 |');
    expect(html).toContain('<table>');
    expect(html).toContain('<td>1</td>');
  });

  it('escapes raw HTML so no active markup survives', () => {
    const html = renderMarkdown('Hello <script>alert(1)</script> <img src=x onerror=alert(1)>');
    // Raw HTML is escaped to inert text, not rendered as live elements.
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;script&gt;');
  });

  it('is safe on empty/nullish input', () => {
    expect(renderMarkdown('')).toBe('');
    expect(renderMarkdown(null)).toBe('');
  });
});
