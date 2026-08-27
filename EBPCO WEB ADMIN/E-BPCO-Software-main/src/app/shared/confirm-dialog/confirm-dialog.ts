import { Component, input, output, signal } from '@angular/core';

const EXIT_DURATION_MS = 200;

// A single reusable confirmation prompt (built on the app's existing
// .modal-backdrop/.modal-box classes — see shared/styles/_modal.scss)
// for any "are you sure?" action, most commonly Delete. Callers own
// their own open/closed state and just render this conditionally.
//
// Confirm/cancel don't emit immediately — they flip `closing` first so
// _modal.scss's exit keyframes get a chance to play, then emit once that's
// done. This keeps the exit-animation lifecycle self-contained here rather
// than requiring every caller to manage a "closing" flag of its own.
@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.html',
  styleUrl: './confirm-dialog.scss',
})
export class ConfirmDialog {
  readonly title = input.required<string>();
  readonly message = input<string>('');
  readonly confirmLabel = input<string>('Confirm');
  readonly cancelLabel = input<string>('Cancel');
  readonly tone = input<'danger' | 'default'>('default');

  readonly confirmed = output<void>();
  readonly cancelled = output<void>();

  protected readonly closing = signal(false);

  protected requestCancel(): void {
    this.close(() => this.cancelled.emit());
  }

  protected requestConfirm(): void {
    this.close(() => this.confirmed.emit());
  }

  private close(emit: () => void): void {
    if (this.closing()) return;
    this.closing.set(true);
    const duration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : EXIT_DURATION_MS;
    setTimeout(emit, duration);
  }
}
