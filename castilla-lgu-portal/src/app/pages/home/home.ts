import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  WritableSignal,
  inject,
  signal,
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PROVINCE_NAME } from '../../core/data/municipality.data';
import { PROFILE_FIELDS_SOURCE } from '../../core/data/municipality.token';
import { ProfileField } from '../../core/models/official.model';
import { Icon, IconName } from '../../shared/icon/icon';
import { RevealOnScroll } from '../../shared/reveal-on-scroll/reveal-on-scroll';

interface QuickNavItem {
  title: string;
  description: string;
  path: string;
  icon: IconName;
}

// Maps each "at a glance" field to a representative icon. Fields not listed
// here (there are none currently, but new ones default gracefully) fall
// back to 'id' in fieldIcon() below.
const FIELD_ICONS: Record<string, IconName> = {
  Province: 'pin',
  Region: 'map',
  Country: 'flag',
  'Income Classification': 'chart',
  'Number of Barangays': 'grid',
  Population: 'person',
  'Land Area': 'landscape',
  'ZIP Code': 'mail',
  'PSGC Code': 'id',
  'Founding / Establishment': 'calendar',
  Demonym: 'users',
};

@Component({
  selector: 'app-home',
  imports: [RouterLink, DecimalPipe, Icon, RevealOnScroll],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements AfterViewInit, OnDestroy {
  private readonly host: ElementRef<HTMLElement> = inject(ElementRef);

  readonly municipalityShortName = 'Castilla';
  readonly provinceName = PROVINCE_NAME;
  // Unconfirmed fields are omitted rather than shown with a "pending"
  // placeholder — this panel only ever displays verified facts. Every field
  // in PROFILE_FIELDS is confirmed today, so nothing is currently dropped.
  readonly profileFields = inject(PROFILE_FIELDS_SOURCE).filter((f) => !f.isPlaceholder);

  readonly quickNav: QuickNavItem[] = [
    {
      title: 'About Castilla',
      description: 'Learn about the municipality.',
      path: '/about',
      icon: 'landmark',
    },
    {
      title: 'Local Government',
      description: 'Meet the municipal leadership.',
      path: '/local-government',
      icon: 'users',
    },
    {
      title: 'Municipal Offices',
      description: 'Find the office you need.',
      path: '/offices',
      icon: 'briefcase',
    },
    {
      title: 'Permits & Services',
      description: 'See what LGU Castilla issues and what you need to apply.',
      path: '/permits',
      icon: 'id',
    },
    {
      title: 'Contact & Location',
      description: 'Get in touch with LGU Castilla.',
      path: '/contact',
      icon: 'pin',
    },
  ];

  // Count-up state for the "at a glance" fields that are genuine magnitudes.
  // Which fields those are, and what they count to, is decided entirely by
  // `count` in municipality.data.ts — nothing is hardcoded here, so revising
  // the sourced data revises what the page animates to. Fields without a
  // `count` (ZIP, PSGC, Province…) render `value` verbatim instead.
  private readonly counters = new Map<string, WritableSignal<number>>(
    this.profileFields.filter((f) => f.count !== undefined).map((f) => [f.label, signal(0)]),
  );

  /** Current animated value for a counting field; the real value if it isn't animating. */
  countValue(field: ProfileField): number {
    return this.counters.get(field.label)?.() ?? field.count ?? 0;
  }

  /** DecimalPipe format matching the precision `value` is written to in the data. */
  countFormat(field: ProfileField): string {
    const digits = field.countDecimals ?? 0;
    return `1.${digits}-${digits}`;
  }

  private countersObserver?: IntersectionObserver;
  private readonly countRafs = new Set<number>();
  private onScroll?: () => void;
  private parallaxRaf: number | null = null;
  private readonly reducedMotion =
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  fieldIcon(label: string): IconName {
    return FIELD_ICONS[label] ?? 'id';
  }

  ngAfterViewInit(): void {
    this.setupCounters();
    this.setupParallax();
  }

  ngOnDestroy(): void {
    this.countersObserver?.disconnect();
    if (this.onScroll) window.removeEventListener('scroll', this.onScroll);
    if (this.parallaxRaf !== null) cancelAnimationFrame(this.parallaxRaf);
    for (const raf of this.countRafs) cancelAnimationFrame(raf);
    this.countRafs.clear();
  }

  private setupCounters(): void {
    const targets = this.profileFields.filter((f) => f.count !== undefined);
    if (!targets.length) return;

    // Settle on the real values first, so the panel is never left reading
    // zero if the observer below never fires — a tall grid on a short
    // viewport can sit under the 0.3 threshold indefinitely, and a browser
    // without IntersectionObserver has no observer at all.
    const settle = () => {
      for (const field of targets) this.counters.get(field.label)?.set(field.count!);
    };

    const glance = this.host.nativeElement.querySelector<HTMLElement>('.glance-grid');
    if (this.reducedMotion || !glance || typeof IntersectionObserver === 'undefined') {
      settle();
      return;
    }

    this.countersObserver = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          for (const field of targets) {
            const counter = this.counters.get(field.label);
            if (counter) this.animateCount((v) => counter.set(v), field.count!);
          }
          this.countersObserver?.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    this.countersObserver.observe(glance);
  }

  private animateCount(setValue: (v: number) => void, to: number, durationMs = 1400): void {
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic — quick start, gentle settle
      setValue(to * eased);
      if (t < 1) this.countRafs.add(requestAnimationFrame(step));
    };
    this.countRafs.add(requestAnimationFrame(step));
  }

  // Restrained depth cue on the hero photo: it drifts a few pixels slower
  // than the page scrolls, capped well inside the oversized buffer in
  // home.scss so the photo never exposes an edge.
  private setupParallax(): void {
    if (this.reducedMotion) return;
    const photo = this.host.nativeElement.querySelector<HTMLElement>('.hero-photo');
    if (!photo) return;

    this.onScroll = () => {
      if (this.parallaxRaf !== null) return;
      this.parallaxRaf = requestAnimationFrame(() => {
        const offset = Math.min(window.scrollY * 0.15, 60);
        photo.style.transform = `translateY(${-offset}px)`;
        this.parallaxRaf = null;
      });
    };
    window.addEventListener('scroll', this.onScroll, { passive: true });
  }
}
