import { PUBLIC_PERMIT_TYPES } from './permits.data';

// Bundled under public/assets/permits/. Kept as a literal list rather than
// read from disk, because a spec that globs the folder would agree with
// whatever the folder happens to contain and could never detect an orphan.
const BUNDLED = [
  'Building-Permit-Unified-Application-Form.pdf',
  'Building-Permit-and-Occupancy-Checklist.pdf',
  'Civil-Structural-Permit-Form.pdf',
  'Electrical-Permit-Form.pdf',
  'Electronics-Permit-Form.pdf',
  'Excavation-Permit-Form.pdf',
  'FSEC-for-Building-Permit-BFP.pdf',
  'FSIC-for-Occupancy-Permit-BFP.pdf',
  'Fencing-Permit-Form.pdf',
  'Mechanical-Permit-Form.pdf',
  'Plumbing-Permit-Form.pdf',
  'Sanitary-Permit-Form.pdf',
  'Zoning-Locational-Clearance-Form.pdf',
];

const referenced = () => {
  const files = new Set<string>();
  for (const p of PUBLIC_PERMIT_TYPES) {
    for (const url of [p.formUrl, p.checklistUrl]) {
      if (url) files.add(url.replace('/assets/permits/', ''));
    }
  }
  return files;
};

describe('bundled permit documents', () => {
  // Regression guard: the Building Permit & Occupancy checklist shipped in
  // every build referenced by no permit at all, so it was downloadable only
  // by guessing its URL. These are real LGU forms a citizen presents at a
  // counter — one going unreachable is not a cosmetic problem.
  it('ships no document that no permit links to', () => {
    const used = referenced();
    const orphans = BUNDLED.filter((f) => !used.has(f));
    expect(orphans).toEqual([]);
  });

  it('references no document that is not bundled', () => {
    const missing = [...referenced()].filter((f) => !BUNDLED.includes(f));
    expect(missing).toEqual([]);
  });

  it('offers the combined checklist on both stages it covers', () => {
    const withChecklist = PUBLIC_PERMIT_TYPES.filter((p) => p.checklistUrl).map((p) => p.slug);
    expect(withChecklist).toContain('building-permit-new-construction');
    expect(withChecklist).toContain('certificate-of-occupancy');
  });
});
