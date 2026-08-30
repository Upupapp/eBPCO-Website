import { Component, computed, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { MUNICIPAL_OFFICES, OFFICE_CATEGORIES } from '../../core/data/offices.data';
import { OfficeHead } from '../../core/models/office.model';
import { initialsFromName } from '../../core/util/initials';
import { NoIndex } from '../../shared/no-index/no-index';

@Component({
  selector: 'app-office-detail',
  imports: [RouterLink, NoIndex],
  templateUrl: './office-detail.html',
  styleUrl: './office-detail.scss',
})
export class OfficeDetail {
  private readonly route = inject(ActivatedRoute);

  private readonly slug = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('slug') ?? '')),
    { initialValue: '' },
  );

  readonly office = computed(() => MUNICIPAL_OFFICES.find((o) => o.slug === this.slug()));

  readonly relatedOffices = computed(() => {
    const office = this.office();
    if (!office) return [];
    return office.relatedOfficeSlugs
      .map((slug) => MUNICIPAL_OFFICES.find((o) => o.slug === slug))
      .filter((o): o is (typeof MUNICIPAL_OFFICES)[number] => !!o);
  });

  // The avatar used to render head.position.slice(0, 1), so thirteen of the
  // seventeen named heads showed "M" — the M of "Municipal". Prefer initials
  // the record already states, and derive them from the name otherwise.
  headInitials(head: OfficeHead): string {
    return head.initials?.trim() || initialsFromName(head.name);
  }

  categoryLabel(categoryId: string): string {
    return OFFICE_CATEGORIES.find((c) => c.id === categoryId)?.label ?? categoryId;
  }
}
