/**
 * Validate symbols input
 * @param {string} text - Input text
 * @returns {{ok: boolean, msg?: string, symbols?: string}}
 */
export function validateSymbolsInput(text) {
  if (!text) return { ok: false, msg: "Please enter at least 1 symbol." };
  if (/\s/.test(text)) return { ok: false, msg: "No spaces allowed." };
  if (/[a-zA-Z0-9]/.test(text)) return { ok: false, msg: "Symbols cannot include letters or digits." };

  const unique = [...new Set(text)].join("");
  return unique ? { ok: true, symbols: unique } : { ok: false, msg: "Symbols empty after filtering." };
}

/**
 * Get character set based on options
 * @param {Object} opts - Options
 * @param {boolean} opts.useLower - Use lowercase
 * @param {boolean} opts.useUpper - Use uppercase
 * @param {boolean} opts.useDigits - Use digits
 * @param {boolean} opts.useSymbols - Use symbols
 * @param {string} opts.symbols - Custom symbols string
 * @returns {{ok: boolean, msg?: string, pool?: string}}
 */
export function getCharset(opts) {
  let pool = "";
  if (opts.useLower) pool += "abcdefghijklmnopqrstuvwxyz";
  if (opts.useUpper) pool += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (opts.useDigits) pool += "0123456789";
  if (opts.useSymbols) pool += opts.symbols;

  return pool ? { ok: true, pool } : { ok: false, msg: "Select at least one character type." };
}
