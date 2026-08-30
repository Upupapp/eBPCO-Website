import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { RevealOnScroll } from './reveal-on-scroll';

@Component({
  selector: 'app-reveal-host',
  imports: [RevealOnScroll],
  template: `<div class="reveal">content</div>`,
})
class RevealHost {}

async function render() {
  await TestBed.configureTestingModule({ imports: [RevealHost] }).compileComponents();
  const fixture = TestBed.createComponent(RevealHost);
  fixture.detectChanges();
  return fixture.nativeElement.querySelector('.reveal') as HTMLElement;
}

describe('RevealOnScroll', () => {
  // jsdom provides no IntersectionObserver, which is the environment this
  // guard exists for. The three components that used to carry this logic
  // inline constructed one unguarded, so ngAfterViewInit threw and everything
  // scheduled after it — the home page's counters included — never ran.
  it('reveals immediately where IntersectionObserver is unavailable', async () => {
    expect(typeof IntersectionObserver).toBe('undefined');
    const el = await render();
    expect(el.classList.contains('in-view')).toBe(true);
  });

  it('does not throw while setting up', async () => {
    await expect(render()).resolves.toBeTruthy();
  });

  it('reveals immediately when the reader prefers reduced motion', async () => {
    const original = window.matchMedia;
    window.matchMedia = ((q: string) => ({
      matches: true,
      media: q,
      addEventListener() {},
      removeEventListener() {},
    })) as never;
    try {
      const el = await render();
      expect(el.classList.contains('in-view')).toBe(true);
    } finally {
      // Restoring this matters: a leaked matchMedia stub changes how every
      // later spec in the run behaves.
      window.matchMedia = original;
    }
  });
});
