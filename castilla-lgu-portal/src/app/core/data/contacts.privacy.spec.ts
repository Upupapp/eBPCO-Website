import { MUNICIPAL_OFFICES } from './offices.data';

// Addresses withheld 2026-08-30 on the owner's ruling: each is an individual's
// personal mailbox rather than an office one, and this portal is public. They
// remain in the LGU Citizen's Charter; the ruling is about republishing them.
const WITHHELD = [
  'magierrogante@gmail.com',
  'raqueljdollison@gmail.com',
  'arlyn.balmes1971@gmail.com',
  'cherokeekessellopez@gmail.com',
];

const published = (v: string | undefined): v is string => !!v && v.trim().length > 0;

describe('published office contacts', () => {
  it.each(WITHHELD)('does not republish %s', (address) => {
    const offenders = MUNICIPAL_OFFICES.filter(
      (o) => published(o.contact.email) && o.contact.email.toLowerCase() === address,
    ).map((o) => o.slug);

    expect(offenders).toEqual([]);
  });

  // The withheld set is four specific addresses, so a broader shape check
  // guards the next one somebody adds rather than only the four already ruled
  // on. A year in the local part is a strong signal of a personal account.
  it('publishes no email address containing a birth-year-like number', () => {
    const offenders = MUNICIPAL_OFFICES.filter((o) => {
      if (!published(o.contact.email)) return false;
      const local = o.contact.email.split('@')[0];
      return /(?:19|20)\d{2}/.test(local);
    }).map((o) => `${o.slug}: ${o.contact.email}`);

    expect(offenders).toEqual([]);
  });

  // Withholding an email must not cost the office its other contact routes —
  // the phone numbers are a contiguous LGU-issued block and were never the
  // concern. An office with no route at all is worse than the problem.
  it('leaves every office with at least one usable contact route', () => {
    for (const office of MUNICIPAL_OFFICES) {
      const routes = [office.contact.telephone, office.contact.email, office.contact.location];
      expect(routes.some(published)).toBe(true);
    }
  });

  it('still publishes the institutional mailboxes', () => {
    const emails = MUNICIPAL_OFFICES.filter((o) => published(o.contact.email)).map(
      (o) => o.contact.email,
    );
    expect(emails).toContain('lgucastilla@gmail.com');
    expect(emails.length).toBeGreaterThanOrEqual(6);
  });
});
