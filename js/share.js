/**
 * Share link functionality (URL parameters)
 */

/**
 * Build share URL for password generator
 */
export function buildPasswordShareUrl(settings, crackHardwareSelect) {
  const url = new URL(window.location.href);
  url.search = ""; // Clear old params
  const p = url.searchParams;
  
  p.set("gen", "pwd");
  
  // Determine mode
  let mode = settings.passwordMode;
  if (settings.icloudPreset) {
    mode = "icloud";
  } else if (mode === "easyWrite") {
    mode = "easywrite";
  } else if (mode === "easySay") {
    mode = "easysay";
  } else if (mode === "passphrase") {
    mode = "passphrase";
  }
  p.set("mode", mode);
  
  // Mode-specific settings
  if (mode === "easywrite") {
    p.set("len", String(settings.easyWriteLength));
  } else if (mode === "easysay") {
    p.set("sy", String(settings.easySaySyllables));
    p.set("dig", settings.easySayAddDigit ? "1" : "0");
  } else if (mode === "passphrase") {
    p.set("wc", String(settings.passphraseWordCount));
    const sep = settings.passphraseSeparator;
    if (sep === " ") {
      p.set("sep", "space");
    } else {
      p.set("sep", sep);
    }
    p.set("cap", settings.passphraseCapitalize ? "1" : "0");
    p.set("dig", settings.passphraseAddDigits ? "1" : "0");
  } else if (mode !== "icloud") {
    // Strong mode
    p.set("len", String(settings.length));
    p.set("low", settings.lowercase ? "1" : "0");
    p.set("up", settings.uppercase ? "1" : "0");
    p.set("dig", settings.digits ? "1" : "0");
    p.set("sym", settings.symbols ? "1" : "0");
    
    // Custom symbols set (URLSearchParams encodes safely)
    if (settings.symbols && settings.customSymbols) {
      const symset = settings.customSymbols.trim();
      if (symset.length > 0 && symset.length <= 50) {
        p.set("symset", symset);
      }
    }
  }
  
  // Hardware profile (map to short keys)
  const hwMap = {
    "cpu": "cpu",
    "rtx4090": "4090",
    "rig8x4090": "rig8",
    "datacenter": "dc"
  };
  const hw = crackHardwareSelect.value;
  if (hwMap[hw]) {
    p.set("hw", hwMap[hw]);
  }
  
  p.set("auto", "1"); // Optional auto-generate
  
  return url.toString();
}

/**
 * Build share URL for User ID generator
 */
export function buildUserIdShareUrl(settings) {
  const url = new URL(window.location.href);
  url.search = ""; // Clear old params
  const p = url.searchParams;
  
  p.set("gen", "uid");
  p.set("mode", settings.mode); // "cvc" or "words"
  p.set("cnt", String(settings.count));
  
  if (settings.mode === "cvc") {
    p.set("sy", String(settings.syllables)); // syllables: 2 or 3
    p.set("max", String(settings.maxLength));
    p.set("dig", settings.addDigits ? String(settings.digitsCount) : "0");
    if (settings.addSuffix && settings.suffix) {
      p.set("suf", settings.suffix);
    }
  } else {
    // words mode
    p.set("wc", String(settings.wordsCount)); // words count: 2 or 3
    p.set("sep", settings.separator); // "_", ".", "-", "none"
    p.set("max", String(settings.wordsMaxLength));
    p.set("dig", settings.wordsAddDigits ? String(settings.wordsDigitsCount) : "0");
  }
  
  p.set("auto", "1"); // Optional auto-generate
  
  return url.toString();
}

/**
 * Copy share URL to clipboard
 */
export async function copyShareUrl(urlString) {
  try {
    await navigator.clipboard.writeText(urlString);
    return true;
  } catch {
    // Fallback: select and copy
    const textarea = document.createElement("textarea");
    textarea.value = urlString;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand("copy");
      document.body.removeChild(textarea);
      return true;
    } catch {
      document.body.removeChild(textarea);
      return false;
    }
  }
}

/**
 * Clean URL parameters (nice UX)
 */
export function clearUrlParams() {
  const url = new URL(window.location.href);
  url.search = "";
  history.replaceState({}, "", url.toString());
}

/**
 * Helper: Get boolean from URL param (1/0)
 */
export function getBool(p, key, defaultVal = false) {
  const v = p.get(key);
  if (v === "1") return true;
  if (v === "0") return false;
  return defaultVal;
}

/**
 * Helper: Get integer from URL param with validation
 */
export function getInt(p, key, min, max, defaultVal) {
  const n = Number(p.get(key));
  if (!Number.isFinite(n)) return defaultVal;
  if (n < min || n > max) return defaultVal;
  return Math.floor(n);
}

/**
 * Restore settings from URL parameters
 */
export function restoreSettingsFromURL(elements, getBool, getInt, CRACK_HARDWARE_PROFILES) {
  const params = new URLSearchParams(window.location.search);
  
  if (params.toString() === "") return false;
  
  const gen = params.get("gen");
  if (!gen || (gen !== "pwd" && gen !== "uid")) return false;
  
  if (gen === "pwd") {
    const mode = params.get("mode");
    if (mode) {
      if (mode === "icloud") {
        elements.icloudPresetCheckbox.checked = true;
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
    
    if (mode === "easywrite") {
      const len = getInt(params, "len", 8, 64, 16);
      elements.easyWriteLength.value = len;
    } else if (mode === "easysay") {
      const sy = getInt(params, "sy", 4, 6, 5);
      elements.easySaySyllables.value = String(sy);
      elements.easySayAddDigit.checked = getBool(params, "dig", true);
    } else if (mode === "passphrase") {
      const wc = getInt(params, "wc", 4, 8, 6);
      elements.passphraseWordCount.value = String(wc);
      const sep = params.get("sep");
      if (sep === "space") {
        elements.passphraseSeparator.value = " ";
      } else if (sep && ["-", "_"].includes(sep)) {
        elements.passphraseSeparator.value = sep;
      }
      elements.passphraseCapitalize.checked = getBool(params, "cap", false);
      elements.passphraseAddDigits.checked = getBool(params, "dig", false);
    } else if (mode !== "icloud") {
      const len = getInt(params, "len", 4, 64, 16);
      elements.lengthInput.value = len;
      elements.lowercaseCheckbox.checked = getBool(params, "low", true);
      elements.uppercaseCheckbox.checked = getBool(params, "up", true);
      elements.digitsCheckbox.checked = getBool(params, "dig", true);
      elements.symbolsCheckbox.checked = getBool(params, "sym", false);
      
      const symset = params.get("symset");
      if (symset != null && symset.length > 0 && symset.length <= 50) {
        elements.customSymbolsInput.value = symset;
      }
    }
    
    const hwMap = {
      "cpu": "cpu",
      "4090": "rtx4090",
      "rig8": "rig8x4090",
      "dc": "datacenter"
    };
    const hw = params.get("hw");
    if (hw && hwMap[hw]) {
      elements.crackHardwareSelect.value = hwMap[hw];
    }
    
    // Switch to password tab
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
    document.querySelector('[data-tab="passwordTab"]').classList.add("active");
    document.getElementById("passwordTab").classList.add("active");
    
    return true;
  } else if (gen === "uid") {
    const mode = params.get("mode");
    if (mode && (mode === "cvc" || mode === "words")) {
      elements.uidMode.value = mode;
    }
    
    const cnt = getInt(params, "cnt", 5, 50, 10);
    elements.uidCount.value = String(cnt);
    
    if (elements.uidMode.value === "cvc") {
      const sy = getInt(params, "sy", 2, 3, 2);
      elements.uidSyllables.value = String(sy);
      const max = getInt(params, "max", 6, 24, 15);
      elements.uidMaxLength.value = max;
      const dig = getInt(params, "dig", 0, 3, 0);
      if (dig > 0) {
        elements.uidAddDigits.checked = true;
        elements.uidDigitsCount.value = String(dig);
      } else {
        elements.uidAddDigits.checked = false;
      }
      const suf = params.get("suf");
      if (suf != null && suf.length > 0) {
        elements.uidAddSuffix.checked = true;
        elements.uidSuffix.value = suf;
      } else {
        elements.uidAddSuffix.checked = false;
      }
    } else {
      const wc = getInt(params, "wc", 2, 3, 2);
      elements.uidWordsCount.value = String(wc);
      const sep = params.get("sep");
      if (sep && ["_", ".", "-", "none"].includes(sep)) {
        elements.uidWordsSeparator.value = sep;
      }
      const max = getInt(params, "max", 8, 30, 20);
      elements.uidWordsMaxLength.value = max;
      const dig = getInt(params, "dig", 0, 3, 0);
      if (dig > 0) {
        elements.uidWordsAddDigits.checked = true;
        elements.uidWordsDigitsCount.value = String(dig);
      } else {
        elements.uidWordsAddDigits.checked = false;
      }
    }
    
    // Switch to User ID tab
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
    document.querySelector('[data-tab="userIdTab"]').classList.add("active");
    document.getElementById("userIdTab").classList.add("active");
    
    return true;
  }
  
  return false;
}
