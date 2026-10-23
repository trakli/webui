import type { Component } from 'vue';
import * as LucideIcons from 'lucide-vue-next';

const lucide = LucideIcons as unknown as Record<string, Component>;

export function integrationIcon(name: string | null | undefined): Component {
  if (!name) return lucide.Puzzle!;
  const pascal = name.replace(/(^\w|[-_ ]\w)/g, (m) => m.replace(/[-_ ]/, '').toUpperCase());
  return lucide[name] || lucide[pascal] || lucide.Puzzle!;
}
