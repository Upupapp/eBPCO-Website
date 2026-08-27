import { Injectable, signal } from '@angular/core';
import {
  ApplicationTechnicalData,
  CommonTechnicalData,
  EquipmentRow,
  Professional,
  TechnicalDataFamilies,
  emptyTechnicalData,
} from './technical-data.model';
import { AuditEvent } from './audit.model';

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const EQUIPMENT_FAMILIES = ['electrical', 'mechanical', 'sanitary', 'plumbing', 'electronics'] as const;
type EquipmentFamily = (typeof EQUIPMENT_FAMILIES)[number];

/** Which array field on a family block holds its EquipmentRow[] — 'sanitary'/'plumbing' name theirs `fixtures`, the rest `equipment`/`systems`. */
function equipmentArrayKey(family: EquipmentFamily): 'equipment' | 'fixtures' | 'systems' {
  if (family === 'sanitary' || family === 'plumbing') return 'fixtures';
  if (family === 'electronics') return 'systems';
  return 'equipment';
}

let seq = 1;

/**
 * Owns the structured, staff-verified technical facts behind every
 * generated permit document — one ApplicationTechnicalData record per
 * application. Mirrors AssessmentStore's own conventions (signal-backed,
 * append-only audit log merged into ApplicationStore.getAuditTrail).
 *
 * "Reviewer-verified wins" is implemented at the record level: `verify()`
 * is the only way to reach `status: 'Verified'`, and any subsequent edit
 * (`updateCommon`/`updateFamily`/professional or equipment-row mutation)
 * silently demotes the record back to 'Draft' so a generated document can
 * never present a since-edited value as reviewer-final.
 */
@Injectable({ providedIn: 'root' })
export class TechnicalDataStore {
  private readonly _records = signal<ApplicationTechnicalData[]>([]);
  private readonly _auditEvents = signal<AuditEvent[]>([]);
  readonly auditEvents = this._auditEvents.asReadonly();

  private audit(applicationId: string, actor: string, role: string, action: string): void {
    const now = new Date();
    this._auditEvents.update((rows) => [
      ...rows,
      {
        id: `AUD-TDATA-${rows.length + 1}`,
        applicationId,
        actor,
        role,
        action,
        timestampValue: now,
        timestamp: formatDate(now),
        remarks: null,
      },
    ]);
  }

  /** Always returns a record — an application with nothing entered yet gets an empty one lazily rather than `undefined`, so every consumer (form, document engine, watermark gate) has one shape to read. */
  getFor(applicationId: string): ApplicationTechnicalData {
    return this._records().find((r) => r.applicationId === applicationId) ?? emptyTechnicalData(applicationId);
  }

  /** True once a record has actually been saved (Draft or Verified) — distinct from getFor's lazy default, used to show "not yet started" in the intake tab. */
  hasRecord(applicationId: string): boolean {
    return this._records().some((r) => r.applicationId === applicationId);
  }

  private upsert(applicationId: string, mutate: (record: ApplicationTechnicalData) => ApplicationTechnicalData): void {
    this._records.update((rows) => {
      const existing = rows.find((r) => r.applicationId === applicationId);
      const base = existing ?? emptyTechnicalData(applicationId);
      const now = new Date();
      const next = { ...mutate(base), updatedAtValue: now, updatedAt: formatDate(now) };
      return existing ? rows.map((r) => (r.applicationId === applicationId ? next : r)) : [...rows, next];
    });
  }

  /** Demotes an already-Verified record back to Draft — called by every mutation below so a generated document can never present a since-edited field as reviewer-final. */
  private demote(record: ApplicationTechnicalData): ApplicationTechnicalData {
    if (record.status === 'Draft') return record;
    return { ...record, status: 'Draft', verifiedBy: null, verifiedAtValue: null, verifiedAt: null };
  }

  updateCommon(applicationId: string, patch: Partial<CommonTechnicalData>, actor: string, role: string): void {
    this.upsert(applicationId, (record) =>
      this.demote({ ...record, common: { ...record.common, ...patch } }),
    );
    this.audit(applicationId, actor, role, 'Technical data updated');
  }

  updateFamily<K extends keyof TechnicalDataFamilies>(
    applicationId: string,
    key: K,
    patch: TechnicalDataFamilies[K],
    actor: string,
    role: string,
  ): void {
    this.upsert(applicationId, (record) =>
      this.demote({ ...record, families: { ...record.families, [key]: patch } }),
    );
    this.audit(applicationId, actor, role, `Technical data (${String(key)}) updated`);
  }

  addProfessional(applicationId: string, professional: Omit<Professional, 'id'>, actor: string, role: string): void {
    const id = `PROF-${seq++}`;
    this.upsert(applicationId, (record) =>
      this.demote({
        ...record,
        common: { ...record.common, professionals: [...record.common.professionals, { ...professional, id }] },
      }),
    );
    this.audit(applicationId, actor, role, `Professional of record added: ${professional.fullName}`);
  }

  removeProfessional(applicationId: string, professionalId: string, actor: string, role: string): void {
    this.upsert(applicationId, (record) =>
      this.demote({
        ...record,
        common: {
          ...record.common,
          professionals: record.common.professionals.filter((p) => p.id !== professionalId),
        },
      }),
    );
    this.audit(applicationId, actor, role, 'Professional of record removed');
  }

  addEquipmentRow(applicationId: string, family: EquipmentFamily, row: Omit<EquipmentRow, 'id'>, actor: string, role: string): void {
    const id = `EQ-${seq++}`;
    const arrayKey = equipmentArrayKey(family);
    this.upsert(applicationId, (record) => {
      const existingFamilyBlock = (record.families[family] as Record<string, unknown> | undefined) ?? {};
      const currentRows = (existingFamilyBlock[arrayKey] as EquipmentRow[] | undefined) ?? [];
      const nextFamilyBlock = { ...existingFamilyBlock, [arrayKey]: [...currentRows, { ...row, id }] };
      return this.demote({
        ...record,
        families: { ...record.families, [family]: nextFamilyBlock },
      });
    });
    this.audit(applicationId, actor, role, `Equipment/fixture row added (${family})`);
  }

  removeEquipmentRow(applicationId: string, family: EquipmentFamily, rowId: string, actor: string, role: string): void {
    const arrayKey = equipmentArrayKey(family);
    this.upsert(applicationId, (record) => {
      const existingFamilyBlock = (record.families[family] as Record<string, unknown> | undefined) ?? {};
      const currentRows = (existingFamilyBlock[arrayKey] as EquipmentRow[] | undefined) ?? [];
      const nextFamilyBlock = { ...existingFamilyBlock, [arrayKey]: currentRows.filter((r) => r.id !== rowId) };
      return this.demote({
        ...record,
        families: { ...record.families, [family]: nextFamilyBlock },
      });
    });
    this.audit(applicationId, actor, role, `Equipment/fixture row removed (${family})`);
  }

  /** Reads a dot-path (e.g. "common.floorAreaSqm", "families.electrical.connectedLoadKva") off a technical-data record. */
  private readPath(record: ApplicationTechnicalData, path: string): unknown {
    return path.split('.').reduce<unknown>((acc, key) => {
      if (acc === null || acc === undefined || typeof acc !== 'object') return undefined;
      return (acc as Record<string, unknown>)[key];
    }, record);
  }

  private isFilled(value: unknown): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (Array.isArray(value)) return value.length > 0;
    return true;
  }

  /** Every required field, by dot-path, that's still missing — an empty array means the record is ready to verify. */
  missingRequiredFields(applicationId: string, requiredFieldIds: string[]): string[] {
    const record = this.getFor(applicationId);
    return requiredFieldIds.filter((path) => !this.isFilled(this.readPath(record, path)));
  }

  /** Validates every field id in `requiredFieldIds`, then flips status to 'Verified'. Returns false (no mutation) if any required field is still missing — the one enforcement point for "prevent final issuance if a mandatory field is missing" at the technical-data layer. */
  verify(applicationId: string, requiredFieldIds: string[], actor: string, role: string): boolean {
    if (this.missingRequiredFields(applicationId, requiredFieldIds).length > 0) return false;
    this.upsert(applicationId, (record) => {
      const now = new Date();
      return { ...record, status: 'Verified', verifiedBy: actor, verifiedAtValue: now, verifiedAt: formatDate(now) };
    });
    this.audit(applicationId, actor, role, 'Technical data verified');
    return true;
  }

  /** Explicit re-open action for a staff member who wants to re-open without editing a field first. */
  reopenForEdit(applicationId: string, reason: string, actor: string, role: string): void {
    this.upsert(applicationId, (record) => this.demote(record));
    this.audit(applicationId, actor, role, `Technical data reopened for edit: ${reason}`);
  }
}
