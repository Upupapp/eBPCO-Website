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
    if (typeof document === 'undefined') return false;
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
