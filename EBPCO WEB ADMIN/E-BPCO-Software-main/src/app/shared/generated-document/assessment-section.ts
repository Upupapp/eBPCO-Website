import { Component, computed, input } from '@angular/core';
import { Assessment } from '../../core/domain/assessment.model';
import { formatPHP } from './doc-format';

interface FeeLine {
  label: string;
  amount: string;
  legalBasisTitle: string;
  requiresAssessorInput: boolean;
}

@Component({
  selector: 'app-assessment-section',
  templateUrl: './assessment-section.html',
  styleUrl: '../styles/shared-section.scss',
})
export class AssessmentSection {
  readonly assessment = input<Assessment | undefined>(undefined);

  protected readonly feeLines = computed<FeeLine[]>(() => {
    const assessment = this.assessment();
    if (!assessment) return [];
    return assessment.lineItems
      .filter((l) => l.included)
      .map((l) => ({
        label: l.name,
        amount: formatPHP(l.amountCentavos),
        legalBasisTitle: l.legalBasisTitle,
        requiresAssessorInput: l.requiresAssessorInput && l.amountCentavos === null,
      }));
  });

  protected readonly totalDue = computed(() => {
    const assessment = this.assessment();
    return assessment ? formatPHP(assessment.totalCentavos) : 'Pending';
  });

  protected readonly balanceDue = computed(() => {
    const assessment = this.assessment();
    return assessment ? formatPHP(assessment.balanceCentavos) : '—';
  });
}
