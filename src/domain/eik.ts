const digits = (s: string) => s.split("").map(Number);

function checkDigit(ds: number[], w1: number[], w2: number[]): number {
  let r = ds.reduce((sum, d, i) => sum + d * w1[i], 0) % 11;
  if (r === 10) r = ds.reduce((sum, d, i) => sum + d * w2[i], 0) % 11;
  return r === 10 ? 0 : r;
}

/** Validates a Bulgarian ЕИК/БУЛСТАТ (9 or 13 digits) including the checksum. */
export function isValidEik(eik: string): boolean {
  if (!/^(\d{9}|\d{13})$/.test(eik)) return false;
  const d = digits(eik);
  const nine = checkDigit(
    d.slice(0, 8),
    [1, 2, 3, 4, 5, 6, 7, 8],
    [3, 4, 5, 6, 7, 8, 9, 10],
  );
  if (nine !== d[8]) return false;
  if (eik.length === 9) return true;
  return checkDigit(d.slice(8, 12), [2, 7, 3, 5], [4, 9, 5, 7]) === d[12];
}
