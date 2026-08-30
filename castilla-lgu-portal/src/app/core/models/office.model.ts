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
  telephone: string;
  email: string;
  location: string;
  hours: string;
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
