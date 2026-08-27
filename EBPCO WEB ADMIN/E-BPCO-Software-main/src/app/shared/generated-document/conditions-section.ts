import { Component, input } from '@angular/core';

@Component({
  selector: 'app-conditions-section',
  templateUrl: './conditions-section.html',
  styleUrl: '../styles/shared-section.scss',
})
export class ConditionsSection {
  readonly conditions = input<string | null>(null);
  readonly validityRules = input<string | null>(null);
}
