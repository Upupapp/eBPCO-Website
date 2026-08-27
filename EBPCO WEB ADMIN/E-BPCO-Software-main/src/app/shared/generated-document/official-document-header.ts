import { Component, input } from '@angular/core';
import { AgencyHeader } from './agency-header';
import { AgencyHeaderConfig } from '../../core/domain/generated-document.config';

@Component({
  selector: 'app-official-document-header',
  imports: [AgencyHeader],
  templateUrl: './official-document-header.html',
  styleUrl: './official-document-header.scss',
})
export class OfficialDocumentHeader {
  readonly agencyHeader = input.required<AgencyHeaderConfig>();
  readonly documentControlNo = input<string>('');
  readonly generatedOn = input<string>('');
}
