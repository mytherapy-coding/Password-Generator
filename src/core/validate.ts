import type { ValidateSymbolsResult, CharsetResult } from "./types.js";

/**
 * Validate symbols input
 */
export function validateSymbolsInput(text: string): ValidateSymbolsResult {
  if (!text) return { ok: false, msg: "Please enter at least 1 symbol." };
  if (/\s/.test(text)) return { ok: false, msg: "No spaces allowed." };
  if (/[a-zA-Z0-9]/.test(text)) return { ok: false, msg: "Symbols cannot include letters or digits." };

  const unique = [...new Set(text)].join("");
  return unique ? { ok: true, symbols: unique } : { ok: false, msg: "Symbols empty after filtering." };
}

export interface CharsetOptions {
  useLower: boolean;
  useUpper: boolean;
  useDigits: boolean;
  useSymbols: boolean;
  symbols: string;
}

/**
 * Get character set based on options
 */
export function getCharset(opts: CharsetOptions): CharsetResult {
  let pool = "";
  if (opts.useLower) pool += "abcdefghijklmnopqrstuvwxyz";
  if (opts.useUpper) pool += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (opts.useDigits) pool += "0123456789";
  if (opts.useSymbols) pool += opts.symbols;

  return pool ? { ok: true, pool } : { ok: false, msg: "Select at least one character type." };
}
