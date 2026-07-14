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
    if (!bodyEl || typeof window === 'undefined' || typeof document === 'undefined') return;

    // Print the live, already-styled report in place rather than in a popup. A
    // popup has to reload the app's styles asynchronously, so the auto-print
    // kept snapshotting the page before they applied. Here a clone of the
    // rendered report is appended as a top-level element (so no scrollable or
    // positioned ancestor can clip it) and @media print shows only that, using
    // the app's real styles that are already loaded and painted.
    const portal = document.createElement('div');
    portal.className = 'print-canvas-portal';

    const heading = document.createElement('h1');
    heading.textContent = title;
    portal.appendChild(heading);
    portal.appendChild(bodyEl.cloneNode(true));
    document.body.appendChild(portal);

    // A document should print light regardless of the on-screen theme.
    const html = document.documentElement;
    const wasDark = html.classList.contains('dark');
    if (wasDark) html.classList.remove('dark');
    document.body.classList.add('printing-canvas');

    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      document.body.classList.remove('printing-canvas');
      if (wasDark) html.classList.add('dark');
      portal.remove();
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);

    // A tick lets the print classes apply before the dialog opens; the trailing
    // timeout is a safety net for browsers that do not fire afterprint.
    window.setTimeout(() => {
      window.print();
      window.setTimeout(cleanup, 1000);
    }, 50);
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
