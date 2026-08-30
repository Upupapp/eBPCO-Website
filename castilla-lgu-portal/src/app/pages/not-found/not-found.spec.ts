import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Meta } from '@angular/platform-browser';
import { NotFound } from './not-found';
import { routes } from '../../app.routes';

async function render() {
  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [NotFound],
    providers: [provideRouter([])],
  }).compileComponents();
  const fixture = TestBed.createComponent(NotFound);
  fixture.detectChanges();
  return fixture;
}

describe('NotFound', () => {
  // Regression guard for F-15. The catch-all was { path: '**', redirectTo: '' },
  // so every mistyped or retired address quietly rendered the homepage — a
  // broken link looked like a working one, and a crawler saw the same content
  // at unlimited distinct URLs.
  it('is what the catch-all route resolves to, not a redirect home', () => {
    const catchAll = routes.find((r) => r.path === '**');
    expect(catchAll).toBeTruthy();
    expect(catchAll!.redirectTo).toBeUndefined();
    expect(catchAll!.loadComponent).toBeTypeOf('function');
  });

  it('says the page was not found', async () => {
    const fixture = await render();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Page not found');
    expect(text).toContain("We couldn't find that page.");
  });

  it('offers a route out to every main section', async () => {
    const fixture = await render();
    const hrefs = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.not-found-links a'),
    ).map((a) => a.getAttribute('href'));

    expect(hrefs).toContain('/');
    expect(hrefs).toContain('/offices');
    expect(hrefs).toContain('/permits');
    expect(hrefs).toContain('/announcements');
  });

  // The hosting rewrite answers every unmatched path with the shell at HTTP
  // 200 and a client router cannot change that, so noindex is the only signal
  // available to say this address is not real content.
  it('asks crawlers not to index it', async () => {
    const fixture = await render();
    const meta = TestBed.inject(Meta);
    expect(meta.getTag("name='robots'")?.content).toBe('noindex, follow');
  });

  it('withdraws the noindex tag when navigated away from', async () => {
    const fixture = await render();
    const meta = TestBed.inject(Meta);
    expect(meta.getTag("name='robots'")).toBeTruthy();

    fixture.destroy();
    // Left behind, it would silently de-index every page visited afterwards.
    expect(meta.getTag("name='robots'")).toBeNull();
  });
});
