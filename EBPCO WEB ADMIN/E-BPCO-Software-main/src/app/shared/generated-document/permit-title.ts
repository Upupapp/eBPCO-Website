import { Component, input } from '@angular/core';

@Component({
  selector: 'app-permit-title',
  templateUrl: './permit-title.html',
  styleUrl: './permit-title.scss',
})
export class PermitTitle {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
}
