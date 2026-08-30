import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { OfficeDetail } from './office-detail';
import { MAYOR, VICE_MAYOR } from '../../core/data/officials.data';
import { MUNICIPAL_OFFICES } from '../../core/data/offices.data';

async function createComponent(slug: string) {
  // Reset first: these specs create the component more than once per run, and
  // TestBed refuses to be reconfigured once instantiated.
  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [OfficeDetail],
    providers: [
      provideRouter([]),
      { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ slug })) } },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(OfficeDetail);
  fixture.detectChanges();
  return fixture;
}

describe('OfficeDetail', () => {
  it('resolves the office matching the route slug', async () => {
    const fixture = await createComponent('municipal-engineering');
    expect(fixture.componentInstance.office()?.slug).toBe('municipal-engineering');
  });

  it('returns undefined for an unknown slug', async () => {
    const fixture = await createComponent('does-not-exist');
    expect(fixture.componentInstance.office()).toBeUndefined();
  });

  // Regression guard for F-06. Both offices previously declared their own
  // placeholder head, so /local-government named the Mayor while
  // /offices/office-of-the-mayor showed his office as having no head at all.
  it.each([
    ['office-of-the-mayor', MAYOR],
    ['office-of-the-vice-mayor', VICE_MAYOR],
  ])('names the confirmed official on %s', async (slug, official) => {
    const fixture = await createComponent(slug);
    const head = fixture.componentInstance.office()!.head;

    expect(head.isPlaceholder).toBe(false);
    expect(head.name).toBe(official.name);
    expect(head.position).toBe(official.position);
    expect(fixture.nativeElement.textContent).toContain(official.name);
  });

  it('resolves related offices to real records', async () => {
    const fixture = await createComponent('office-of-the-mayor');
    const related = fixture.componentInstance.relatedOffices();

    expect(related.length).toBeGreaterThan(0);
    for (const office of related) expect(office.slug).toBeTruthy();
  });

  // Regression guards for F-07. The template used to decide what to render by
  // comparing against the literal 'Pending confirmation', so rewording that
  // placeholder would have published it as every unconfirmed office's
  // telephone number. Absence is now modelled as absence.
  it('omits the contact rows an office has no value for', async () => {
    const withoutPhone = MUNICIPAL_OFFICES.find((o) => !o.contact.telephone)!;
    expect(withoutPhone).toBeTruthy();

    const fixture = await createComponent(withoutPhone.slug);
    const labels = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('.contact-list dt'),
    ).map((el) => el.textContent?.trim());

    expect(labels).not.toContain('Contact Number');
    expect(labels).toContain('Office Location');
    expect(labels).toContain('Office Hours');
  });

  it('renders the contact rows an office does have', async () => {
    const withPhone = MUNICIPAL_OFFICES.find((o) => o.contact.telephone && o.contact.email)!;
    const fixture = await createComponent(withPhone.slug);
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';

    expect(text).toContain(withPhone.contact.telephone!);
    expect(text).toContain(withPhone.contact.email!);
  });

  it('never prints a placeholder sentinel at a citizen, on any office', async () => {
    for (const office of MUNICIPAL_OFFICES) {
      const fixture = await createComponent(office.slug);
      const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
      expect(text).not.toContain('Pending confirmation');
      expect(text).not.toContain('pending confirmation');
    }
  });
});
