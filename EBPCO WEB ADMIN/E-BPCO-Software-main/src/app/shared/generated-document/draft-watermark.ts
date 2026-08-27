import { Component, input } from '@angular/core';

@Component({
  selector: 'app-draft-watermark',
  templateUrl: './draft-watermark.html',
  styleUrl: './draft-watermark.scss',
})
export class DraftWatermark {
  readonly text = input<string | null>(null);
}
