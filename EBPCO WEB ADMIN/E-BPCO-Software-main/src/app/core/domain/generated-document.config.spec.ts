import { ALL_PERMIT_TYPES } from './permit.model';
import { GENERATED_DOCUMENT_CONFIG, assertGeneratedDocumentConfigComplete } from './generated-document.config';

describe('GENERATED_DOCUMENT_CONFIG', () => {
  it('has exactly one config entry per ALL_PERMIT_TYPES value, no more, no less', () => {
    expect(() => assertGeneratedDocumentConfigComplete()).not.toThrow();
    expect(Object.keys(GENERATED_DOCUMENT_CONFIG).length).toBe(ALL_PERMIT_TYPES.length);
    for (const type of ALL_PERMIT_TYPES) {
      expect(GENERATED_DOCUMENT_CONFIG[type]).toBeTruthy();
      expect(GENERATED_DOCUMENT_CONFIG[type].permitType).toBe(type);
    }
  });

  it('every config always renders the core identity/approval sections', () => {
    for (const type of ALL_PERMIT_TYPES) {
      const sections = GENERATED_DOCUMENT_CONFIG[type].sections;
      expect(sections).toContain('officialHeader');
      expect(sections).toContain('permitTitle');
      expect(sections).toContain('permitNumber');
      expect(sections).toContain('approvalSignature');
      expect(sections).toContain('qr');
      expect(sections).toContain('footer');
    }
  });

  it('FSEC and FSIC use the BFP agency header; every other type uses an OBO/Zoning header', () => {
    const bfpTypes: string[] = ['FSEC for Building Permit (BFP)', 'FSIC for Occupancy Permit (BFP)'];
    for (const type of ALL_PERMIT_TYPES) {
      const header = GENERATED_DOCUMENT_CONFIG[type].agencyHeader;
      if (bfpTypes.includes(type)) {
        expect(header.line3).toBe('Bureau of Fire Protection');
      } else {
        expect(header.line3).not.toBe('Bureau of Fire Protection');
      }
    }
  });

  it('every type with an equipmentTable also lists an equipmentTable section', () => {
    for (const type of ALL_PERMIT_TYPES) {
      const config = GENERATED_DOCUMENT_CONFIG[type];
      if (config.equipmentTable) {
        expect(config.sections).toContain('equipmentTable');
        expect(config.equipmentTable.columns.length).toBeGreaterThan(0);
      }
    }
  });

  it('every technicalFields entry has a non-empty dot-path id and label', () => {
    for (const type of ALL_PERMIT_TYPES) {
      for (const field of GENERATED_DOCUMENT_CONFIG[type].technicalFields) {
        expect(field.id.length).toBeGreaterThan(0);
        expect(field.id).toContain('.');
        expect(field.label.length).toBeGreaterThan(0);
      }
    }
  });
});
