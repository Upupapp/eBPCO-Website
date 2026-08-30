import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SiteHeader } from './site-header';

async function render() {
  await TestBed.configureTestingModule({
    imports: [SiteHeader],
    providers: [provideRouter([])],
  }).compileComponents();

  const fixture = TestBed.createComponent(SiteHeader);
  fixture.detectChanges();
  return fixture;
}

describe('SiteHeader', () => {
  // Regression guard for F-04. The Announcements control sat in the header of
  // every page for the life of the portal as a styled <button> with no click
  // handler and no route — it did nothing, on a live public site, with no
  // disabled state to say so. Nothing caught it because the header had no
  // spec at all, which is why this file exists.
  it('routes the Announcements control somewhere instead of doing nothing', async () => {
    const fixture = await render();
    const host = fixture.nativeElement as HTMLElement;

    const control = host.querySelector('.announcements-btn');
    expect(control).not.toBeNull();
    expect(control!.tagName).toBe('A');
    expect(control!.getAttribute('href')).toBe('/announcements');
  });

  it('leaves no interactive control in the header without a destination or a handler', async () => {
    const fixture = await render();
    const host = fixture.nativeElement as HTMLElement;

    const inert = Array.from(host.querySelectorAll('button, a')).filter((el) => {
      if (el.tagName === 'A') return !el.getAttribute('href');
      // The mobile toggle is a real button with a handler; it is identified by
      // the aria-expanded state it maintains rather than by a href.
      return !el.hasAttribute('aria-expanded') && !el.hasAttribute('disabled');
    });

    expect(inert.map((el) => el.className || el.tagName)).toEqual([]);
  });

  it('exposes every primary nav destination', async () => {
    const fixture = await render();
    const host = fixture.nativeElement as HTMLElement;

    const hrefs = Array.from(host.querySelectorAll('.primary-nav a')).map((a) =>
      a.getAttribute('href'),
    );
    expect(hrefs).toEqual(['/', '/about', '/local-government', '/offices', '/permits', '/contact']);
  });
});
