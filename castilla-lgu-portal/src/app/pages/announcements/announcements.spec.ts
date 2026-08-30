import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Announcements } from './announcements';
import { ANNOUNCEMENTS_SOURCE } from '../../core/data/announcements.token';
import { ANNOUNCEMENTS } from '../../core/data/announcements.data';
import { Announcement } from '../../core/models/announcement.model';

async function render(feed?: Announcement[]) {
  await TestBed.configureTestingModule({
    imports: [Announcements],
    providers: [
      provideRouter([]),
      ...(feed ? [{ provide: ANNOUNCEMENTS_SOURCE, useValue: feed }] : []),
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(Announcements);
  fixture.detectChanges();
  return fixture;
}

const text = (f: { nativeElement: HTMLElement }) =>
  (f.nativeElement.textContent ?? '').replace(/\s+/g, ' ');

describe('Announcements', () => {
  it('ships with no invented announcements', () => {
    expect(ANNOUNCEMENTS).toEqual([]);
  });

  it('shows an honest empty state rather than sample notices', async () => {
    const fixture = await render();
    expect(text(fixture)).toContain('has not published any announcements here yet');
    expect(fixture.nativeElement.querySelectorAll('.announcement').length).toBe(0);
  });

  // An empty feed can never show the page actually renders anything, so
  // substitute one. This is also the shape the announcements API will supply.
  it('renders a supplied feed', async () => {
    const fixture = await render([
      {
        slug: 'water-interruption',
        title: 'Scheduled water service interruption',
        body: 'Service will be interrupted for pipeline repair.',
        publishedAt: '2026-08-20',
        category: 'Advisory',
      },
    ]);

    const body = text(fixture);
    expect(body).toContain('Scheduled water service interruption');
    expect(body).toContain('Service will be interrupted for pipeline repair.');
    expect(body).toContain('Advisory');
    expect(body).not.toContain('has not published any announcements here yet');
  });

  it('orders newest first regardless of the order supplied', async () => {
    const fixture = await render([
      { slug: 'older', title: 'Older notice', body: 'b', publishedAt: '2026-01-05' },
      { slug: 'newest', title: 'Newest notice', body: 'b', publishedAt: '2026-08-20' },
      { slug: 'middle', title: 'Middle notice', body: 'b', publishedAt: '2026-04-11' },
    ]);

    const host = fixture.nativeElement as HTMLElement;
    const titles = Array.from(host.querySelectorAll<HTMLElement>('.announcement-title')).map((el) =>
      el.textContent?.trim(),
    );

    expect(titles).toEqual(['Newest notice', 'Middle notice', 'Older notice']);
  });

  it('omits the category chip when a notice has none', async () => {
    const fixture = await render([
      { slug: 'plain', title: 'Plain notice', body: 'b', publishedAt: '2026-08-20' },
    ]);
    expect(fixture.nativeElement.querySelectorAll('.announcement-category').length).toBe(0);
  });
});
