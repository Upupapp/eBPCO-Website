import { Component, input } from '@angular/core';
import { Applicant } from '../../core/domain/applicant.model';
import { PLACEHOLDER_NOT_AVAILABLE, PLACEHOLDER_NOT_ON_FILE, displayOrPlaceholder } from './doc-format';

@Component({
  selector: 'app-applicant-owner-section',
  templateUrl: './applicant-owner-section.html',
  styleUrl: '../styles/shared-section.scss',
})
export class ApplicantOwnerSection {
  readonly applicantName = input<string>('');
  readonly applicant = input<Applicant | undefined>(undefined);
  readonly businessLabel = input<string>('');
  readonly ownerTin = input<string | null>(null);
  readonly applicantNameOverride = input<string | null>(null);

  protected readonly display = displayOrPlaceholder;
  protected readonly notAvailable = PLACEHOLDER_NOT_AVAILABLE;
  protected readonly notOnFile = PLACEHOLDER_NOT_ON_FILE;
}
