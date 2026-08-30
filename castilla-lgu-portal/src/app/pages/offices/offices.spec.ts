import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Offices } from './offices';
import { MUNICIPAL_OFFICES } from '../../core/data/offices.data';
import { PUBLIC_PERMIT_TYPES } from '../../core/data/permits.data';

async function createComponent() {
  await TestBed.configureTestingModule({
    imports: [Offices],
    providers: [provideRouter([])],
  }).compileComponents();
  return TestBed.createComponent(Offices).componentInstance;
}

async function createFixture() {
  await TestBed.configureTestingModule({
    imports: [Offices],
    providers: [provideRouter([])],
  }).compileComponents();
  const fixture = TestBed.createComponent(Offices);
  fixture.detectChanges();
  return fixture;
}

describe('Offices', () => {
  it('lists every municipal office by default', async () => {
    const component = await createComponent();
    expect(component.filteredOffices().length).toBe(MUNICIPAL_OFFICES.length);
  });

  // Regression guard for F-03. Each of these returned the empty state while
  // the search haystack was name + shortDescription only, even though the
  // issuing office listed the service. A citizen searching the portal's own
  // subject matter found nothing.
  it.each([['building permit'], ['building'], ['permit'], ['occupancy']])(
    'finds the Office of the Building Official when searching %j',
    async (term) => {
      const component = await createComponent();
      component.onSearchInput(term);

      const slugs = component.filteredOffices().map((o) => o.slug);
      expect(slugs).toContain('municipal-engineering');
    },
  );

  // "zoning" and "occupancy" appear nowhere in offices.data.ts. They resolve
  // only because permits.data.ts states which office issues those permits, so
  // this also guards that cross-file link staying intact.
  it('finds the zoning office by the permit it issues, not by its own copy', async () => {
    const component = await createComponent();
    const office = MUNICIPAL_OFFICES.find((o) => o.slug === 'municipal-planning-development')!;
    const record = [office.name, office.shortDescription, office.aboutText, ...office.services]
      .join(' ')
      .toLowerCase();

    expect(record).not.toContain('zoning');

    component.onSearchInput('zoning');
    expect(component.filteredOffices().map((o) => o.slug)).toContain(
      'municipal-planning-development',
    );
  });

  it('routes each searchable permit name to the office permits.data.ts assigns it', async () => {
    const component = await createComponent();
    for (const permit of PUBLIC_PERMIT_TYPES.filter((p) => p.issuingOfficeSlug)) {
      component.onSearchInput(permit.name);
      expect(component.filteredOffices().map((o) => o.slug)).toContain(permit.issuingOfficeSlug!);
    }
  });

  it('searches service listings, not just the office name and summary', async () => {
    const component = await createComponent();
    const office = MUNICIPAL_OFFICES.find((o) => o.slug === 'municipal-engineering')!;
    const serviceOnlyTerm = 'technical evaluation';

    // The term must genuinely be absent from the old, narrower haystack,
    // otherwise this test would pass without the fix.
    expect((office.name + office.shortDescription).toLowerCase()).not.toContain(serviceOnlyTerm);
    expect(office.services.join(' ').toLowerCase()).toContain(serviceOnlyTerm);

    component.onSearchInput(serviceOnlyTerm);
    expect(component.filteredOffices().map((o) => o.slug)).toContain('municipal-engineering');
  });

  it('still narrows by category alongside a search term', async () => {
    const component = await createComponent();
    component.setCategory('finance');

    const results = component.filteredOffices();
    expect(results.length).toBeGreaterThan(0);
    for (const office of results) expect(office.category).toBe('finance');
  });

  it('returns nothing for a nonsense term', async () => {
    const component = await createComponent();
    component.onSearchInput('zzzznonexistentzzzz');
    expect(component.filteredOffices().length).toBe(0);
  });

  // Regression guards for F-11. The active filter was conveyed by a CSS class
  // alone, so a screen-reader user could not tell which filter was on, and
  // the resulting count was never announced at all.
  it('states which filter is active via aria-pressed, not only a class', async () => {
    const fixture = await createFixture();
    const host = fixture.nativeElement as HTMLElement;

    const buttons = Array.from(host.querySelectorAll('.category-filters button'));
    expect(buttons.length).toBeGreaterThan(1);
    for (const b of buttons) expect(b.getAttribute('aria-pressed')).toMatch(/^(true|false)$/);

    expect(buttons.filter((b) => b.getAttribute('aria-pressed') === 'true').length).toBe(1);

    fixture.componentInstance.setCategory('finance');
    fixture.detectChanges();

    const pressed = Array.from(host.querySelectorAll('.category-filters button')).filter(
      (b) => b.getAttribute('aria-pressed') === 'true',
    );
    expect(pressed.length).toBe(1);
    expect(pressed[0].textContent?.trim()).toBe('Finance');
  });

  it('announces the result count through a live region', async () => {
    const fixture = await createFixture();
    const host = fixture.nativeElement as HTMLElement;

    const region = host.querySelector('[role="status"]');
    expect(region).not.toBeNull();
    expect(region!.textContent).toContain(String(fixture.componentInstance.resultCount()));

    fixture.componentInstance.onSearchInput('zzzznonexistentzzzz');
    fixture.detectChanges();
    expect(host.querySelector('[role="status"]')!.textContent).toContain('0 offices found');
  });
});
