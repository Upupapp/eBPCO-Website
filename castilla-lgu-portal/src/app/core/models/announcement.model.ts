export interface Announcement {
  /** Stable public identifier, used in the URL. */
  slug: string;
  title: string;
  /** Plain-text body. Kept plain deliberately: see announcements.data.ts. */
  body: string;
  /** ISO-8601 date the LGU published the notice. */
  publishedAt: string;
  /** Optional grouping label, e.g. "Public Notice" or "Advisory". */
  category?: string;
}
