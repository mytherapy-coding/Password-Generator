# Removed Old JavaScript Files

All JavaScript files that were converted to TypeScript have been removed.

## Removed Files

### CLI (`cli/`)
- ✅ `cli/index.js` → Now uses `cli/index.ts`
- ✅ `cli/output.js` → Now uses `cli/output.ts`
- ✅ `cli/parseArgs.js` → Now uses `cli/parseArgs.ts`
- ✅ `cli/random.js` → Now uses `cli/random.ts`

### Core (`core/`)
- ✅ `core/constants.js` → Now uses `src/core/constants.ts`
- ✅ `core/crackTime.js` → Now uses `src/core/crackTime.ts`
- ✅ `core/diceware.js` → Now uses `src/core/diceware.ts`
- ✅ `core/easySayCvc.js` → Now uses `src/core/easySayCvc.ts`
- ✅ `core/easyWrite.js` → Now uses `src/core/easyWrite.ts`
- ✅ `core/entropy.js` → Now uses `src/core/entropy.ts`
- ✅ `core/icloud.js` → Now uses `src/core/icloud.ts`
- ✅ `core/index.js` → Now uses `src/core/index.ts`
- ✅ `core/password.js` → Now uses `src/core/password.ts`
- ✅ `core/userid.js` → Now uses `src/core/userid.ts`
- ✅ `core/validate.js` → Now uses `src/core/validate.ts`

### Web (`js/`)
- ✅ `js/app.js` → Now uses `src/web/app.ts`
- ✅ `js/init.js` → Now uses `src/web/main.ts` (entry point)
- ✅ `js/random.js` → Now uses `src/web/random.ts`
- ✅ `js/share.js` → Now uses `src/web/share.ts`
- ✅ `js/storage.js` → Now uses `src/web/storage.ts`
- ✅ `js/ui.js` → Now uses `src/web/ui.ts`

### Data (`data/`)
- ✅ `data/adjs.js` → Now uses `data/adjs.json`
- ✅ `data/diceware_words.js` → Now uses `data/diceware_words.json`
- ✅ `data/nouns.js` → Now uses `data/nouns.json`

### Root
- ✅ `script.js` → Now built from TypeScript to `dist/script.js`

## Current Structure

All source code is now in TypeScript:
- `src/core/*.ts` - Core logic
- `src/web/*.ts` - Web app code
- `cli/*.ts` - CLI tool code

Build output goes to `dist/`:
- `dist/script.js` - Bundled web app (from TypeScript)
- `dist/cli/index.js` - CLI executable (from TypeScript)
- `dist/index.html` - Updated HTML (references `./script.js`)

## Note

The root `index.html` still references `./script.js` in the source, but the build process:
1. Copies `index.html` to `dist/`
2. Updates the script reference to `./script.js` (which exists in `dist/` after build)
3. The built `dist/script.js` is created from TypeScript sources
