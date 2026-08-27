import { Component, input } from '@angular/core';
import { EquipmentRow } from '../../core/domain/technical-data.model';
import { displayOrPlaceholder } from './doc-format';

@Component({
  selector: 'app-equipment-table',
  templateUrl: './equipment-table.html',
  styleUrl: '../styles/shared-section.scss',
})
export class EquipmentTable {
  readonly title = input<string>('Equipment Schedule');
  readonly columns = input<{ key: string; label: string }[]>([]);
  readonly rows = input<EquipmentRow[]>([]);

  protected readonly display = displayOrPlaceholder;

  protected cell(row: EquipmentRow, key: string): string {
    const value = (row as unknown as Record<string, unknown>)[key];
    if (value === null || value === undefined) return '—';
    return String(value);
  }
}
