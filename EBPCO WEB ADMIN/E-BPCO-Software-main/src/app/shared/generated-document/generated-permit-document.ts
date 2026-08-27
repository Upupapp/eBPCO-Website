import { Component, computed, inject, input } from '@angular/core';
import { ApplicationStore } from '../../core/domain/application-store';
import { AssessmentStore } from '../../core/domain/assessment-store';
import { TechnicalDataStore } from '../../core/domain/technical-data-store';
import { requirementsFor } from '../../core/domain/requirements-catalog';
import { configFor, DocumentSectionKey } from '../../core/domain/generated-document.config';
import { resolveSignatory } from '../../core/domain/authorized-signatories.config';
import { issuanceGate } from '../../core/domain/document-issuance-gate';
import { EquipmentRow } from '../../core/domain/technical-data.model';
import { OfficialDocumentHeader } from './official-document-header';
import { PermitTitle } from './permit-title';
import { PermitNumberBlock } from './permit-number-block';
import { ApplicantOwnerSection } from './applicant-owner-section';
import { PropertySection } from './property-section';
import { ProjectSection } from './project-section';
import { TechnicalSummarySection } from './technical-summary-section';
import { EquipmentTable } from './equipment-table';
import { ProfessionalSection } from './professional-section';
import { AssessmentSection } from './assessment-section';
import { RelatedPermitSection, RelatedPermitRow } from './related-permit-section';
import { ConditionsSection } from './conditions-section';
import { ApprovalSignatureSection } from './approval-signature-section';
import { QRVerificationBlock } from './qr-verification-block';
import { DraftWatermark } from './draft-watermark';
import { DocumentFooter } from './document-footer';

const RELATED_APPROVAL_LABELS: Record<string, string> = {
  zoningClearanceNo: 'Zoning / Locational Clearance No.',
  fsecNo: 'FSEC No.',
  architecturalPermitNo: 'Architectural Permit No.',
  structuralPermitNo: 'Structural Permit No.',
  electricalPermitNo: 'Electrical Permit No.',
  mechanicalPermitNo: 'Mechanical Permit No.',
  sanitaryPermitNo: 'Sanitary Permit No.',
  plumbingPermitNo: 'Plumbing Permit No.',
  electronicsPermitNo: 'Electronics Permit No.',
  interiorDesignPermitNo: 'Interior Design Permit No.',
  buildingPermitNo: 'Building Permit No.',
  certificateOfOccupancyNo: 'Certificate of Occupancy No.',
  fsicNo: 'FSIC No.',
  occupancyApplicationNo: 'Occupancy Application No.',
};

/**
 * The engine: reads GENERATED_DOCUMENT_CONFIG for this application's
 * permit type and assembles the shared section-component library into one
 * real, honest, printable A4 document — this is the only component with
 * any per-type branching (a single `@switch` over `config.sections`), so
 * adding the remaining permit types never touches this file again, only
 * generated-document.config.ts.
 */
@Component({
  selector: 'app-generated-permit-document',
  imports: [
    OfficialDocumentHeader,
    PermitTitle,
    PermitNumberBlock,
    ApplicantOwnerSection,
    PropertySection,
    ProjectSection,
    TechnicalSummarySection,
    EquipmentTable,
    ProfessionalSection,
    AssessmentSection,
    RelatedPermitSection,
    ConditionsSection,
    ApprovalSignatureSection,
    QRVerificationBlock,
    DraftWatermark,
    DocumentFooter,
  ],
  templateUrl: './generated-permit-document.html',
  styleUrl: './generated-permit-document.scss',
})
export class GeneratedPermitDocument {
  private readonly store = inject(ApplicationStore);
  private readonly assessmentStore = inject(AssessmentStore);
  private readonly technicalDataStore = inject(TechnicalDataStore);

  readonly applicationId = input.required<string>();

  protected readonly row = computed(() => this.store.getById(this.applicationId()));
  protected readonly config = computed(() => {
    const row = this.row();
    return row ? configFor(row.permitType) : null;
  });
  protected readonly applicant = computed(() => {
    const row = this.row();
    return row ? this.store.getApplicant(row.applicantId) : undefined;
  });
  protected readonly business = computed(() => {
    const row = this.row();
    return row ? this.store.getBusiness(row.businessId) : undefined;
  });
  protected readonly businessLabel = computed(() => {
    const row = this.row();
    if (!row) return 'Not provided';
    return this.business()?.name || row.businessName || 'Not provided';
  });
  protected readonly permit = computed(() => this.store.getPermit(this.applicationId()));
  protected readonly assessment = computed(() => this.assessmentStore.getActiveAssessment(this.applicationId()));
  protected readonly requirements = computed(() => {
    const row = this.row();
    return row ? requirementsFor(row.permitType) : null;
  });
  protected readonly technicalData = computed(() => this.technicalDataStore.getFor(this.applicationId()));

  protected readonly signatory = computed(() => {
    const config = this.config();
    if (!config) return null;
    return resolveSignatory(config.signatoryRole, this.permit()?.approvingOfficial);
  });

  protected readonly gate = computed(() => {
    const row = this.row();
    const config = this.config();
    if (!row || !config) return { cleared: false, watermarkText: 'DRAFT' as const };
    return issuanceGate({
      documentsResolved: this.store.canApprove(this.applicationId()),
      paymentFinal: this.assessmentStore.canProcessPermit(this.applicationId()),
      technicalDataRequired: config.technicalFields.length > 0,
      technicalDataVerified: this.technicalData().status === 'Verified',
      relatedApprovalsRequired: config.requiredRelatedApprovals,
      relatedApprovalsOnFile: this.technicalData().common.relatedApprovals,
      finalApprovalComplete: row.status === 'Approved',
      permitGenerated: !!this.permit(),
    });
  });

  protected readonly watermarkText = computed(() => this.gate().watermarkText);

  protected readonly verificationUrl = computed(() => {
    const permit = this.permit();
    if (!permit || !this.gate().cleared) return null;
    return `${window.location.origin}/verify/${permit.permitNumber}`;
  });

  protected readonly relatedApprovalRows = computed<RelatedPermitRow[]>(() => {
    const config = this.config();
    if (!config) return [];
    const refs = this.technicalData().common.relatedApprovals as unknown as Record<string, string | null>;
    return config.requiredRelatedApprovals.map((key) => ({
      label: RELATED_APPROVAL_LABELS[key] ?? key,
      value: refs[key] ?? null,
    }));
  });

  protected readonly equipmentRows = computed<EquipmentRow[]>(() => {
    const config = this.config();
    const eq = config?.equipmentTable;
    if (!eq) return [];
    const families = this.technicalData().families as unknown as Record<string, Record<string, unknown> | undefined>;
    const familyBlock = families[eq.family];
    if (!familyBlock) return [];
    const key = eq.arrayFieldId.split('.').pop() as string;
    return (familyBlock[key] as EquipmentRow[] | undefined) ?? [];
  });

  protected readonly generatedOn = new Date().toLocaleString('en-PH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  protected sectionKey(key: DocumentSectionKey): DocumentSectionKey {
    return key;
  }
}
