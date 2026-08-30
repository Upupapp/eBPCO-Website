import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SectionHeading } from '../../shared/section-heading/section-heading';
import { MUNICIPAL_OFFICES, OFFICE_CATEGORIES } from '../../core/data/offices.data';
import { PUBLIC_PERMIT_TYPES } from '../../core/data/permits.data';
import { MunicipalOffice, OfficeCategory } from '../../core/models/office.model';

type CategoryFilter = OfficeCategory | 'all';

@Component({
  selector: 'app-offices',
  imports: [RouterLink, SectionHeading],
  templateUrl: './offices.html',
  styleUrl: './offices.scss',
})
export class Offices {
  readonly categories = OFFICE_CATEGORIES;
  readonly searchTerm = signal('');
  readonly activeCategory = signal<CategoryFilter>('all');

  // Searching only name + shortDescription meant the four terms a citizen is
  // most likely to type on this portal — "building permit", "building",
  // "occupancy", "zoning" — all returned the empty state.
  //
  // Two distinct gaps caused that. "building permit" was listed in the
  // issuing office's `services` but never searched; widening the haystack to
  // the whole record fixes those. "occupancy" and "zoning" appear nowhere in
  // offices.data.ts at all, and are not invented here — instead the office
  // inherits the names of the permits that permits.data.ts already states it
  // issues, which is an assertion the portal makes elsewhere rather than a
  // new claim about the LGU. Searching for a permit therefore finds the
  // counter that issues it.
  private static readonly permitNamesByOffice = PUBLIC_PERMIT_TYPES.reduce<Map<string, string[]>>(
    (map, permit) => {
      if (!permit.issuingOfficeSlug) return map;
      const names = map.get(permit.issuingOfficeSlug) ?? [];
      names.push(permit.name);
      return map.set(permit.issuingOfficeSlug, names);
    },
    new Map(),
  );

  private static haystack(office: MunicipalOffice): string {
    return [
      office.name,
      office.shortDescription,
      office.aboutText,
      ...office.services,
      ...(Offices.permitNamesByOffice.get(office.slug) ?? []),
    ]
      .join(' ')
      .toLowerCase();
  }

  readonly filteredOffices = computed(() => {
    const term = this.searchTerm().trim().toLowerCase();
    const category = this.activeCategory();

    return MUNICIPAL_OFFICES.filter((office) => {
      const matchesCategory = category === 'all' || office.category === category;
      const matchesSearch = !term || Offices.haystack(office).includes(term);
      return matchesCategory && matchesSearch;
    });
  });

  onSearchInput(value: string): void {
    this.searchTerm.set(value);
  }

  setCategory(category: CategoryFilter): void {
    this.activeCategory.set(category);
  }

  categoryLabel(category: OfficeCategory): string {
    return this.categories.find((c) => c.id === category)?.label ?? category;
  }
}
