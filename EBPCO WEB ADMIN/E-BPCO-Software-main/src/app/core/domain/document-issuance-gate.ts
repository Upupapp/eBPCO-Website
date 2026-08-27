import { RelatedApprovalReferences } from './technical-data.model';

export type IssuanceWatermarkText =
  | 'DRAFT'
  | 'FOR REVIEW'
  | 'PENDING APPROVAL'
  | 'NOT VALID AS AN OFFICIAL PERMIT';

export interface IssuanceGateInput {
  /** ApplicationStore.canApprove(applicationId) — every mandatory required document resolved. */
  documentsResolved: boolean;
  /** AssessmentStore.canProcessPermit(applicationId) — every mandatory line fully paid via verified, non-voided transactions. */
  paymentFinal: boolean;
  /** True when this permit type's config lists any technicalFields at all. */
  technicalDataRequired: boolean;
  technicalDataVerified: boolean;
  relatedApprovalsRequired: (keyof RelatedApprovalReferences)[];
  relatedApprovalsOnFile: RelatedApprovalReferences;
  /** coarseStatus(row.lifecycleStatus) resolves to 'Approved' or later (Permit Generated / Ready for Release / Released / Completed). */
  finalApprovalComplete: boolean;
  /** !!ApplicationStore.getPermit(applicationId) */
  permitGenerated: boolean;
}

export interface IssuanceGateResult {
  cleared: boolean;
  watermarkText: IssuanceWatermarkText | null;
}

/**
 * The single place that decides whether a generated document is "issued"
 * (no watermark) or still a draft/in-review artifact — reused by
 * GeneratedPermitDocument for the visible watermark and by VerifyPermit for
 * the public status page. Every check reads real, already-existing
 * lifecycle/payment/technical-data state; nothing here invents a value.
 *
 * A missing signature-image asset does NOT gate this — see
 * ApprovalSignatureSection, which renders "Pending Authorized Signature"
 * locally instead. A scanned-signature backlog shouldn't make an otherwise
 * legally-ready permit read as permanently invalid.
 */
export function issuanceGate(input: IssuanceGateInput): IssuanceGateResult {
  if (!input.documentsResolved) return { cleared: false, watermarkText: 'DRAFT' };
  if (!input.paymentFinal) return { cleared: false, watermarkText: 'FOR REVIEW' };

  const relatedMissing = input.relatedApprovalsRequired.some(
    (key) => !input.relatedApprovalsOnFile[key],
  );
  if ((input.technicalDataRequired && !input.technicalDataVerified) || relatedMissing) {
    return { cleared: false, watermarkText: 'PENDING APPROVAL' };
  }

  if (!input.finalApprovalComplete || !input.permitGenerated) {
    return { cleared: false, watermarkText: 'NOT VALID AS AN OFFICIAL PERMIT' };
  }

  return { cleared: true, watermarkText: null };
}
