export interface Official {
  name: string;
  position: string;
  office: string;
  initials: string;
  isPlaceholder: boolean;
  // Optional — most officials fall back to an initials avatar; only set
  // this when a real, verified photo of the person is available.
  photoUrl?: string;
}

export interface ProfileField {
  label: string;
  /** Display text, used verbatim wherever the field is rendered plainly. */
  value: string;
  isPlaceholder: boolean;
  /**
   * Set only on fields that are a genuine magnitude, so the home page can
   * count up to them. `count` must be the numeric part of `value` and
   * `countSuffix` the rest, so the animation lands on exactly the string
   * `value` already shows — identifiers like ZIP or PSGC are deliberately
   * left unset, since counting up to a postal code is meaningless.
   */
  count?: number;
  countSuffix?: string;
  /** Decimal places to animate through; defaults to 0. */
  countDecimals?: number;
}
