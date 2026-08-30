import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
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
