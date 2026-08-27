import { Component, computed, input } from '@angular/core';
import { DocumentFieldDef } from '../../core/domain/generated-document.config';
import { ApplicationTechnicalData } from '../../core/domain/technical-data.model';
import { PLACEHOLDER_PENDING, displayBoolean, displayNumber, displayOrPlaceholder, formatPHP, readPath } from './doc-format';

interface RenderedField {
  label: string;
  display: string;
  filled: boolean;
}

@Component({
  selector: 'app-technical-summary-section',
  templateUrl: './technical-summary-section.html',
  styleUrl: '../styles/shared-section.scss',
})
export class TechnicalSummarySection {
  readonly fields = input<DocumentFieldDef[]>([]);
  readonly technicalData = input<ApplicationTechnicalData | undefined>(undefined);

  protected readonly rendered = computed<RenderedField[]>(() => {
    const data = this.technicalData();
    if (!data) return [];
    return this.fields().map((field) => {
      const raw = readPath(data, field.id);
      if (field.type === 'boolean') {
        return { label: field.label, display: displayBoolean(raw as boolean | null, PLACEHOLDER_PENDING), filled: raw !== null && raw !== undefined };
      }
      if (field.type === 'number' && field.unit === 'PHP') {
        return { label: field.label, display: formatPHP(raw as number | null), filled: raw !== null && raw !== undefined };
      }
      if (field.type === 'number') {
        return { label: field.label, display: displayNumber(raw as number | null, field.unit, PLACEHOLDER_PENDING), filled: raw !== null && raw !== undefined };
      }
      return {
        label: field.label,
        display: displayOrPlaceholder(raw as string | null, PLACEHOLDER_PENDING),
        filled: raw !== null && raw !== undefined && String(raw).trim().length > 0,
      };
    });
  });
}
