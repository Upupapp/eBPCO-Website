import { Component, input } from '@angular/core';
import { LotIdentifiers } from '../../core/domain/technical-data.model';
import { PLACEHOLDER_NOT_ON_FILE, displayNumber, displayOrPlaceholder } from './doc-format';

@Component({
  selector: 'app-property-section',
  templateUrl: './property-section.html',
  styleUrl: '../styles/shared-section.scss',
})
export class PropertySection {
  readonly location = input<string>('');
  readonly lot = input<LotIdentifiers | undefined>(undefined);

  protected readonly display = displayOrPlaceholder;
  protected readonly displayNumber = displayNumber;
  protected readonly notOnFile = PLACEHOLDER_NOT_ON_FILE;
}
