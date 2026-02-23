/**
 * Web app initialization - DOMContentLoaded boot
 */

import { loadWordLists, handleGeneratePassword, handleGenerateUserIds, updateCrackTimeFromSettings, copyToClipboard } from "./app.js";
import { updatePasswordModeUI, updateUserIdModeUI, updateCrackTimeUI, clearPasswordUI, showToast } from "./ui.js";
import { savePasswordSettings, restorePasswordSettings, saveUserIdSettings, restoreUserIdSettings, saveCrackHardwareProfile, restoreCrackHardwareSelection, restoreActiveTab, saveActiveTab } from "./storage.js";
import { buildPasswordShareUrl, buildUserIdShareUrl, restoreSettingsFromURL, clearUrlParams } from "./share.js";
import { CRACK_HARDWARE_PROFILES } from "../core/index.js";

/**
 * Initialize DOM elements
 */
function initElements() {
  return {
    // Password mode controls
    passwordMode: document.getElementById("passwordMode"),
    lengthInput: document.getElementById("length"),
    lowercaseCheckbox: document.getElementById("lowercase"),
    uppercaseCheckbox: document.getElementById("uppercase"),
    digitsCheckbox: document.getElementById("digits"),
    symbolsCheckbox: document.getElementById("symbols"),
    customSymbolsInput: document.getElementById("customSymbols"),
    
    // Mode-specific controls
    strongModeControls: document.getElementById("strongModeControls"),
    easyWriteModeControls: document.getElementById("easyWriteModeControls"),
    easyWriteLength: document.getElementById("easyWriteLength"),
    easySayModeControls: document.getElementById("easySayModeControls"),
    easySaySyllables: document.getElementById("easySaySyllables"),
    easySayAddDigit: document.getElementById("easySayAddDigit"),
    passphraseModeControls: document.getElementById("passphraseModeControls"),
    passphraseWordCount: document.getElementById("passphraseWordCount"),
    passphraseSeparator: document.getElementById("passphraseSeparator"),
    passphraseCapitalize: document.getElementById("passphraseCapitalize"),
    passphraseAddDigits: document.getElementById("passphraseAddDigits"),
    
    // Password output
    passwordInput: document.getElementById("password"),
    strengthLabelEl: document.getElementById("strengthLabel"),
    strengthBarEl: document.getElementById("strengthBar"),
    lengthError: document.getElementById("lengthError"),
    symbolError: document.getElementById("symbolError"),
    copyError: document.getElementById("copyError"),
    
    // Buttons
    generateBtn: document.getElementById("generate"),
    clearBtn: document.getElementById("clear"),
    copyBtn: document.getElementById("copy"),
    shareBtn: document.getElementById("share"),
    
    // Crack time
    crackTimeContainer: document.getElementById("crackTimeContainer"),
    crackHardwareSelect: document.getElementById("crackHardware"),
    crackTimeValue: document.getElementById("crackTimeValue"),
    crackTimeWarning: document.getElementById("crackTimeWarning"),
    
    // User ID controls
    uidMode: document.getElementById("uidMode"),
    uidCvcControls: document.getElementById("uidCvcControls"),
    uidWordsControls: document.getElementById("uidWordsControls"),
    uidSyllables: document.getElementById("uidSyllables"),
    uidAddDigits: document.getElementById("uidAddDigits"),
    uidDigitsCount: document.getElementById("uidDigitsCount"),
    uidAddSuffix: document.getElementById("uidAddSuffix"),
    uidSuffix: document.getElementById("uidSuffix"),
    uidMaxLength: document.getElementById("uidMaxLength"),
    uidWordsCount: document.getElementById("uidWordsCount"),
    uidWordsSeparator: document.getElementById("uidWordsSeparator"),
    uidWordsAddDigits: document.getElementById("uidWordsAddDigits"),
    uidWordsDigitsCount: document.getElementById("uidWordsDigitsCount"),
    uidWordsMaxLength: document.getElementById("uidWordsMaxLength"),
    uidCount: document.getElementById("uidCount"),
    uidGenerateBtn: document.getElementById("uidGenerateBtn"),
    uidShareBtn: document.getElementById("uidShare"),
    resetUserIdSettingsBtn: document.getElementById("resetUserIdSettings"),
    uidError: document.getElementById("uidError"),
    uidResults: document.getElementById("uidResults")
  };
}

/**
 * Setup event listeners
 */
function setupEventListeners(elements, wordLists) {
  console.log("Setting up event listeners...");
  
  // Tab switching - use event delegation for reliability
  const tabsContainer = document.querySelector(".tabs");
  if (tabsContainer) {
    console.log("Tabs container found, attaching click listener");
    tabsContainer.addEventListener("click", (e) => {
      console.log("Tab container clicked, target:", e.target);
      const tab = e.target.closest(".tab");
      if (!tab) {
        console.log("Click was not on a tab");
        return;
      }
      
      e.preventDefault();
      e.stopPropagation();
      
      const tabId = tab.dataset.tab;
      if (!tabId) {
        console.error("Tab missing data-tab attribute");
        return;
      }
      
      console.log("Switching to tab:", tabId);
      
      // Remove active class from all tabs and content
      document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
      document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));

      // Activate clicked tab
      tab.classList.add("active");
      
      // Activate corresponding content
      const contentEl = document.getElementById(tabId);
      if (contentEl) {
        contentEl.classList.add("active");
        console.log("Tab switched successfully to:", tabId);
      } else {
        console.error("Content element not found for tab:", tabId);
      }
      
      // Save active tab
      saveActiveTab(tabId);
    });
  } else {
    console.error("Tabs container not found!");
  }

  // Password generation
  if (elements.generateBtn) {
    console.log("Generate button found, attaching listener");
    elements.generateBtn.addEventListener("click", (e) => {
      console.log("Generate button clicked");
      e.preventDefault();
      e.stopPropagation();
      try {
        handleGeneratePassword(elements, wordLists, () => updateCrackTimeFromSettings(elements, wordLists));
      } catch (error) {
        console.error("Error generating password:", error);
        alert("Error generating password: " + error.message);
      }
    });
  } else {
    console.error("Generate button not found!");
  }

  if (elements.clearBtn) {
    elements.clearBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      clearPasswordUI(elements);
    });
  } else {
    console.error("Clear button not found!");
  }

  if (elements.copyBtn) {
    elements.copyBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (!(await copyToClipboard(elements.passwordInput?.value || ""))) {
        if (elements.copyError) elements.copyError.textContent = "Copy failed.";
      }
    });
  } else {
    console.error("Copy button not found!");
  }

  // Password settings change handlers
  [
    elements.lengthInput,
    elements.lowercaseCheckbox,
    elements.uppercaseCheckbox,
    elements.digitsCheckbox,
    elements.symbolsCheckbox
  ].forEach((el) => {
    if (el) {
      el.addEventListener("change", () => {
        savePasswordSettings(elements);
        updateCrackTimeFromSettings(elements, wordLists);
      });
    }
  });

  if (elements.customSymbolsInput) {
    elements.customSymbolsInput.addEventListener("input", () => {
      savePasswordSettings(elements);
      updateCrackTimeFromSettings(elements, wordLists);
    });
  }

  if (elements.passwordMode) {
    elements.passwordMode.addEventListener("change", () => {
      updatePasswordModeUI(elements);
      savePasswordSettings(elements);
      updateCrackTimeFromSettings(elements, wordLists);
    });
  }

  // Easy mode controls
  if (elements.easyWriteLength) {
    elements.easyWriteLength.addEventListener("change", () => {
      savePasswordSettings(elements);
      updateCrackTimeFromSettings(elements, wordLists);
    });
  }

  if (elements.easySaySyllables) {
    elements.easySaySyllables.addEventListener("change", () => {
      savePasswordSettings(elements);
      updateCrackTimeFromSettings(elements, wordLists);
    });
  }

  if (elements.easySayAddDigit) {
    elements.easySayAddDigit.addEventListener("change", () => {
      savePasswordSettings(elements);
      updateCrackTimeFromSettings(elements, wordLists);
    });
  }

  // Passphrase controls
  if (elements.passphraseWordCount) {
    elements.passphraseWordCount.addEventListener("change", () => {
      savePasswordSettings(elements);
      updateCrackTimeFromSettings(elements, wordLists);
    });
  }

  if (elements.passphraseSeparator) {
    elements.passphraseSeparator.addEventListener("change", () => {
      savePasswordSettings(elements);
      updateCrackTimeFromSettings(elements, wordLists);
    });
  }

  if (elements.passphraseCapitalize) {
    elements.passphraseCapitalize.addEventListener("change", () => {
      savePasswordSettings(elements);
      updateCrackTimeFromSettings(elements, wordLists);
    });
  }

  if (elements.passphraseAddDigits) {
    elements.passphraseAddDigits.addEventListener("change", () => {
      savePasswordSettings(elements);
      updateCrackTimeFromSettings(elements, wordLists);
    });
  }

  // User ID controls
  if (elements.uidMode) {
    elements.uidMode.addEventListener("change", () => {
      updateUserIdModeUI(elements);
      saveUserIdSettings(elements);
    });
  }

  if (elements.uidGenerateBtn) {
    elements.uidGenerateBtn.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      handleGenerateUserIds(elements, wordLists);
    });
  } else {
    console.error("User ID Generate button not found!");
  }

  [
    elements.uidSyllables,
    elements.uidAddDigits,
    elements.uidDigitsCount,
    elements.uidAddSuffix,
    elements.uidSuffix,
    elements.uidMaxLength,
    elements.uidWordsCount,
    elements.uidWordsSeparator,
    elements.uidWordsAddDigits,
    elements.uidWordsDigitsCount,
    elements.uidWordsMaxLength,
    elements.uidCount
  ].forEach((el) => {
    if (el) {
      el.addEventListener("change", () => {
        saveUserIdSettings(elements);
      });
    }
  });

  // Share buttons
  if (elements.shareBtn) {
    elements.shareBtn.addEventListener("click", async () => {
      const url = buildPasswordShareUrl(elements);
      try {
        await navigator.clipboard.writeText(url);
        showToast("Share link copied!");
      } catch {
        showToast("Failed to copy link");
      }
    });
  }

  if (elements.uidShareBtn) {
    elements.uidShareBtn.addEventListener("click", async () => {
      const url = buildUserIdShareUrl(elements);
      try {
        await navigator.clipboard.writeText(url);
        showToast("Share link copied!");
      } catch {
        showToast("Failed to copy link");
      }
    });
  }

  // Reset user ID settings
  if (elements.resetUserIdSettingsBtn) {
    elements.resetUserIdSettingsBtn.addEventListener("click", () => {
      try {
        localStorage.removeItem("userIdSettings");
      } catch {
        // ignore
      }

      if (elements.uidMode) elements.uidMode.value = "cvc";
      if (elements.uidSyllables) elements.uidSyllables.value = "2";
      if (elements.uidAddDigits) elements.uidAddDigits.checked = true;
      if (elements.uidDigitsCount) elements.uidDigitsCount.value = "2";
      if (elements.uidAddSuffix) elements.uidAddSuffix.checked = true;
      if (elements.uidSuffix) elements.uidSuffix.value = "dev";
      if (elements.uidMaxLength) elements.uidMaxLength.value = "15";
      if (elements.uidWordsCount) elements.uidWordsCount.value = "2";
      if (elements.uidWordsSeparator) elements.uidWordsSeparator.value = "_";
      if (elements.uidWordsAddDigits) elements.uidWordsAddDigits.checked = false;
      if (elements.uidWordsDigitsCount) elements.uidWordsDigitsCount.value = "2";
      if (elements.uidWordsMaxLength) elements.uidWordsMaxLength.value = "20";
      if (elements.uidCount) elements.uidCount.value = "10";

      updateUserIdModeUI(elements);
      if (elements.uidResults) elements.uidResults.innerHTML = "";
      if (elements.uidError) elements.uidError.textContent = "";
    });
  }

  // Crack hardware selection
  if (elements.crackHardwareSelect) {
    elements.crackHardwareSelect.addEventListener("change", () => {
      saveCrackHardwareProfile(elements.crackHardwareSelect.value);
      updateCrackTimeFromSettings(elements, wordLists);
    });
  }
}

/**
 * Initialize application
 */
async function init() {
  try {
    console.log("Initializing application...");
    
    // Initialize DOM elements
    const elements = initElements();
    console.log("Elements initialized:", Object.keys(elements).length, "elements found");
    
    // Load word lists
    console.log("Loading word lists...");
    const wordLists = await loadWordLists();
    console.log("Word lists loaded:", {
      loaded: wordLists.loaded,
      diceware: wordLists.diceware?.length || 0,
      adjectives: wordLists.adjectives?.length || 0,
      nouns: wordLists.nouns?.length || 0
    });
    
    // Setup event listeners
    console.log("Setting up event listeners...");
    setupEventListeners(elements, wordLists);
    console.log("Event listeners set up successfully");
  
    // Restore settings
    const urlParamsRestored = restoreSettingsFromURL(
      elements,
      () => updatePasswordModeUI(elements),
      () => updateUserIdModeUI(elements),
      () => handleGeneratePassword(elements, wordLists, () => updateCrackTimeFromSettings(elements, wordLists)),
      () => handleGenerateUserIds(elements, wordLists)
    );
    
    if (!urlParamsRestored) {
      restorePasswordSettings(elements);
      restoreUserIdSettings(elements, () => updateUserIdModeUI(elements));
      restoreCrackHardwareSelection(elements, CRACK_HARDWARE_PROFILES);
      restoreActiveTab();
      updatePasswordModeUI(elements);
      updateUserIdModeUI(elements);
    } else {
      // URL params were restored, but still restore hardware selection from localStorage if not in URL
      const urlParams = new URLSearchParams(window.location.search);
      if (!urlParams.has("hw")) {
        restoreCrackHardwareSelection(elements, CRACK_HARDWARE_PROFILES);
      }
    }
    
    // Recompute crack time after restoring settings
    setTimeout(() => {
      updateCrackTimeFromSettings(elements, wordLists);
      if (urlParamsRestored) {
        clearUrlParams();
      }
    }, 100);
    
    console.log("Application initialized successfully!");
  } catch (error) {
    console.error("Error initializing application:", error);
    alert("Error loading application: " + error.message + "\n\nCheck the browser console for details.");
  }
}

// Boot when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
