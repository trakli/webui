// @vitest-environment node

import { describe, expect, it } from 'vitest';

describe('shared design server rendering', () => {
  it('loads without a browser window', async () => {
    expect(typeof window).toBe('undefined');
    const design = await import('@whilesmart/design');
    expect(design.DsButton).toBeDefined();
  });
});
