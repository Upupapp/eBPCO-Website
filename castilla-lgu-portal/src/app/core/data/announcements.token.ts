import { InjectionToken } from '@angular/core';
import { Announcement } from '../models/announcement.model';
import { ANNOUNCEMENTS } from './announcements.data';

/**
 * Announcements, injected rather than imported directly.
 *
 * Two reasons. A test can substitute a populated feed and prove the page
 * renders real notices, which an empty array can never demonstrate on its
 * own. And when the announcements API arrives, this is the single seam that
 * has to change — the page already reads from a provider rather than a
 * compiled-in constant.
 */
export const ANNOUNCEMENTS_SOURCE = new InjectionToken<Announcement[]>('ANNOUNCEMENTS_SOURCE', {
  providedIn: 'root',
  factory: () => ANNOUNCEMENTS,
});
