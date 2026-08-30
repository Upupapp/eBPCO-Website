import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Home } from './home';
import { PROFILE_FIELDS_SOURCE } from '../../core/data/municipality.token';
import { ProfileField } from '../../core/models/official.model';

// Deliberately NOT Castilla's real figures. If any part of the page still
// states a number or suffix of its own, these synthetic values cannot appear
// and the assertions below fail.
//
// This is the guard that a same-values test cannot provide: asserting
// `countValue(field) === field.count` passes just as happily against a
// hardcoded 60635, because the hardcoded constant equals the data. Only
// swapping the data underneath the component proves it is read at all.
const SYNTHETIC_FIELDS: ProfileField[] = [
  {
    label: 'Population',
    value: '12,345 (1999 Census)',
    isPlaceholder: false,
    count: 12345,
    countSuffix: '(1999 Census)',
  },
  {
    label: 'Land Area',
    value: '77.75 km²',
    isPlaceholder: false,
    count: 77.75,
    countSuffix: 'km²',
    countDecimals: 2,
  },
  { label: 'Number of Barangays', value: '7', isPlaceholder: false, count: 7 },
  { label: 'ZIP Code', value: '9999', isPlaceholder: false },
  { label: 'Withheld Field', value: 'should not render', isPlaceholder: true },
];

async function renderedText(): Promise<string> {
  await TestBed.configureTestingModule({
    imports: [Home],
    providers: [provideRouter([]), { provide: PROFILE_FIELDS_SOURCE, useValue: SYNTHETIC_FIELDS }],
  }).compileComponents();

  const fixture = TestBed.createComponent(Home);
  fixture.detectChanges();
  return (fixture.nativeElement.textContent as string).replace(/\s+/g, ' ');
}

describe('Home — values come from municipality.data.ts, not from the component', () => {
  it('counts up to the substituted population and prints its substituted suffix', async () => {
    const text = await renderedText();
    expect(text).toContain('12,345');
    expect(text).toContain('(1999 Census)');
  });

  it('honours the substituted decimal precision and unit', async () => {
    const text = await renderedText();
    expect(text).toContain('77.75');
    expect(text).toContain('km²');
  });

  it('counts up to the substituted barangay total', async () => {
    const text = await renderedText();
    expect(text).toContain('7');
  });

  it('renders a substituted non-counting field verbatim', async () => {
    const text = await renderedText();
    expect(text).toContain('9999');
  });

  it('still omits fields marked pending confirmation', async () => {
    const text = await renderedText();
    expect(text).not.toContain('should not render');
  });

  // The real figures must be absent entirely — their presence would mean the
  // component is carrying its own copy of Castilla's data.
  it.each([['60,635'], ['(2020 Census)'], ['186.20'], ['34 ']])(
    'does not emit the real value %j from anywhere in the component',
    async (literal) => {
      const text = await renderedText();
      expect(text).not.toContain(literal);
    },
  );
});
