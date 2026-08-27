import { Directive, ElementRef, Input, NgZone, OnChanges, SimpleChanges, inject } from '@angular/core';

const DURATION_MS = 900;

// Animates a KPI's displayed value from 0 up to its real value on first
// render, preserving whatever currency/comma/decimal formatting the source
// string already carries — it only ever re-renders the same string shape
// with a smaller number inside it, never invents its own format. Only
// animates once per host (the first value it receives); later value
// changes render immediately, since a metric quietly updating mid-session
// counting up again would read as noise, not confirmation.
@Directive({ selector: '[appCountUp]' })
export class CountUpDirective implements OnChanges {
  @Input('appCountUp') value = '';

  private readonly el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
  private readonly zone = inject(NgZone);
  private hasAnimated = false;
  private rafId: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['value'] && !this.hasAnimated) {
      this.hasAnimated = true;
      this.animateTo(this.value);
    } else {
      this.el.textContent = this.value;
    }
  }

  ngOnDestroy(): void {
    if (this.rafId !== null) cancelAnimationFrame(this.rafId);
  }

  private animateTo(target: string): void {
    const match = target.match(/-?[\d,]+(\.\d+)?/);
    if (!match || this.prefersReducedMotion()) {
      this.el.textContent = target;
      return;
    }

    const numStr = match[0];
    const targetNum = parseFloat(numStr.replace(/,/g, ''));
    const start = match.index ?? 0;
    const prefix = target.slice(0, start);
    const suffix = target.slice(start + numStr.length);
    const useCommas = numStr.includes(',');
    const decimals = numStr.includes('.') ? numStr.split('.')[1].length : 0;
    const startTime = performance.now();

    this.zone.runOutsideAngular(() => {
      const tick = (now: number) => {
        const t = Math.min((now - startTime) / DURATION_MS, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        this.el.textContent = prefix + this.format(targetNum * eased, decimals, useCommas) + suffix;
        if (t < 1) {
          this.rafId = requestAnimationFrame(tick);
        } else {
          this.el.textContent = target;
          this.el.classList.add('count-up-landed');
        }
      };
      this.rafId = requestAnimationFrame(tick);
    });
  }

  private format(n: number, decimals: number, useCommas: boolean): string {
    const fixed = n.toFixed(decimals);
    if (!useCommas) return fixed;
    const [intPart, decPart] = fixed.split('.');
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decPart ? `${withCommas}.${decPart}` : withCommas;
  }

  private prefersReducedMotion(): boolean {
    // jsdom (the test environment) doesn't implement matchMedia — treat
    // its absence the same as "reduced motion," which also happens to be
    // the safe default (renders the final value immediately, no rAF loop).
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
