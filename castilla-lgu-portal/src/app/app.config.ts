import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      // Without this the router leaves the scroll offset where it was, so
      // opening an office from part-way down the Offices list landed the
      // reader part-way down the office page. Both list pages are long enough
      // that this was the normal case, not an edge case.
      //
      // 'top' only applies to forward navigations — a back or forward gesture
      // still restores the position the reader left, which is what they mean
      // by going back.
      //
      // anchorScrolling matters here because the skip link added for WCAG
      // 2.4.1 is a fragment link: with scroll restoration on and this off, the
      // router's scroll handling and the browser's fragment handling disagree.
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
        anchorScrolling: 'enabled',
      }),
    ),
    provideClientHydration(),
  ],
};
