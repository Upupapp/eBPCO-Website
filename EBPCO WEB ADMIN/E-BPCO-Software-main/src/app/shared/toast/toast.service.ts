import { Injectable, signal } from '@angular/core';

export type ToastTone = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: number;
  tone: ToastTone;
  text: string;
}

const EXIT_DURATION_MS = 200;

/**
 * The one place a page reports "that action just succeeded" or "that
 * action just failed" to the user — every mutating action across this app
 * used to either say nothing at all (the common case) or hand-roll its
 * own page-local signal/banner (quickActionError, actionError,
 * paymentFormError, releaseError, dropError — four independent copies of
 * the same idea, and none of them had a success-side equivalent). This
 * replaces "silent no-op on success" everywhere; the existing contextual
 * banners stay for explaining *why* a specific control is blocked, since
 * a toast disappears and they don't.
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  // Ids currently playing their exit animation — still in `toasts()` so
  // the template can render `.leaving`, but no longer "live" as far as
  // `dismiss` callers are concerned.
  private readonly _leaving = signal<ReadonlySet<number>>(new Set());
  readonly leaving = this._leaving.asReadonly();

  private nextId = 1;

  success(text: string): void {
    this.push('success', text);
  }

  error(text: string): void {
    this.push('error', text);
  }

  info(text: string): void {
    this.push('info', text);
  }

  dismiss(id: number): void {
    if (this._leaving().has(id)) return;
    this._leaving.update((s) => new Set(s).add(id));
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : EXIT_DURATION_MS;
    setTimeout(() => {
      this._toasts.update((list) => list.filter((t) => t.id !== id));
      this._leaving.update((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }, duration);
  }

  private push(tone: ToastTone, text: string): void {
    const id = this.nextId++;
    this._toasts.update((list) => [...list, { id, tone, text }]);
    // Errors stay up longer — that text is usually longer and more
    // important to actually finish reading than a short confirmation.
    setTimeout(() => this.dismiss(id), tone === 'error' ? 6000 : 4000);
  }
}
