import { Component, input } from '@angular/core';
import { PLACEHOLDER_NOT_ASSIGNED, displayOrPlaceholder } from './doc-format';

@Component({
  selector: 'app-permit-number-block',
  templateUrl: './permit-number-block.html',
  styleUrl: './permit-number-block.scss',
})
export class PermitNumberBlock {
  readonly permitNumber = input<string | null>(null);
  readonly issuedDate = input<string | null>(null);
  readonly expiryDate = input<string | null>(null);

  protected readonly display = displayOrPlaceholder;
  protected readonly notAssigned = PLACEHOLDER_NOT_ASSIGNED;
}
