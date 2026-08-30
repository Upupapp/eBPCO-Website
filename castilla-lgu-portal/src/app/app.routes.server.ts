import { RenderMode, ServerRoute } from '@angular/ssr';
import { MUNICIPAL_OFFICES } from './core/data/offices.data';
import { PUBLIC_PERMIT_TYPES } from './core/data/permits.data';

/**
 * Every route is prerendered to a real HTML file at build time; nothing is
 * rendered on demand, and no server is deployed.
 *
 * The two parameterised routes need their slugs enumerated, and they are
 * enumerated from the same data the pages read — so a new office or permit
 * is prerendered by virtue of existing, with no second list to keep in step.
 */
export const serverRoutes: ServerRoute[] = [
  {
    path: 'offices/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => MUNICIPAL_OFFICES.map((office) => ({ slug: office.slug })),
  },
  {
    path: 'permits/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => PUBLIC_PERMIT_TYPES.map((permit) => ({ slug: permit.slug })),
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
