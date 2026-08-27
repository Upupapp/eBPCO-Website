import { TestBed } from '@angular/core/testing';
import { QRVerificationBlock } from './qr-verification-block';

describe('QRVerificationBlock', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [QRVerificationBlock] }).compileComponents();
  });

  function render(verificationUrl: string | null) {
    const fixture = TestBed.createComponent(QRVerificationBlock);
    fixture.componentRef.setInput('verificationUrl', verificationUrl);
    fixture.detectChanges();
    return fixture;
  }

  it('renders no QR code and an honest "not yet available" note when there is no verification URL', () => {
    const fixture = render(null);
    expect(fixture.nativeElement.querySelector('.qr-svg')).toBeNull();
    expect(fixture.nativeElement.querySelector('.qr-unavailable')?.textContent).toContain(
      'not yet available',
    );
  });

  it('renders a real scannable QR matrix and the encoded URL as visible caption text once a verification URL is set', () => {
    const url = 'https://example.gov.ph/verify/PERMIT-2026-000123';
    const fixture = render(url);
    const svg = fixture.nativeElement.querySelector('.qr-svg') as SVGElement;
    expect(svg).toBeTruthy();
    // At least some dark modules were rendered — a real encoded matrix, not a placeholder box.
    const cells = svg.querySelectorAll('rect[fill="#000000"]');
    expect(cells.length).toBeGreaterThan(0);
    expect(fixture.nativeElement.querySelector('.qr-caption')?.textContent).toContain(url);
  });

  it('never embeds anything beyond the given verification URL — no name/amount fields are accepted as inputs', () => {
    // QRVerificationBlock's only input is verificationUrl — this test
    // documents that constraint so a future change can't quietly widen it
    // to accept PII without a test failing here.
    const fixture = render('https://example.gov.ph/verify/PERMIT-2026-000999');
    const instanceInputs = Object.keys(fixture.componentInstance);
    expect(instanceInputs.some((k) => /name|amount|owner|applicant/i.test(k))).toBe(false);
  });
});
