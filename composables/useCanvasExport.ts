import aiApi from '@/services/api/aiApi';

/**
 * Canvas export. Print/PDF is fully client-side (clones the rendered canvas, incl.
 * chart SVGs, into a print window), so it needs no backend. Other formats go
 * through the backend exporter abstraction, so adding them later is a one-liner.
 */
export function useCanvasExport() {
  function slug(title: string): string {
    return (
      (title || 'document')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'document'
    );
  }

  function printCanvas(bodyEl: HTMLElement | null | undefined, title: string): void {
    if (!bodyEl || typeof window === 'undefined') return;
    const win = window.open('', '_blank', 'width=900,height=1000');
    if (!win) return;

    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
      <style>
        body { font-family: Ubuntu, -apple-system, Segoe UI, Roboto, sans-serif; color: #222; padding: 32px; max-width: 760px; margin: 0 auto; }
        h1, h2, h3, h4 { line-height: 1.25; }
        table { width: 100%; border-collapse: collapse; margin: 12px 0; }
        th, td { border: 1px solid #ddd; padding: 6px 10px; text-align: left; }
        th { background: #f3f5f4; }
        svg { max-width: 100%; }
      </style></head><body><h1>${title}</h1>${bodyEl.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    // Let charts/images paint before printing.
    setTimeout(() => win.print(), 300);
  }

  async function downloadExport(
    sessionId: number,
    messageId: number,
    title: string,
    format = 'md'
  ): Promise<void> {
    const api = useApi();
    const content = await api<string>(aiApi.exportCanvasUrl(sessionId, messageId, format), {
      responseType: 'text'
    });
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${slug(title)}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return { printCanvas, downloadExport };
}
