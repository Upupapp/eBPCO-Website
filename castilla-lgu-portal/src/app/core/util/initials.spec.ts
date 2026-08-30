import { initialsFromName } from './initials';
import { MUNICIPAL_OFFICES } from '../data/offices.data';

describe('initialsFromName', () => {
  // Every shape that actually occurs in offices.data.ts and officials.data.ts.
  it.each([
    ['Gemma H. Arogante', 'GA'], // middle initial
    ['Reynaldo C. Marchan', 'RM'],
    ['Atty. Marilyn D. Valino', 'MV'], // honorific
    ['Dr. Melquiades D. Boque', 'MB'], // honorific
    ['Jesus D. Abitria Jr.', 'JA'], // generational suffix
    ['Edgar D. Ardales Jr.', 'EA'],
    ['Roland A. Cortezano, RSW', 'RC'], // post-nominal after a comma
    ['Gelita Inocencio Arcos, MPA', 'GA'], // post-nominal AND a full middle name
    ['Isagani "Bong" B. Mendoza', 'IM'], // quoted nickname
    ['Jesus "Boy" Agarap', 'JA'],
    ['Loriejane N. Excija', 'LE'],
  ])('reads %j as %j', (name, expected) => {
    expect(initialsFromName(name)).toBe(expected);
  });

  it('degrades rather than throwing on unusual input', () => {
    expect(initialsFromName('Madonna')).toBe('M');
    expect(initialsFromName('  ')).toBe('');
    expect(initialsFromName('Dr.')).toBe('D');
  });

  // The defect this replaced: the avatar rendered position.slice(0, 1), so
  // thirteen of the seventeen named heads showed the M of "Municipal". Assert
  // the population of real heads is genuinely distinguishable now.
  it('gives the real office heads more than one distinct avatar', () => {
    const heads = MUNICIPAL_OFFICES.map((o) => o.head).filter((h) => !h.isPlaceholder);
    expect(heads.length).toBeGreaterThan(10);

    const initials = heads.map((h) => h.initials?.trim() || initialsFromName(h.name));
    const positionLetters = new Set(heads.map((h) => h.position[0]));

    for (const value of initials) expect(value).toMatch(/^[A-Z]{2}$/);
    expect(new Set(initials).size).toBeGreaterThan(positionLetters.size);
  });
});
