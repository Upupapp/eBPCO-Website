import { TestBed } from '@angular/core/testing';
import { Contact } from './contact';
import { WEBGL_SUPPORT } from '../../core/browser/webgl.token';

async function render(webgl: boolean) {
  TestBed.resetTestingModule();
  await TestBed.configureTestingModule({
    imports: [Contact],
    providers: [{ provide: WEBGL_SUPPORT, useValue: webgl }],
  }).compileComponents();

  const fixture = TestBed.createComponent(Contact);
  fixture.detectChanges();
  return fixture;
}

const host = (f: { nativeElement: unknown }) => f.nativeElement as HTMLElement;
const text = (f: { nativeElement: unknown }) => (host(f).textContent ?? '').replace(/\s+/g, ' ');

describe('Contact', () => {
  it('does not load the third-party map frame until it is asked for', async () => {
    const fixture = await render(true);

    // The point of the exercise: rendering this page must not, on its own,
    // disclose the reader's IP address to OpenStreetMap.
    expect(host(fixture).querySelector('iframe')).toBeNull();
    expect(host(fixture).querySelector('.map-placeholder')).not.toBeNull();
  });

  it('loads the map frame once the reader asks', async () => {
    const fixture = await render(true);

    const button = host(fixture).querySelector<HTMLButtonElement>('.map-load-btn');
    expect(button).not.toBeNull();
    button!.click();
    fixture.detectChanges();

    const frame = host(fixture).querySelector('iframe');
    expect(frame).not.toBeNull();
    expect(frame!.getAttribute('title')).toContain('Castilla Municipal Hall');
  });

  it('says the map comes from a third party before loading it', async () => {
    const fixture = await render(true);
    expect(text(fixture)).toContain('OpenStreetMap, a third-party service');
  });

  // OpenStreetMap's embed is MapLibre GL and renders its own error notice
  // where WebGL is absent. Offering the button there would invite the reader
  // to open a frame that cannot draw.
  it('offers no map button where WebGL is unavailable', async () => {
    const fixture = await render(false);

    expect(host(fixture).querySelector('.map-load-btn')).toBeNull();
    expect(host(fixture).querySelector('iframe')).toBeNull();
    expect(text(fixture)).toContain('An interactive map cannot be displayed on this device');
  });

  // Whatever happens to the map, the page still has to answer "where is it"
  // and "how do I get there".
  it.each([[true], [false]])(
    'always shows the address and a directions link (webgl=%s)',
    async (webgl) => {
      const fixture = await render(webgl);
      const body = text(fixture);

      expect(body).toContain('Castilla Municipal Hall');
      expect(body).toContain('Cumadcad');
      expect(host(fixture).querySelector('.directions-btn')?.getAttribute('href')).toContain(
        '12.97844,123.80029',
      );
    },
  );

  it('still lists the published contact fields', async () => {
    const fixture = await render(true);
    const body = text(fixture);
    expect(body).toContain('(056) 311-2112');
    expect(body).toContain('LGU Main Website');
  });
});
