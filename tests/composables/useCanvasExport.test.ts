import { describe, it, expect, vi, afterEach } from 'vitest';
import { useCanvasExport } from '@/composables/useCanvasExport';

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  document.querySelectorAll('.print-canvas-portal').forEach((n) => n.remove());
  document.body.classList.remove('printing-canvas');
  document.documentElement.classList.remove('dark');
});

describe('useCanvasExport.printCanvas', () => {
  it('appends a styled clone of the report and prints in place', () => {
    vi.useFakeTimers();
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    const body = document.createElement('div');
    body.innerHTML = '<div class="kpi-card">Balance</div>';
    useCanvasExport().printCanvas(body, 'June Report');

    const portal = document.querySelector('.print-canvas-portal');
    expect(portal).not.toBeNull();
    expect(portal?.querySelector('h1')?.textContent).toBe('June Report');
    expect(portal?.textContent).toContain('Balance'); // the report body is cloned in
    expect(document.body.classList.contains('printing-canvas')).toBe(true);
    expect(printSpy).not.toHaveBeenCalled(); // deferred a tick

    vi.advanceTimersByTime(50);
    expect(printSpy).toHaveBeenCalledTimes(1);

    // cleanup removes the portal and print mode
    vi.advanceTimersByTime(1000);
    expect(document.querySelector('.print-canvas-portal')).toBeNull();
    expect(document.body.classList.contains('printing-canvas')).toBe(false);
  });

  it('prints light and restores the dark theme afterwards', () => {
    vi.useFakeTimers();
    vi.spyOn(window, 'print').mockImplementation(() => {});
    document.documentElement.classList.add('dark');

    useCanvasExport().printCanvas(document.createElement('div'), 'x');
    expect(document.documentElement.classList.contains('dark')).toBe(false); // light for print

    vi.advanceTimersByTime(1050);
    expect(document.documentElement.classList.contains('dark')).toBe(true); // restored after
  });

  it('does nothing when there is no body element', () => {
    useCanvasExport().printCanvas(null, 'x');
    expect(document.querySelector('.print-canvas-portal')).toBeNull();
  });
});
