import { Component, computed, input } from '@angular/core';
import qrcodegen from 'qrcode-generator';

interface QrCell {
  x: number;
  y: number;
}

@Component({
  selector: 'app-qr-verification-block',
  templateUrl: './qr-verification-block.html',
  styleUrl: './qr-verification-block.scss',
})
export class QRVerificationBlock {
  /** Only ever a verification URL/token — never PII. Null before a permit is issued. */
  readonly verificationUrl = input<string | null>(null);

  protected readonly modules = computed<{ count: number; cells: QrCell[] } | null>(() => {
    const url = this.verificationUrl();
    if (!url) return null;
    const qr = qrcodegen(0, 'M');
    qr.addData(url);
    qr.make();
    const count = qr.getModuleCount();
    const cells: QrCell[] = [];
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (qr.isDark(row, col)) cells.push({ x: col, y: row });
      }
    }
    return { count, cells };
  });

  protected cellKey(cell: QrCell): string {
    return `${cell.x}-${cell.y}`;
  }
}
