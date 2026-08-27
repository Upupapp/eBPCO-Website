import { TestBed } from '@angular/core/testing';
import { TechnicalDataStore } from './technical-data-store';

describe('TechnicalDataStore', () => {
  let store: TechnicalDataStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [TechnicalDataStore] });
    store = TestBed.inject(TechnicalDataStore);
  });

  it('getFor returns a lazily-empty Draft record for an application with nothing entered yet', () => {
    const record = store.getFor('APP-1');
    expect(record.status).toBe('Draft');
    expect(record.common.floorAreaSqm).toBeNull();
    expect(store.hasRecord('APP-1')).toBe(false);
  });

  it('updateCommon persists a patch and marks the record as having a saved row', () => {
    store.updateCommon('APP-2', { floorAreaSqm: 186.5 }, 'Tester', 'Evaluator');
    expect(store.hasRecord('APP-2')).toBe(true);
    expect(store.getFor('APP-2').common.floorAreaSqm).toBe(186.5);
  });

  it('updateFamily writes into the named family block without disturbing others', () => {
    store.updateCommon('APP-3', { floorAreaSqm: 100 }, 'Tester', 'Evaluator');
    store.updateFamily('APP-3', 'buildingWorks', { numberOfStoreys: 2, buildingHeightMeters: null, buildingUseOrOccupancy: null, occupancyClassification: null, typeOfConstruction: null }, 'Tester', 'Evaluator');
    const record = store.getFor('APP-3');
    expect(record.common.floorAreaSqm).toBe(100);
    expect(record.families.buildingWorks?.numberOfStoreys).toBe(2);
  });

  it('verify refuses while a required field is still missing, and lists it', () => {
    store.updateCommon('APP-4', { floorAreaSqm: 100 }, 'Tester', 'Evaluator');
    const ok = store.verify('APP-4', ['common.floorAreaSqm', 'common.projectCostCentavos'], 'Officer', 'Approving Officer');
    expect(ok).toBe(false);
    expect(store.missingRequiredFields('APP-4', ['common.floorAreaSqm', 'common.projectCostCentavos'])).toEqual([
      'common.projectCostCentavos',
    ]);
    expect(store.getFor('APP-4').status).toBe('Draft');
  });

  it('verify succeeds once every required field is filled, stamping verifiedBy/verifiedAt', () => {
    store.updateCommon('APP-5', { floorAreaSqm: 100, projectCostCentavos: 500000 }, 'Tester', 'Evaluator');
    const ok = store.verify('APP-5', ['common.floorAreaSqm', 'common.projectCostCentavos'], 'Officer', 'Approving Officer');
    expect(ok).toBe(true);
    const record = store.getFor('APP-5');
    expect(record.status).toBe('Verified');
    expect(record.verifiedBy).toBe('Officer');
  });

  it('editing an already-Verified record silently demotes it back to Draft', () => {
    store.updateCommon('APP-6', { floorAreaSqm: 100 }, 'Tester', 'Evaluator');
    store.verify('APP-6', ['common.floorAreaSqm'], 'Officer', 'Approving Officer');
    expect(store.getFor('APP-6').status).toBe('Verified');

    store.updateCommon('APP-6', { floorAreaSqm: 92.4 }, 'Tester', 'Evaluator');
    const record = store.getFor('APP-6');
    expect(record.status).toBe('Draft');
    expect(record.verifiedBy).toBeNull();
    expect(record.common.floorAreaSqm).toBe(92.4);
  });

  it('addProfessional/removeProfessional mutate the professionals list and demote a Verified record', () => {
    store.updateCommon('APP-7', { floorAreaSqm: 1 }, 'Tester', 'Evaluator');
    store.verify('APP-7', ['common.floorAreaSqm'], 'Officer', 'Approving Officer');

    store.addProfessional(
      'APP-7',
      { role: 'Architect', fullName: 'Arch. Dela Cruz', prcNumber: '12345', prcExpiry: null, ptrNumber: null, ptrIssuedAt: null, tin: null },
      'Tester',
      'Evaluator',
    );
    let record = store.getFor('APP-7');
    expect(record.common.professionals.length).toBe(1);
    expect(record.status).toBe('Draft');

    const id = record.common.professionals[0].id;
    store.removeProfessional('APP-7', id, 'Tester', 'Evaluator');
    record = store.getFor('APP-7');
    expect(record.common.professionals.length).toBe(0);
  });

  it('addEquipmentRow/removeEquipmentRow write into the correct family array field', () => {
    store.addEquipmentRow(
      'APP-8',
      'electrical',
      { description: 'Main Panel', quantity: 1, unit: null, rating: '100A', location: 'Ground Floor', newExistingRelocated: 'New', remarks: null },
      'Tester',
      'Evaluator',
    );
    let record = store.getFor('APP-8');
    expect(record.families.electrical?.equipment?.length).toBe(1);

    const rowId = record.families.electrical!.equipment![0].id;
    store.removeEquipmentRow('APP-8', 'electrical', rowId, 'Tester', 'Evaluator');
    record = store.getFor('APP-8');
    expect(record.families.electrical?.equipment?.length).toBe(0);
  });

  it('addEquipmentRow writes plumbing/sanitary rows into their fixtures array, not equipment', () => {
    store.addEquipmentRow(
      'APP-9',
      'plumbing',
      { description: 'Water Closet', quantity: 3, unit: null, rating: null, location: null, newExistingRelocated: 'New', remarks: null },
      'Tester',
      'Evaluator',
    );
    const record = store.getFor('APP-9');
    expect(record.families.plumbing?.fixtures?.length).toBe(1);
  });
});
