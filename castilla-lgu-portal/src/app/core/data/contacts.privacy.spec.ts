import { createHash } from 'node:crypto';
import { MUNICIPAL_OFFICES } from './offices.data';

// Addresses withheld 2026-08-30 on the owner's ruling: each is an individual's
// personal mailbox rather than an office one, and this portal is public. They
// remain in the LGU Citizen's Charter; the ruling is about republishing them.
//
// Stored as SHA-256 of the lowercased address, not as the addresses. THIS
// REPOSITORY IS PUBLIC: an earlier version of this file listed them in plain
// text in order to assert they were not published, which republished them at
// HEAD in a searchable form — the exact harm the ruling exists to prevent,
// moved from the website into the source tree. Hashes assert the same thing
// and disclose nothing.
const WITHHELD_HASHES = [
  '91c8ccbe8c666225cc8e54a2f781e8d8763af6fd6c6cdacc01c4dcd757957d54',
  'fbb6865c20f553b9563b17beea020e0e17814906b9c70f815cb112e2df8d325f',
  'ee54c789ac165d0316bb88b54423df7f152f37d3d4f40ad35e62b8c9fd05f8df',
  '2035b0d39a3dfe2195375a997d1beff9b56bc52280de85028243ebda0dfc0f87',
];

const sha256 = (value: string) =>
  createHash('sha256').update(value.trim().toLowerCase()).digest('hex');

const published = (v: string | undefined): v is string => !!v && v.trim().length > 0;

describe('published office contacts', () => {
  it('republishes none of the withheld addresses', () => {
    const offenders = MUNICIPAL_OFFICES.filter(
      (o) => published(o.contact.email) && WITHHELD_HASHES.includes(sha256(o.contact.email)),
    ).map((o) => o.slug);

    expect(offenders).toEqual([]);
  });

  it('still has four addresses under withholding', () => {
    // Guards the guard: an emptied list would make the assertion above pass
    // against anything.
    expect(WITHHELD_HASHES).toHaveLength(4);
    expect(new Set(WITHHELD_HASHES).size).toBe(4);
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
