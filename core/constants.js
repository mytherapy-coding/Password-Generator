/**
 * Character sets and constants
 */
export const CONSONANTS = "bcdfghjklmnpqrstvwxyz";
export const VOWELS = "aeiouy";
export const DIGITS = "0123456789";

// Unambiguous characters (removed: O, 0, I, l, 1, S, 5, B, 8)
export const UNAMBIGUOUS_LOWERCASE = "abcdefghjkmnpqrtuvwxyz"; // removed: i, l, o, s
export const UNAMBIGUOUS_UPPERCASE = "ABCDEFGHJKMNPQRTUVWXYZ"; // removed: I, O, S, B
export const UNAMBIGUOUS_DIGITS = "234679"; // removed: 0, 1, 5, 8
export const SAFE_SYMBOLS = "-_!@#"; // Default safe symbol set

// Easy to say: unambiguous consonants (removed confusing chars)
export const EASY_SAY_CONSONANTS = "bcdfghjkmnpqrstvwxyz"; // removed: l (confusing with I/1)
