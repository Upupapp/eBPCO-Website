import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';
import { PROFILE_FIELDS } from '../../core/data/municipality.data';

async function createFixture() {
  await TestBed.configureTestingModule({
    imports: [Home],
    providers: [provideRouter([])],
  }).compileComponents();

  const fixture = TestBed.createComponent(Home);
  fixture.detectChanges();
  return fixture;
}

const countingFields = PROFILE_FIELDS.filter((f) => f.count !== undefined);
const plainFields = PROFILE_FIELDS.filter((f) => f.count === undefined && !f.isPlaceholder);

describe('Home', () => {
  it('has at least one counting field and one plain field to exercise', () => {
    expect(countingFields.length).toBeGreaterThan(0);
    expect(plainFields.length).toBeGreaterThan(0);
  });

  // Regression guard for F-05. The three headline numbers were hardcoded in
  // home.ts (60635 / 186.2 / 34) and the "(2020 Census)" suffix was a literal
  // in home.html, so municipality.data.ts could be revised without changing
  // what the page displayed. These assertions derive every expectation from
  // the data file, so they only hold while the component reads it.
  it.each(countingFields.map((f) => [f.label, f] as const))(
    'settles %s on the value stated in municipality.data.ts',
    async (_label, field) => {
      const fixture = await createFixture();
      expect(fixture.componentInstance.countValue(field)).toBe(field.count);
    },
  );

  it.each(countingFields.map((f) => [f.label, f] as const))(
    'renders %s from the data, suffix included',
    async (_label, field) => {
      const fixture = await createFixture();
      const text = (fixture.nativeElement.textContent as string).replace(/\s+/g, ' ');

      const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: field.countDecimals ?? 0,
        maximumFractionDigits: field.countDecimals ?? 0,
      }).format(field.count!);

      expect(text).toContain(formatted);
      if (field.countSuffix) expect(text).toContain(field.countSuffix);
    },
  );

  it('formats each counting field to the precision its value is written to', async () => {
    const fixture = await createFixture();
    for (const field of countingFields) {
      const digits = field.countDecimals ?? 0;
      expect(fixture.componentInstance.countFormat(field)).toBe(`1.${digits}-${digits}`);
    }
  });

  it('renders non-counting fields verbatim, with no label special-cased', async () => {
    const fixture = await createFixture();
    const text = (fixture.nativeElement.textContent as string).replace(/\s+/g, ' ');
    for (const field of plainFields) expect(text).toContain(field.value);
  });

  it('omits fields still pending confirmation', async () => {
    const fixture = await createFixture();
    const shown = fixture.componentInstance.profileFields;
    expect(shown.every((f) => !f.isPlaceholder)).toBe(true);
  });
});
