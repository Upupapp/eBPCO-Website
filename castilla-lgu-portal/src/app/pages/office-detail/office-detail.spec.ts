import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { OfficeDetail } from './office-detail';
import { MAYOR, VICE_MAYOR } from '../../core/data/officials.data';

async function createComponent(slug: string) {
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
});
