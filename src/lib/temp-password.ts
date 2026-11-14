import { randomInt } from "node:crypto";

// No look-alike characters (0/O, 1/l/I) so the password is easy to read out or type.
const ALPHABET = "abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Random temporary password (cryptographically secure), shown once to the admin. */
export function generateTempPassword(length = 12): string {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[randomInt(ALPHABET.length)];
  return out;
}
