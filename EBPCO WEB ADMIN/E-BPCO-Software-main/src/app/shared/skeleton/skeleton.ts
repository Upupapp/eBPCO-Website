import { Component, computed, input } from '@angular/core';

export type SkeletonVariant = 'row' | 'card' | 'chart' | 'text';

// Ready-to-wire shimmer placeholders for the first real async data
// boundary this app adds — every list/table/KPI grid today is driven
// synchronously by an in-memory store, so nothing calls this yet. Kept as
// infrastructure rather than fabricating an artificial loading delay just
// to show it off.
@Component({
  selector: 'app-skeleton',
  templateUrl: './skeleton.html',
  styleUrl: './skeleton.scss',
})
export class Skeleton {
  readonly variant = input<SkeletonVariant>('text');
  readonly count = input(1);

  protected readonly items = computed(() => Array.from({ length: Math.max(this.count(), 1) }));
}
