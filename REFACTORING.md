# Refactoring: Core Library + CLI

This refactoring extracts shared generator logic into a `core/` library that is used by both the web app and a new Node.js CLI tool.

## Architecture

```
password-gen/
├─ core/          # Shared logic (no DOM, no Node-only code)
├─ js/            # Web-only code (DOM, UI, localStorage)
├─ cli/           # CLI-only code (Node.js)
└─ data/          # JSON data files (shared)
```

## Key Principles

1. **Separation of Concerns**: Core logic is environment-agnostic
2. **Randomness Abstraction**: Generators accept a `randomInt` function (dependency injection)
3. **No Duplication**: All generation logic lives in `core/`
4. **Structured Output**: Generators return `{value, entropy, crackTime}` objects

## Core Modules

- `core/constants.js` - Character sets and constants
- `core/entropy.js` - Entropy calculation
- `core/crackTime.js` - Crack-time estimation
- `core/validate.js` - Input validation
- `core/password.js` - Random password generation
- `core/icloud.js` - iCloud-style password
- `core/easyWrite.js` - Easy-to-write password
- `core/easySayCvc.js` - Easy-to-say password
- `core/diceware.js` - Diceware passphrase generation
- `core/userid.js` - User ID generation (CVC and Words modes)
- `core/index.js` - Public API re-exports

## Web Modules (js/)

The web app modules need to be extracted from `script.js`. The structure should be:

- `js/random.js` - Browser random provider (crypto.getRandomValues)
- `js/app.js` - Main application logic (handlers, generation orchestration)
- `js/ui.js` - UI updates (toasts, enable/disable controls, crack-time display)
- `js/storage.js` - localStorage save/restore
- `js/share.js` - Share link build/restore via URLSearchParams
- `js/init.js` - DOMContentLoaded boot

## CLI Tool

The CLI (`cli/index.js`) provides:

- `securegen pwd` - Generate passwords
- `securegen passphrase` - Generate Diceware passphrases
- `securegen icloud` - Generate iCloud-style passwords
- `securegen userid` - Generate user IDs

Supports `--json` flag for machine-readable output.

## Next Steps

1. Complete the web module extraction from `script.js`
2. Update `index.html` to use `<script type="module" src="./js/init.js"></script>`
3. Test both web app and CLI
4. Remove old `script.js` file
