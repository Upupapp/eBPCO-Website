import { Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { SectionHeading } from '../../shared/section-heading/section-heading';
import { ANNOUNCEMENTS_SOURCE } from '../../core/data/announcements.token';

@Component({
  selector: 'app-announcements',
  imports: [SectionHeading, DatePipe],
  templateUrl: './announcements.html',
  styleUrl: './announcements.scss',
})
export class Announcements {
  // Injected at field level, not inside the computed below: a computed body
  // runs lazily on first read, by which point the injection context is gone.
  private readonly source = inject(ANNOUNCEMENTS_SOURCE);

  // Newest first. Sorted here rather than relied on from the source, so a feed
  // that arrives in insertion order still reads correctly.
  readonly announcements = computed(() =>
    [...this.source].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt)),
  );
}
