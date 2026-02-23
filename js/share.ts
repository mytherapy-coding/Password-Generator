/**
 * Share link build/restore via URLSearchParams
 */

import type { AppElements } from "./types.js";

/**
 * Helper: Get boolean from URL param (1/0)
 */
function getBool(p: URLSearchParams, key: string, defaultVal: boolean = false): boolean {
  const v = p.get(key);
  if (v === "1") return true;
  if (v === "0") return false;
  return defaultVal;
}

/**
 * Helper: Get integer from URL param with validation
 */
function getInt(p: URLSearchParams, key: string, min: number, max: number, defaultVal: number): number {
  const n = Number(p.get(key));
  if (!Number.isFinite(n)) return defaultVal;
  if (n < min || n > max) return defaultVal;
  return Math.floor(n);
}

/**
 * Build share URL for password generator with short parameter keys
 */
export function buildPasswordShareUrl(elements: AppElements): string {
  const url = new URL(window.location.href);
  url.search = "";
  const p = url.searchParams;
  
  p.set("gen", "pwd");
  
  // Determine mode
  let mode = elements.passwordMode?.value ?? "strong";
  if (mode === "easyWrite") {
    mode = "easywrite";
  } else if (mode === "easySay") {
    mode = "easysay";
  } else if (mode === "passphrase") {
    mode = "passphrase";
  }
  p.set("mode", mode);
  
  // Length (mode-specific)
  if (mode === "easywrite") {
    p.set("len", String(elements.easyWriteLength?.value ?? "16"));
  } else if (mode === "easysay") {
    p.set("sy", String(elements.easySaySyllables?.value ?? "5"));
    p.set("dig", elements.easySayAddDigit?.checked ? "1" : "0");
  } else if (mode === "passphrase") {
    p.set("wc", String(elements.passphraseWordCount?.value ?? "6"));
    const sep = elements.passphraseSeparator?.value ?? " ";
    if (sep === " ") {
      p.set("sep", "space");
    } else {
      p.set("sep", sep);
    }
    p.set("cap", elements.passphraseCapitalize?.checked ? "1" : "0");
    p.set("dig", elements.passphraseAddDigits?.checked ? "1" : "0");
  } else if (mode !== "icloud") {
    // Strong mode
    p.set("len", String(elements.lengthInput?.value ?? "12"));
    p.set("low", elements.lowercaseCheckbox?.checked ? "1" : "0");
    p.set("up", elements.uppercaseCheckbox?.checked ? "1" : "0");
    p.set("dig", elements.digitsCheckbox?.checked ? "1" : "0");
    p.set("sym", elements.symbolsCheckbox?.checked ? "1" : "0");
    
    // Custom symbols set
    if (elements.symbolsCheckbox?.checked && elements.customSymbolsInput?.value) {
      const symset = elements.customSymbolsInput.value.trim();
      if (symset.length > 0 && symset.length <= 50) {
        p.set("symset", symset);
      }
    }
  }
  
  // Hardware profile (map to short keys)
  const hwMap: Record<string, string> = {
    "cpu": "cpu",
    "rtx4090": "4090",
    "rig8x4090": "rig8",
    "datacenter": "dc"
  };
  const hw = elements.crackHardwareSelect?.value ?? "cpu";
  if (hwMap[hw]) {
    p.set("hw", hwMap[hw]);
  }
  
  p.set("auto", "1");
  
  return url.toString();
}

/**
 * Build share URL for User ID generator with short parameter keys
 */
export function buildUserIdShareUrl(elements: AppElements): string {
  const url = new URL(window.location.href);
  url.search = "";
  const p = url.searchParams;
  
  p.set("gen", "uid");
  p.set("mode", elements.uidMode?.value ?? "cvc");
  p.set("cnt", String(elements.uidCount?.value ?? "10"));
  
  if (elements.uidMode?.value === "cvc") {
    p.set("sy", String(elements.uidSyllables?.value ?? "2"));
    p.set("max", String(elements.uidMaxLength?.value ?? "15"));
    p.set("dig", elements.uidAddDigits?.checked ? String(elements.uidDigitsCount?.value ?? "2") : "0");
    if (elements.uidAddSuffix?.checked && elements.uidSuffix?.value) {
      p.set("suf", elements.uidSuffix.value);
    }
  } else {
    // words mode
    p.set("wc", String(elements.uidWordsCount?.value ?? "2"));
    p.set("sep", elements.uidWordsSeparator?.value ?? "_");
    p.set("max", String(elements.uidWordsMaxLength?.value ?? "20"));
    p.set("dig", elements.uidWordsAddDigits?.checked ? String(elements.uidWordsDigitsCount?.value ?? "2") : "0");
  }
  
  p.set("auto", "1");
  
  return url.toString();
}

/**
 * Parse URL parameters and restore settings (with validation)
 */
export function restoreSettingsFromURL(
  elements: AppElements,
  updatePasswordModeUI: () => void,
  updateUserIdModeUI: () => void,
  handleGeneratePassword: () => void,
  handleGenerateUserIds: () => void
): boolean {
  const params = new URLSearchParams(window.location.search);
  
  if (params.toString() === "") return false;
  
  const gen = params.get("gen");
  if (!gen || (gen !== "pwd" && gen !== "uid")) return false;
  
  if (gen === "pwd") {
    // Restore password settings
    const mode = params.get("mode");
    if (mode && elements.passwordMode) {
      if (mode === "icloud") {
        elements.passwordMode.value = "icloud";
      } else if (mode === "easywrite") {
        elements.passwordMode.value = "easyWrite";
      } else if (mode === "easysay") {
        elements.passwordMode.value = "easySay";
      } else if (mode === "passphrase") {
        elements.passwordMode.value = "passphrase";
      } else if (mode === "strong") {
        elements.passwordMode.value = "strong";
      }
    }
    
    // Mode-specific settings
    if (mode === "easywrite" && elements.easyWriteLength) {
      const len = getInt(params, "len", 8, 64, 16);
      elements.easyWriteLength.value = String(len);
    } else if (mode === "easysay") {
      if (elements.easySaySyllables) {
        const sy = getInt(params, "sy", 4, 6, 5);
        elements.easySaySyllables.value = String(sy);
      }
      if (elements.easySayAddDigit) {
        elements.easySayAddDigit.checked = getBool(params, "dig", true);
      }
    } else if (mode === "passphrase") {
      if (elements.passphraseWordCount) {
        const wc = getInt(params, "wc", 4, 8, 6);
        elements.passphraseWordCount.value = String(wc);
      }
      const sep = params.get("sep");
      if (sep && elements.passphraseSeparator) {
        if (sep === "space") {
          elements.passphraseSeparator.value = " ";
        } else if (["-", "_"].includes(sep)) {
          elements.passphraseSeparator.value = sep;
        }
      }
      if (elements.passphraseCapitalize) {
        elements.passphraseCapitalize.checked = getBool(params, "cap", false);
      }
      if (elements.passphraseAddDigits) {
        elements.passphraseAddDigits.checked = getBool(params, "dig", false);
      }
    } else if (mode !== "icloud") {
      // Strong mode
      if (elements.lengthInput) {
        const len = getInt(params, "len", 4, 64, 16);
        elements.lengthInput.value = String(len);
      }
      if (elements.lowercaseCheckbox) elements.lowercaseCheckbox.checked = getBool(params, "low", true);
      if (elements.uppercaseCheckbox) elements.uppercaseCheckbox.checked = getBool(params, "up", true);
      if (elements.digitsCheckbox) elements.digitsCheckbox.checked = getBool(params, "dig", true);
      if (elements.symbolsCheckbox) elements.symbolsCheckbox.checked = getBool(params, "sym", false);
      
      const symset = params.get("symset");
      if (symset != null && symset.length > 0 && symset.length <= 50 && elements.customSymbolsInput) {
        elements.customSymbolsInput.value = symset;
      }
    }
    
    // Hardware profile
    const hwMap: Record<string, string> = {
      "cpu": "cpu",
      "4090": "rtx4090",
      "rig8": "rig8x4090",
      "dc": "datacenter"
    };
    const hw = params.get("hw");
    if (hw && hwMap[hw] && elements.crackHardwareSelect) {
      elements.crackHardwareSelect.value = hwMap[hw];
    }
    
    updatePasswordModeUI();
    
    // Switch to password tab
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
    const tabEl = document.querySelector('[data-tab="passwordTab"]');
    const contentEl = document.getElementById("passwordTab");
    if (tabEl) tabEl.classList.add("active");
    if (contentEl) contentEl.classList.add("active");
    
    // Auto-generate if requested
    if (params.get("auto") === "1") {
      setTimeout(() => {
        handleGeneratePassword();
      }, 100);
    }
    
    return true;
  } else if (gen === "uid") {
    // Restore User ID settings
    const mode = params.get("mode");
    if (mode && (mode === "cvc" || mode === "words") && elements.uidMode) {
      elements.uidMode.value = mode;
    }
    
    updateUserIdModeUI();
    
    // Common settings
    if (elements.uidCount) {
      const cnt = getInt(params, "cnt", 5, 50, 10);
      elements.uidCount.value = String(cnt);
    }
    
    if (elements.uidMode && elements.uidMode.value === "cvc") {
      if (elements.uidSyllables) {
        const sy = getInt(params, "sy", 2, 3, 2);
        elements.uidSyllables.value = String(sy);
      }
      if (elements.uidMaxLength) {
        const max = getInt(params, "max", 6, 24, 15);
        elements.uidMaxLength.value = String(max);
      }
      const dig = getInt(params, "dig", 0, 3, 0);
      if (dig > 0) {
        if (elements.uidAddDigits) elements.uidAddDigits.checked = true;
        if (elements.uidDigitsCount) elements.uidDigitsCount.value = String(dig);
      } else {
        if (elements.uidAddDigits) elements.uidAddDigits.checked = false;
      }
      const suf = params.get("suf");
      if (suf != null && suf.length > 0) {
        if (elements.uidAddSuffix) elements.uidAddSuffix.checked = true;
        if (elements.uidSuffix) elements.uidSuffix.value = suf;
      } else {
        if (elements.uidAddSuffix) elements.uidAddSuffix.checked = false;
      }
    } else {
      // words mode
      if (elements.uidWordsCount) {
        const wc = getInt(params, "wc", 2, 3, 2);
        elements.uidWordsCount.value = String(wc);
      }
      const sep = params.get("sep");
      if (sep && ["_", ".", "-", "none"].includes(sep) && elements.uidWordsSeparator) {
        elements.uidWordsSeparator.value = sep;
      }
      if (elements.uidWordsMaxLength) {
        const max = getInt(params, "max", 8, 30, 20);
        elements.uidWordsMaxLength.value = String(max);
      }
      const dig = getInt(params, "dig", 0, 3, 0);
      if (dig > 0) {
        if (elements.uidWordsAddDigits) elements.uidWordsAddDigits.checked = true;
        if (elements.uidWordsDigitsCount) elements.uidWordsDigitsCount.value = String(dig);
      } else {
        if (elements.uidWordsAddDigits) elements.uidWordsAddDigits.checked = false;
      }
    }
    
    // Switch to User ID tab
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
    const tabEl = document.querySelector('[data-tab="userIdTab"]');
    const contentEl = document.getElementById("userIdTab");
    if (tabEl) tabEl.classList.add("active");
    if (contentEl) contentEl.classList.add("active");
    
    // Auto-generate if requested
    if (params.get("auto") === "1") {
      setTimeout(() => {
        handleGenerateUserIds();
      }, 100);
    }
    
    return true;
  }
  
  return false;
}

/**
 * Clean URL parameters (nice UX)
 */
export function clearUrlParams(): void {
  const url = new URL(window.location.href);
  url.search = "";
  history.replaceState({}, "", url.toString());
}
