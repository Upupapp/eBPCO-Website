// Honorifics that precede a name and are never part of it. Matched case-
// insensitively, with or without the trailing period.
const TITLES = new Set(['atty', 'dr', 'hon', 'engr', 'arch', 'ar', 'fr', 'rev', 'ms', 'mr', 'mrs']);

// Generational suffixes. Deliberately does NOT include post-nominal
// qualifications (RSW, MPA, CPA) — those follow a comma and are stripped
// before this set is consulted.
const SUFFIXES = new Set(['jr', 'sr', 'ii', 'iii', 'iv', 'v']);

const strip = (token: string) => token.replace(/[.,]/g, '').toLowerCase();

/**
 * Two-letter initials for an avatar: first letter of the given name, first
 * letter of the family name.
 *
 * Real names here carry four things a naive split gets wrong — an honorific
 * ("Atty. Marilyn D. Valino"), a generational suffix ("Jesus D. Abitria Jr."),
 * a post-nominal qualification after a comma ("Roland A. Cortezano, RSW"),
 * and a quoted nickname ("Isagani \"Bong\" B. Mendoza"). Middle names are
 * dropped whether written in full ("Gelita Inocencio Arcos") or as an
 * initial ("Gemma H. Arogante").
 *
 * Falls back to whatever it can: a single-word name yields one letter, and a
 * name that reduces to nothing yields an empty string rather than throwing.
 */
export function initialsFromName(name: string): string {
  const withoutPostNominals = name.split(',')[0];
  const withoutNickname = withoutPostNominals.replace(/["'“”‘’][^"'“”‘’]*["'“”‘’]/g, ' ');

  let parts = withoutNickname.split(/\s+/).filter(Boolean);

  while (parts.length > 1 && TITLES.has(strip(parts[0]))) parts = parts.slice(1);
  while (parts.length > 1 && SUFFIXES.has(strip(parts[parts.length - 1])))
    parts = parts.slice(0, -1);

  // Middle initials only — a middle name written in full is dropped by taking
  // first and last below, so it needs no special handling here.
  const meaningful = parts.filter((p) => strip(p).length > 1);
  const usable = meaningful.length ? meaningful : parts;
  if (!usable.length) return '';

  const first = usable[0][0] ?? '';
  const last = usable.length > 1 ? (usable[usable.length - 1][0] ?? '') : '';
  return (first + last).toUpperCase();
}
