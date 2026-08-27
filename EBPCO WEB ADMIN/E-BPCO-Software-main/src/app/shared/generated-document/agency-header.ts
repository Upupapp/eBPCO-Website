import { Component, input } from '@angular/core';
import { AgencyHeaderConfig } from '../../core/domain/generated-document.config';

@Component({
  selector: 'app-agency-header',
  templateUrl: './agency-header.html',
  styleUrl: './agency-header.scss',
})
export class AgencyHeader {
  readonly config = input.required<AgencyHeaderConfig>();
}
