import { issuanceGate, IssuanceGateInput } from './document-issuance-gate';
import { emptyRelatedApprovals } from './technical-data.model';

function baseInput(overrides: Partial<IssuanceGateInput> = {}): IssuanceGateInput {
  return {
    documentsResolved: true,
    paymentFinal: true,
    technicalDataRequired: true,
    technicalDataVerified: true,
    relatedApprovalsRequired: [],
    relatedApprovalsOnFile: emptyRelatedApprovals(),
    finalApprovalComplete: true,
    permitGenerated: true,
    ...overrides,
  };
}

describe('issuanceGate', () => {
  it('clears once every condition is genuinely met', () => {
    const result = issuanceGate(baseInput());
    expect(result.cleared).toBe(true);
    expect(result.watermarkText).toBeNull();
  });

  it('shows DRAFT when required documents are not yet resolved, before checking anything else', () => {
    const result = issuanceGate(baseInput({ documentsResolved: false, paymentFinal: false }));
    expect(result.cleared).toBe(false);
    expect(result.watermarkText).toBe('DRAFT');
  });

  it('shows FOR REVIEW once documents resolve but payment is not yet final', () => {
    const result = issuanceGate(baseInput({ paymentFinal: false }));
    expect(result.watermarkText).toBe('FOR REVIEW');
  });

  it('shows PENDING APPROVAL when technical data is required but not yet Verified', () => {
    const result = issuanceGate(baseInput({ technicalDataVerified: false }));
    expect(result.watermarkText).toBe('PENDING APPROVAL');
  });

  it('shows PENDING APPROVAL when a required related-approval reference is missing, even with everything else satisfied', () => {
    const result = issuanceGate(
      baseInput({
        relatedApprovalsRequired: ['fsecNo'],
        relatedApprovalsOnFile: { ...emptyRelatedApprovals(), fsecNo: null },
      }),
    );
    expect(result.watermarkText).toBe('PENDING APPROVAL');
  });

  it('clears once the required related-approval reference is on file (self-attested, not verified)', () => {
    const result = issuanceGate(
      baseInput({
        relatedApprovalsRequired: ['fsecNo'],
        relatedApprovalsOnFile: { ...emptyRelatedApprovals(), fsecNo: 'FSEC-2026-000123' },
      }),
    );
    expect(result.cleared).toBe(true);
  });

  it('is not gated by technical data at all when the permit type carries none', () => {
    const result = issuanceGate(baseInput({ technicalDataRequired: false, technicalDataVerified: false }));
    expect(result.cleared).toBe(true);
  });

  it('shows NOT VALID AS AN OFFICIAL PERMIT when final approval or permit generation is still pending', () => {
    expect(issuanceGate(baseInput({ finalApprovalComplete: false })).watermarkText).toBe(
      'NOT VALID AS AN OFFICIAL PERMIT',
    );
    expect(issuanceGate(baseInput({ permitGenerated: false })).watermarkText).toBe(
      'NOT VALID AS AN OFFICIAL PERMIT',
    );
  });
});
