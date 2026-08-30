import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home),
  },
  {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then((m) => m.About),
  },
  {
    path: 'local-government',
    loadComponent: () =>
      import('./pages/local-government/local-government').then((m) => m.LocalGovernment),
  },
  {
    path: 'offices',
    loadComponent: () => import('./pages/offices/offices').then((m) => m.Offices),
  },
  {
    path: 'offices/:slug',
    loadComponent: () => import('./pages/office-detail/office-detail').then((m) => m.OfficeDetail),
  },
  {
    path: 'permits',
    loadComponent: () => import('./pages/permits/permits').then((m) => m.Permits),
  },
  {
    path: 'permits/:slug',
    loadComponent: () => import('./pages/permit-detail/permit-detail').then((m) => m.PermitDetail),
  },
  {
    path: 'announcements',
    loadComponent: () => import('./pages/announcements/announcements').then((m) => m.Announcements),
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
  },
  {
    path: 'privacy',
    loadComponent: () => import('./pages/privacy/privacy').then((m) => m.Privacy),
  },
  {
    // A concrete path as well as the catch-all, so the not-found page
    // prerenders to a real file. Netlify serves 404.html with a genuine 404
    // status for any address that has no file of its own, which is what makes
    // the status code honest rather than the 200 a client router is stuck
    // with.
    path: '404',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
  // Not a redirect to '': that answered every mistyped or retired address
  // with the homepage, so a broken link looked like a working one and a
  // crawler saw duplicate content at every wrong URL.
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found').then((m) => m.NotFound),
  },
];
