import { Announcement } from '../models/announcement.model';

/**
 * Municipal announcements.
 *
 * Deliberately empty. The header has advertised an Announcements control
 * since this portal was built, but no announcement has ever been sourced from
 * LGU Castilla, and inventing municipal notices for a real municipality is
 * exactly what the sourcing discipline in this directory exists to prevent —
 * the same reason the Vision statement is a placeholder rather than a
 * reconstructed quote.
 *
 * The page renders an honest empty state until this array is filled from a
 * confirmed LGU source, or until the announcements API replaces it. Anything
 * added here needs the same provenance note every other fact in this
 * directory carries: where it came from and when.
 *
 * Bodies are plain text, not markup: nothing on this portal renders
 * user-authored HTML, and an announcements feed is the obvious place that
 * would first be tempted to.
 */
export const ANNOUNCEMENTS: Announcement[] = [];
