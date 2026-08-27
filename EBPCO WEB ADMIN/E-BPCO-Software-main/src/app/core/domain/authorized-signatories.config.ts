// A small, static roster of authorized signing officers — the ONLY source
// ApprovalSignatureSection may render a real signature image from. Kept
// intentionally tiny (a flat array, no personnel-management CRUD) rather
// than a full staff/signatory management feature.
//
// SAMPLE DATA NOTICE: names below follow the same convention as
// department.model.ts — real names/signature assets must be confirmed by
// Castilla before production use. Every `signatureImagePath` is left
// `null` until a real signature asset is provided, so a generated document
// currently renders the honest literal text "Pending Authorized Signature"
// rather than a fabricated mark. Never substitute a placeholder image here.
export type SignatoryRole = 'Building Official' | 'Zoning Administrator' | 'Fire Marshal' | 'Municipal Mayor';

export interface AuthorizedSignatory {
  id: string;
  fullName: string;
  position: string;
  officeId: string;
  role: SignatoryRole;
  /** Public asset path to a real signature image, or null. A null here is the only thing that ever produces "Pending Authorized Signature" — there is no fallback fabricated signature. */
  signatureImagePath: string | null;
}

export const AUTHORIZED_SIGNATORIES: AuthorizedSignatory[] = [
  {
    id: 'sig-obo',
    fullName: 'Engr. Ricardo Buenaflor',
    position: 'Municipal Engineer / Building Official',
    officeId: 'obo',
    role: 'Building Official',
    signatureImagePath: null,
  },
  {
    id: 'sig-zoning',
    fullName: 'Arch. Melinda Cortez',
    position: 'Zoning Administrator',
    officeId: 'zoning',
    role: 'Zoning Administrator',
    signatureImagePath: null,
  },
  {
    id: 'sig-bfp',
    fullName: 'FO1 Renato Salvador',
    position: 'Fire Marshal, Castilla Fire Station',
    officeId: 'bfp',
    role: 'Fire Marshal',
    signatureImagePath: null,
  },
  {
    id: 'sig-mayor',
    fullName: 'Hon. Corazon Villareal',
    position: 'Municipal Mayor',
    officeId: 'mayor',
    role: 'Municipal Mayor',
    signatureImagePath: null,
  },
];

/**
 * Resolves a signatory for a role, PREFERRING a match by name against the
 * real approving-official name already captured at generation time (e.g.
 * GeneratedPermit.approvingOfficial) when one is provided, so a genuinely
 * different actual approving officer isn't silently overridden by this
 * static list — falls back to the role's configured default entry, and to
 * null (never fabricated) if neither resolves.
 */
export function resolveSignatory(role: SignatoryRole, approvingOfficialName?: string | null): AuthorizedSignatory | null {
  const byName = approvingOfficialName
    ? AUTHORIZED_SIGNATORIES.find((s) => s.role === role && s.fullName === approvingOfficialName)
    : undefined;
  return byName ?? AUTHORIZED_SIGNATORIES.find((s) => s.role === role) ?? null;
}
