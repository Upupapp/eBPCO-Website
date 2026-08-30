export type OfficeCategory =
  'executive' | 'administrative' | 'finance' | 'social-services' | 'development' | 'public-safety';

export interface OfficeCategoryInfo {
  id: OfficeCategory;
  label: string;
}

export interface OfficeHead {
  name: string;
  position: string;
  isPlaceholder: boolean;
  /**
   * Authored avatar initials. Set only where a record already states them —
   * the elected officials in officials.data.ts do. Everything else derives
   * them from `name` via initialsFromName(), so this stays an override rather
   * than a field every office has to remember to fill in.
   */
  initials?: string;
}

export interface OfficeContact {
  /**
   * Undefined where the LGU has not confirmed a number, or where one was
   * published but withheld. Absence is modelled as absence: these were once
   * the literal string 'Pending confirmation', and the office page decided
   * what to render by comparing against that string — so rewording the
   * placeholder would have published "Pending confirmation" as every
   * unconfirmed office's telephone number.
   */
  telephone?: string;
  email?: string;
  /** Always known: the seat of government is a matter of record. */
  location: string;
  /** Always known: the Civil Service Commission's standard LGU schedule. */
  hours: string;
  /**
   * True while the record as a whole is unconfirmed with LGU Castilla. It
   * describes provenance, not what to render — the fields above do that,
   * by being present or not.
   */
  isPlaceholder: boolean;
}

export interface MunicipalOffice {
  slug: string;
  name: string;
  category: OfficeCategory;
  shortDescription: string;
  aboutText: string;
  head: OfficeHead;
  services: string[];
  contact: OfficeContact;
  relatedOfficeSlugs: string[];
}
