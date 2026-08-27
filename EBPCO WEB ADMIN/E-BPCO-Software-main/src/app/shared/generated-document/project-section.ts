import { Component, input } from '@angular/core';
import { CommonTechnicalData } from '../../core/domain/technical-data.model';
import { PLACEHOLDER_PENDING, displayNumber, displayOrPlaceholder, formatPHP } from './doc-format';

@Component({
  selector: 'app-project-section',
  templateUrl: './project-section.html',
  styleUrl: '../styles/shared-section.scss',
})
export class ProjectSection {
  readonly common = input<CommonTechnicalData | undefined>(undefined);
  readonly applicationAction = input<string>('');
  readonly dateSubmitted = input<string>('');

  protected readonly display = displayOrPlaceholder;
  protected readonly displayNumber = displayNumber;
  protected readonly formatPHP = formatPHP;
  protected readonly pending = PLACEHOLDER_PENDING;
}
