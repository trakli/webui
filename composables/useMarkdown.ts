import MarkdownIt from 'markdown-it';

// `html: false` escapes all raw HTML in the source, so neither the model nor any
// embedded record text can inject active markup. markdown-it's built-in
// validateLink also blocks dangerous link protocols (javascript:, vbscript:,
// non-image data:). This is pure JS and safe to evaluate during SSR (no DOM).
const md = new MarkdownIt({
  html: false,
  linkify: true,
  breaks: true
});

export function renderMarkdown(text: string | null | undefined): string {
  return md.render(text ?? '');
}

export function useMarkdown() {
  return { renderMarkdown };
}
