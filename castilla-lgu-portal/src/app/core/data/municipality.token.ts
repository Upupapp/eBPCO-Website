import { InjectionToken } from '@angular/core';
import { ProfileField } from '../models/official.model';
import { PROFILE_FIELDS } from './municipality.data';

/**
 * The municipality's "at a glance" profile fields.
 *
 * Provided through a token rather than imported directly so a test can
 * substitute a different set of figures and assert the page renders what it
 * was given. That substitution is the only thing that proves the numbers are
 * read from the sourced data: a test comparing the rendered value against
 * `PROFILE_FIELDS` passes just as happily when the component carries its own
 * hardcoded copy, because the copy agrees with the data.
 *
 * Production wiring is the default factory below — nothing needs to provide
 * this explicitly.
 */
export const PROFILE_FIELDS_SOURCE = new InjectionToken<ProfileField[]>('PROFILE_FIELDS_SOURCE', {
  providedIn: 'root',
  factory: () => PROFILE_FIELDS,
});
