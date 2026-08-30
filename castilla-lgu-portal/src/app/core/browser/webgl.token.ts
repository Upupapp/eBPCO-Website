import { InjectionToken } from '@angular/core';

/**
 * Whether this browser can render WebGL content.
 *
 * OpenStreetMap's embed is MapLibre GL: without WebGL it renders its own
 * "your browser does not support WebGL" notice rather than a map. Knowing in
 * advance lets the page offer something useful instead of handing the reader
 * a broken frame.
 *
 * Behind a token so a test can assert both branches — jsdom has no WebGL, so
 * the supported path is otherwise unreachable.
 */
export const WEBGL_SUPPORT = new InjectionToken<boolean>('WEBGL_SUPPORT', {
  providedIn: 'root',
  factory: () => {
    // Optimistic where there is no document to ask — during prerendering.
    // The alternative is worse than it looks: answering false would bake
    // "an interactive map cannot be displayed on this device" into the HTML
    // every visitor receives, including the overwhelming majority whose
    // browser is perfectly capable, and only correct it once hydration runs.
    // Assuming capable and letting the client downgrade is the honest
    // default, and clicking through on a browser that genuinely lacks WebGL
    // reaches OpenStreetMap's own notice rather than nothing.
    if (typeof document === 'undefined') return true;
    try {
      const canvas = document.createElement('canvas');
      // webgl2 first: some browsers expose it while returning null for the
      // WebGL 1 context name, which a naive check reads as unsupported.
      return !!(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
    } catch {
      // Some privacy-hardened browsers throw here rather than returning null.
      return false;
    }
  },
});
