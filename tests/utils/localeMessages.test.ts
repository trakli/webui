import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { baseCompile } from '@intlify/message-compiler';

const dir = join(__dirname, '../../i18n/locales');

describe('locale files', () => {
  for (const file of readdirSync(dir).filter((name) => name.endsWith('.json'))) {
    it(`${file} compiles, so the whole locale loads`, () => {
      const messages = JSON.parse(readFileSync(join(dir, file), 'utf8')) as Record<string, string>;
      const broken: string[] = [];
      for (const [key, message] of Object.entries(messages)) {
        baseCompile(message, { onError: () => broken.push(key) });
      }
      expect(broken).toEqual([]);
    });
  }
});
