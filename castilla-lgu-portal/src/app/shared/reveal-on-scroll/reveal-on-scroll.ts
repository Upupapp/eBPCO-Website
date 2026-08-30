import { Directive, ElementRef, OnDestroy, OnInit, inject } from '@angular/core';

/**
 * Fades and rises an element in the first time it scrolls into view, then
 * stops watching it — a one-time entrance, not a replay on every scroll.
 *
 * Matches on the class rather than an attribute, so the markup that already
 * carries `.reveal` needs no change; a component opts in by importing this.
 *
 * This exists because the same twenty lines were copy-pasted into the home,
 * about and local-government components. That duplication had already cost
 * something real: an unguarded `new IntersectionObserver` threw wherever the
 * API is unavailable, aborting ngAfterViewInit before the home page's counters
 * ever ran, and fixing it meant making the identical edit in three files with
 * nothing to catch a fourth copy drifting.
 */
@Directive({
  selector: '.reveal',
})
export class RevealOnScroll implements OnInit, OnDestroy {
  private readonly host = inject(ElementRef<HTMLElement>);
  private observer?: IntersectionObserver;

  ngOnInit(): void {
    const element = this.host.nativeElement as HTMLElement;

    // Reveal immediately where the effect cannot or should not run, so the
    // content is never left invisible: a reader who prefers reduced motion
    // still gets the page, and a browser without IntersectionObserver gets it
    // rather than an exception.
    if (prefersReducedMotion() || typeof IntersectionObserver === 'undefined') {
      element.classList.add('in-view');
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('in-view');
          this.observer?.unobserve(entry.target);
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );
    this.observer.observe(element);
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}

function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}
