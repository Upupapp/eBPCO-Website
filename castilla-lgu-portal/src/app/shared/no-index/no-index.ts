import { Directive, OnDestroy, OnInit, inject } from '@angular/core';
import { Meta } from '@angular/platform-browser';

/**
 * Marks the page it appears on as `noindex` for the duration it is shown.
 *
 * The hosting rewrite serves the application shell for every unmatched path
 * with HTTP 200, and a client-side router cannot change that status. So a
 * mistyped or retired URL is, to a crawler, a 200 response — indistinguishable
 * from real content. This is the part the client *can* control: say plainly
 * that the page should not be indexed.
 *
 * Applied by the catch-all page and by the two detail pages' not-found
 * branches, so an office or permit slug that no longer exists is not indexed
 * either.
 */
@Directive({
  selector: '[appNoIndex]',
})
export class NoIndex implements OnInit, OnDestroy {
  private readonly meta = inject(Meta);

  ngOnInit(): void {
    this.meta.updateTag({ name: 'robots', content: 'noindex, follow' });
  }

  ngOnDestroy(): void {
    // Removed on leave: this is a single-page application, so a tag left
    // behind would silently de-index every page navigated to afterwards.
    this.meta.removeTag("name='robots'");
  }
}
