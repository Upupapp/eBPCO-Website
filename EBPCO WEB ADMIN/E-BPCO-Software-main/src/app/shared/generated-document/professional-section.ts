import { Component, input } from '@angular/core';
import { Professional } from '../../core/domain/technical-data.model';
import { displayOrPlaceholder } from './doc-format';

@Component({
  selector: 'app-professional-section',
  templateUrl: './professional-section.html',
  styleUrl: '../styles/shared-section.scss',
})
export class ProfessionalSection {
  readonly professionals = input<Professional[]>([]);

  protected readonly display = displayOrPlaceholder;
}
