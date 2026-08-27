import { Component, input } from '@angular/core';
import { AuthorizedSignatory } from '../../core/domain/authorized-signatories.config';
import { displayOrPlaceholder, PLACEHOLDER_PENDING } from './doc-format';

@Component({
  selector: 'app-approval-signature-section',
  templateUrl: './approval-signature-section.html',
  styleUrl: './approval-signature-section.scss',
})
export class ApprovalSignatureSection {
  readonly signatory = input<AuthorizedSignatory | null>(null);
  readonly approvingOfficial = input<string | null>(null);
  readonly approvingOffice = input<string | null>(null);

  protected readonly display = displayOrPlaceholder;
  protected readonly pending = PLACEHOLDER_PENDING;
}
