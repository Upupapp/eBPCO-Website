import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TechnicalDataStore } from '../../core/domain/technical-data-store';
import { SessionService } from '../../core/session/session.service';
import { ACTION_PERMISSIONS } from '../../core/session/permissions';
import { configFor, DocumentFieldDef, EquipmentFamilyKey } from '../../core/domain/generated-document.config';
import {
  ApplicationTechnicalData,
  CommonTechnicalData,
  EquipmentRow,
  Professional,
  RelatedApprovalReferences,
  TechnicalDataFamilies,
  emptyTechnicalData,
} from '../../core/domain/technical-data.model';
import { PermitType } from '../../core/domain/permit.model';
import { ToastService } from '../toast/toast.service';

function getAt(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc === null || acc === undefined || typeof acc !== 'object') return undefined;
    return (acc as Record<string, unknown>)[key];
  }, obj);
}

function setAt(obj: Record<string, unknown>, path: string, value: unknown): void {
  const keys = path.split('.');
  let cursor: Record<string, unknown> = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    const key = keys[i];
    if (typeof cursor[key] !== 'object' || cursor[key] === null) cursor[key] = {};
    cursor = cursor[key] as Record<string, unknown>;
  }
  cursor[keys[keys.length - 1]] = value;
}

const RELATED_APPROVAL_LABELS: Partial<Record<keyof RelatedApprovalReferences, string>> = {
  zoningClearanceNo: 'Zoning Clearance No.',
  fsecNo: 'FSEC No.',
  architecturalPermitNo: 'Architectural Permit No.',
  structuralPermitNo: 'Structural Permit No.',
  electricalPermitNo: 'Electrical Permit No.',
  mechanicalPermitNo: 'Mechanical Permit No.',
  sanitaryPermitNo: 'Sanitary Permit No.',
  plumbingPermitNo: 'Plumbing Permit No.',
  electronicsPermitNo: 'Electronics Permit No.',
  interiorDesignPermitNo: 'Interior Design Permit No.',
  buildingPermitNo: 'Building Permit No.',
  certificateOfOccupancyNo: 'Certificate of Occupancy No.',
  fsicNo: 'FSIC No.',
  occupancyApplicationNo: 'Occupancy Application No.',
};

const EQUIPMENT_ARRAY_KEY: Record<EquipmentFamilyKey, 'equipment' | 'fixtures' | 'systems'> = {
  electrical: 'equipment',
  mechanical: 'equipment',
  sanitary: 'fixtures',
  plumbing: 'fixtures',
  electronics: 'systems',
};

/**
 * Config-driven staff intake form for ApplicationTechnicalData — reads the
 * SAME GENERATED_DOCUMENT_CONFIG the printed document reads, so there is
 * exactly one place that decides "which fields this permit type needs,"
 * not a separate form per type. Edits are staged locally until Save, then
 * written through TechnicalDataStore (which auto-demotes Verified back to
 * Draft on any change) — Verify is a separate, explicit action gated by
 * every required field actually being filled.
 */
@Component({
  selector: 'app-technical-data-form',
  imports: [FormsModule],
  templateUrl: './technical-data-form.html',
  styleUrl: './technical-data-form.scss',
})
export class TechnicalDataForm {
  private readonly technicalDataStore = inject(TechnicalDataStore);
  private readonly session = inject(SessionService);
  private readonly toast = inject(ToastService);

  readonly applicationId = input.required<string>();
  readonly permitType = input.required<PermitType>();

  protected readonly config = computed(() => configFor(this.permitType()));

  protected readonly canEdit = computed(() => {
    const role = this.session.role();
    return !!role && ACTION_PERMISSIONS.editTechnicalData(role);
  });
  protected readonly canVerify = computed(() => {
    const role = this.session.role();
    return !!role && ACTION_PERMISSIONS.verifyTechnicalData(role);
  });

  protected readonly draft = signal<ApplicationTechnicalData>(emptyTechnicalData(''));
  protected readonly newProfessional = signal<{ role: string; fullName: string; prcNumber: string; ptrNumber: string }>({
    role: '',
    fullName: '',
    prcNumber: '',
    ptrNumber: '',
  });
  protected readonly newEquipmentRow = signal<{ description: string; quantity: string; unit: string; rating: string; location: string }>({
    description: '',
    quantity: '',
    unit: '',
    rating: '',
    location: '',
  });
  protected readonly missingFields = signal<string[]>([]);

  constructor() {
    effect(() => {
      const id = this.applicationId();
      this.draft.set(structuredClone(this.technicalDataStore.getFor(id)));
      this.missingFields.set([]);
    });
  }

  protected relatedApprovalLabel(key: keyof RelatedApprovalReferences): string {
    return RELATED_APPROVAL_LABELS[key] ?? key;
  }

  protected fieldValue(field: DocumentFieldDef): unknown {
    return getAt(this.draft(), field.id);
  }

  protected setFieldValue(field: DocumentFieldDef, value: unknown): void {
    this.draft.update((current) => {
      const next = structuredClone(current);
      let coerced: unknown = value;
      if (field.type === 'number' && value !== '' && value !== null) coerced = Number(value);
      if (field.type === 'number' && value === '') coerced = null;
      setAt(next as unknown as Record<string, unknown>, field.id, coerced);
      return next;
    });
  }

  protected setCommon<K extends keyof CommonTechnicalData>(key: K, value: CommonTechnicalData[K]): void {
    this.draft.update((current) => ({ ...current, common: { ...current.common, [key]: value } }));
  }

  protected setLot(key: 'octTctNumber' | 'taxDeclarationNumber' | 'surveyPlanNumber', value: string): void {
    this.draft.update((current) => ({
      ...current,
      common: { ...current.common, lot: { ...current.common.lot, [key]: value || null } },
    }));
  }

  protected toNumberOrNull(value: string): number | null {
    return value === '' || value === null || value === undefined ? null : Number(value);
  }

  protected setProjectCostFromPesos(value: string): void {
    const centavos = value === '' ? null : Math.round(Number(value) * 100);
    this.draft.update((current) => ({ ...current, common: { ...current.common, projectCostCentavos: centavos } }));
  }

  protected setLotAreaSqm(value: string): void {
    this.draft.update((current) => ({
      ...current,
      common: { ...current.common, lot: { ...current.common.lot, lotAreaSqm: value === '' ? null : Number(value) } },
    }));
  }

  protected setRelatedApproval(key: keyof RelatedApprovalReferences, value: string): void {
    this.draft.update((current) => ({
      ...current,
      common: {
        ...current.common,
        relatedApprovals: { ...current.common.relatedApprovals, [key]: value || null },
      },
    }));
  }

  protected addProfessional(): void {
    const form = this.newProfessional();
    if (!form.fullName.trim() || !form.role.trim()) {
      this.toast.error('Enter both a role and a name for the professional.');
      return;
    }
    const professional: Professional = {
      id: `local-${Date.now()}`,
      role: form.role,
      fullName: form.fullName,
      prcNumber: form.prcNumber || null,
      prcExpiry: null,
      ptrNumber: form.ptrNumber || null,
      ptrIssuedAt: null,
      tin: null,
    };
    this.draft.update((current) => ({
      ...current,
      common: { ...current.common, professionals: [...current.common.professionals, professional] },
    }));
    this.newProfessional.set({ role: '', fullName: '', prcNumber: '', ptrNumber: '' });
  }

  protected removeProfessional(id: string): void {
    this.draft.update((current) => ({
      ...current,
      common: { ...current.common, professionals: current.common.professionals.filter((p) => p.id !== id) },
    }));
  }

  protected equipmentRows(): EquipmentRow[] {
    const eq = this.config().equipmentTable;
    if (!eq) return [];
    const families = this.draft().families as unknown as Record<string, Record<string, unknown> | undefined>;
    const block = families[eq.family];
    if (!block) return [];
    const arrayKey = EQUIPMENT_ARRAY_KEY[eq.family];
    return (block[arrayKey] as EquipmentRow[] | undefined) ?? [];
  }

  protected addEquipmentRow(): void {
    const eq = this.config().equipmentTable;
    if (!eq) return;
    const form = this.newEquipmentRow();
    if (!form.description.trim()) {
      this.toast.error('Enter a description for this equipment/fixture row.');
      return;
    }
    const row: EquipmentRow = {
      id: `local-${Date.now()}`,
      description: form.description,
      quantity: form.quantity === '' ? null : Number(form.quantity),
      unit: form.unit || null,
      rating: form.rating || null,
      location: form.location || null,
      newExistingRelocated: 'New',
      remarks: null,
    };
    const arrayKey = EQUIPMENT_ARRAY_KEY[eq.family];
    this.draft.update((current) => {
      const families = current.families as unknown as Record<string, Record<string, unknown> | undefined>;
      const block = (families[eq.family] as Record<string, unknown>) ?? {};
      const currentRows = (block[arrayKey] as EquipmentRow[] | undefined) ?? [];
      const nextBlock = { ...block, [arrayKey]: [...currentRows, row] };
      return { ...current, families: { ...current.families, [eq.family]: nextBlock } as TechnicalDataFamilies };
    });
    this.newEquipmentRow.set({ description: '', quantity: '', unit: '', rating: '', location: '' });
  }

  protected removeEquipmentRow(rowId: string): void {
    const eq = this.config().equipmentTable;
    if (!eq) return;
    const arrayKey = EQUIPMENT_ARRAY_KEY[eq.family];
    this.draft.update((current) => {
      const families = current.families as unknown as Record<string, Record<string, unknown> | undefined>;
      const block = (families[eq.family] as Record<string, unknown>) ?? {};
      const currentRows = (block[arrayKey] as EquipmentRow[] | undefined) ?? [];
      const nextBlock = { ...block, [arrayKey]: currentRows.filter((r) => r.id !== rowId) };
      return { ...current, families: { ...current.families, [eq.family]: nextBlock } as TechnicalDataFamilies };
    });
  }

  protected save(): void {
    const actor = this.session.name() || 'Staff';
    const role = this.session.role() ?? 'Administrator';
    const id = this.applicationId();
    const d = this.draft();
    this.technicalDataStore.updateCommon(id, d.common, actor, role);
    for (const key of Object.keys(d.families) as (keyof TechnicalDataFamilies)[]) {
      this.technicalDataStore.updateFamily(id, key, d.families[key], actor, role);
    }
    this.missingFields.set([]);
    this.toast.success('Technical details saved.');
  }

  protected verify(): void {
    this.save();
    const actor = this.session.name() || 'Staff';
    const role = this.session.role() ?? 'Administrator';
    const id = this.applicationId();
    const required = this.config().requiredForIssuance;
    const ok = this.technicalDataStore.verify(id, required, actor, role);
    if (ok) {
      this.missingFields.set([]);
      this.toast.success('Technical data verified.');
      this.draft.set(structuredClone(this.technicalDataStore.getFor(id)));
    } else {
      this.missingFields.set(this.technicalDataStore.missingRequiredFields(id, required));
      this.toast.error('Some required fields are still missing — see below.');
    }
  }

  protected fieldLabel(path: string): string {
    const match = this.config().technicalFields.find((f) => f.id === path);
    return match?.label ?? path;
  }
}
