import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const source = readFileSync(resolve(__dirname, '../../assets/css/design-brand.css'), 'utf8');

const tokens = Object.fromEntries(
  [...source.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map((match) => [match[1], match[2]])
);

// The neutral steps the design system pairs brand colour against. Kept here rather than
// imported so a change in either repository fails this test instead of passing silently.
const neutral = {
  white: '#ffffff',
  '700': '#334155',
  '800': '#1e293b',
  '900': '#0f172a'
};

const channel = (value: number) =>
  value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;

const luminance = (hex: string) =>
  hex
    .slice(1)
    .match(/.{2}/g)!
    .map((part) => channel(parseInt(part, 16) / 255))
    .reduce((sum, value, index) => sum + [0.2126, 0.7152, 0.0722][index] * value, 0);

const contrast = (foreground: string, background: string) => {
  const [high, low] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
  return (high + 0.05) / (low + 0.05);
};

const pairs: Array<[string, string, string]> = [
  ['table heading on its fill', 'ds-brand-primary-900', 'ds-brand-primary-50'],
  ['brand text on its soft fill', 'ds-brand-primary-800', 'ds-brand-primary-50']
];

describe('design brand tokens', () => {
  it.each(pairs)('%s clears 4.5:1', (_name, foreground, background) => {
    expect(tokens[foreground]).toBeDefined();
    expect(tokens[background]).toBeDefined();
    expect(contrast(tokens[foreground], tokens[background])).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps inverse text legible on the primary fill', () => {
    expect(contrast(neutral.white, tokens['ds-brand-primary-800'])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(Object.entries(neutral).filter(([step]) => step !== 'white'))(
    'keeps the dark-mode brand ink legible on neutral %s',
    (_step, background) => {
      expect(contrast(tokens['ds-brand-primary-400'], background)).toBeGreaterThanOrEqual(4.5);
    }
  );
});
