import { Component, input, output } from '@angular/core';
import { GeneratedPermitDocument } from './generated-permit-document';

@Component({
  selector: 'app-generated-permit-document-modal',
  imports: [GeneratedPermitDocument],
  templateUrl: './generated-permit-document-modal.html',
  styleUrl: './generated-permit-document-modal.scss',
})
export class GeneratedPermitDocumentModal {
  readonly applicationId = input.required<string>();
  readonly closed = output<void>();

  protected close(): void {
    this.closed.emit();
  }

  protected print(): void {
    window.print();
  }
}
