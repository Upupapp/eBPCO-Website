import { Component, input } from '@angular/core';
import { displayOrPlaceholder, PLACEHOLDER_NOT_AVAILABLE } from './doc-format';

export interface RelatedPermitRow {
  label: string;
  value: string | null;
}

@Component({
  selector: 'app-related-permit-section',
  templateUrl: './related-permit-section.html',
  styleUrl: '../styles/shared-section.scss',
})
export class RelatedPermitSection {
  readonly references = input<RelatedPermitRow[]>([]);

  protected readonly display = displayOrPlaceholder;
  protected readonly notAvailable = PLACEHOLDER_NOT_AVAILABLE;
}
