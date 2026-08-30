import { TestBed } from '@angular/core/testing';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { appConfig } from './app.config';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  // Regression guard for F-12. The header carries six nav links plus two
  // controls, so without a skip link every keyboard and screen-reader user
  // traversed all of them on every page. WCAG 2.4.1.
  it('offers a skip link that targets the main landmark', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    const skip = host.querySelector('a.skip-link');
    expect(skip).not.toBeNull();

    const target = skip!.getAttribute('href');
    expect(target).toBe('#main-content');

    const main = host.querySelector('main');
    expect(main).not.toBeNull();
    expect(main!.id).toBe('main-content');
    // Focusable programmatically, so activating the link moves focus and not
    // merely the scroll position.
    expect(main!.getAttribute('tabindex')).toBe('-1');
  });

  it('puts the skip link before the header in the tab order', () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;

    const focusable = host.querySelectorAll('a, button');
    expect(focusable.length).toBeGreaterThan(1);
    expect(focusable[0].classList.contains('skip-link')).toBe(true);
  });
});

describe('router configuration', () => {
  // Regression guard for F-08. Angular's default scroll behaviour is
  // 'disabled', which leaves the offset untouched across navigations, so
  // opening an office from part-way down the Offices list landed the reader
  // part-way down the office page.
  //
  // withInMemoryScrolling registers its scroller under a token @angular/router
  // does not export, so the token is recovered from the feature itself — which
  // means this asserts against the application's real appConfig rather than a
  // constant restated in the test.
  const scrollerToken = (
    withInMemoryScrolling({}) as unknown as { ɵproviders: Array<{ provide: unknown }> }
  ).ɵproviders[0].provide;

  async function routerScroller(): Promise<{ options: Record<string, unknown> }> {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      providers: [...appConfig.providers],
    }).compileComponents();
    return TestBed.inject(scrollerToken as never);
  }

  it('registers an in-memory scroller at all', async () => {
    expect(await routerScroller()).toBeTruthy();
  });

  it('scrolls to the top on a forward navigation', async () => {
    const scroller = await routerScroller();
    expect(scroller.options['scrollPositionRestoration']).toBe('top');
  });

  it('keeps fragment links working, which the skip link depends on', async () => {
    const scroller = await routerScroller();
    expect(scroller.options['anchorScrolling']).toBe('enabled');
  });
});
