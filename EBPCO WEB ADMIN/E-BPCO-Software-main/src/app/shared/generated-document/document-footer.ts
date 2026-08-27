import { Component, input } from '@angular/core';

@Component({
  selector: 'app-document-footer',
  templateUrl: './document-footer.html',
  styleUrl: './document-footer.scss',
})
export class DocumentFooter {
  readonly documentRef = input<string>('');
  readonly generatedOn = input<string>('');
  readonly pageLabel = input<string>('Page 1 of 1');
}
