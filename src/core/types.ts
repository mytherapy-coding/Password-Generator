/**
 * Type definitions for the password generator
 */

export type RandomIntFunction = (max: number) => number;

export type PasswordMode = "strong" | "icloud" | "passphrase" | "easyWrite" | "easySay";

export interface PasswordConfig {
  mode: PasswordMode;
  length?: number;          // strong/easyWrite
  includeUpper?: boolean;   // strong
  includeLower?: boolean;   // strong
  includeDigits?: boolean;  // strong/easySay
  includeSymbols?: boolean; // strong
  symset?: string;          // strong (custom symbols)
  words?: number;           // passphrase (diceware)
  separator?: string;       // passphrase (diceware)
  capitalize?: boolean;     // passphrase
  addDigits?: boolean;      // passphrase/easySay
  syllables?: number;       // easySay
}

export interface UserIdConfig {
  mode: "cvc" | "words";
  maxLength: number;
  words?: number;           // words mode
  separator?: string;       // words mode
  capitalization?: "lower" | "title" | "upper";
  syllables?: number;       // cvc mode
  addDigits?: boolean;      // both modes
  digitsCount?: number;     // both modes
  addSuffix?: boolean;      // cvc mode
  suffix?: string;          // cvc mode
}

export interface PasswordResult {
  value: string;
  entropy: number;
  crackTime: Record<string, number>;
}

export interface EntropyResult {
  bits: number;
  combinations: string; // keep as string for huge numbers
}

export type HardwareProfile =
  | "cpu"
  | "rtx4090"
  | "rig8x4090"
  | "datacenter";

// Legacy interfaces for backward compatibility
export interface DicewareConfig {
  wordCount: number;
  separator: string;
  capitalize: boolean;
  addDigits: boolean;
}

export interface CvcIdOptions {
  syllables: number;
  addDigits: boolean;
  digitsCount: number;
  addSuffix: boolean;
  suffix: string;
  maxLength: number;
}

export interface WordsIdOptions {
  wordsCount: number;
  separator: string;
  addDigits: boolean;
  digitsCount: number;
  maxLength: number;
}

export interface CharsetResult {
  ok: boolean;
  pool?: string;
  msg?: string;
}

export interface ValidateSymbolsResult {
  ok: boolean;
  symbols?: string;
  msg?: string;
}
