/**
 * Type definitions for the password generator
 */

export type RandomIntFunction = (max: number) => number;

export interface PasswordConfig {
  length: number;
  charset: string;
}

export interface PasswordResult {
  value: string;
  entropy: number;
  crackTime: Record<string, number>;
}

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

export type HardwareProfile = "cpu" | "rtx4090" | "rig8x4090" | "datacenter";

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
