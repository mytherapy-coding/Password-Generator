# Testing Guide

## Quick Test

Run the automated test script:

```bash
chmod +x test-app.sh
./test-app.sh
```

## Manual Testing Steps

### 1. Build and Typecheck

```bash
# Typecheck (verify TypeScript)
npm run typecheck

# Build the project
npm run build
```

### 2. Test Web App Locally

```bash
# Start local server
npm run serve:dist
```

Then open the URL shown (usually `http://localhost:3000`) in your browser.

### 3. Test CLI Tool

```bash
# Generate a password
node dist/cli/index.js pwd --len 16 --mode strong

# Generate a passphrase
node dist/cli/index.js passphrase --words 6 --sep "-"

# Generate iCloud-style password
node dist/cli/index.js icloud --count 5

# Generate user IDs
node dist/cli/index.js userid --mode cvc --syllables 2 --count 10

# JSON output
node dist/cli/index.js pwd --len 16 --json
```

## Web App Testing Checklist

### Password Tab

- [ ] **Strong Mode**
  - [ ] Generate password with custom length
  - [ ] Toggle character sets (lowercase, uppercase, digits, symbols)
  - [ ] Custom symbols input works
  - [ ] Entropy displays correctly
  - [ ] Crack time estimation shows
  - [ ] Copy button works

- [ ] **Easy Write Mode**
  - [ ] Generates passwords without ambiguous characters
  - [ ] Length input works
  - [ ] Copy button works

- [ ] **Easy Say Mode**
  - [ ] Generates pronounceable passwords
  - [ ] Syllable count works
  - [ ] Copy button works

- [ ] **Passphrase (Diceware) Mode**
  - [ ] Word count selector works
  - [ ] Separator input works
  - [ ] Capitalize option works
  - [ ] Add digits option works
  - [ ] Entropy calculation is correct (wordCount × log2(wordListSize))
  - [ ] Copy button works

- [ ] **iCloud Mode**
  - [ ] Generates iCloud-style passwords
  - [ ] Format is correct (XXXX-XXXX-XXXX-XXXX)
  - [ ] Copy button works

### User ID Tab

- [ ] **CVC Mode**
  - [ ] Syllable count works
  - [ ] Add digits option works
  - [ ] Suffix option works
  - [ ] Max length validation works
  - [ ] Generate multiple IDs works
  - [ ] Copy buttons work for each ID

- [ ] **Words Mode**
  - [ ] Word count selector works
  - [ ] Separator input works
  - [ ] Capitalization options work
  - [ ] Add digits option works
  - [ ] Max length validation works
  - [ ] Generate multiple IDs works
  - [ ] Copy buttons work for each ID

### Share Links

- [ ] **Password Share Link**
  - [ ] Copy share link button works
  - [ ] Share link contains correct parameters
  - [ ] Opening share link restores settings
  - [ ] Share link auto-generates on page load if URL params exist

- [ ] **User ID Share Link**
  - [ ] Copy share link button works
  - [ ] Share link contains correct parameters
  - [ ] Opening share link restores settings

### General UI

- [ ] Tab switching works (Password ↔ User ID)
- [ ] Active tab persists after page reload
- [ ] Toast notifications appear when copying
- [ ] Error messages display correctly
- [ ] Generate button enables/disables based on validation
- [ ] Reset Settings button resets UI correctly

### Data Loading

- [ ] Word lists load correctly (adjs.json, nouns.json, diceware_words.json)
- [ ] No console errors about missing data
- [ ] Passphrase generation uses correct word list

## CLI Testing Checklist

- [ ] `pwd` command generates passwords
- [ ] `passphrase` command generates passphrases
- [ ] `icloud` command generates iCloud-style passwords
- [ ] `userid` command generates user IDs
- [ ] `--json` flag outputs JSON format
- [ ] All options/arguments work correctly
- [ ] Error handling works for invalid inputs

## Browser Compatibility

Test in multiple browsers:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- [ ] Page loads quickly
- [ ] Password generation is instant
- [ ] No lag when switching tabs
- [ ] Word lists load without delay

## Common Issues to Check

1. **CORS errors**: Make sure you're using a local server, not `file://`
2. **Missing word lists**: Verify `dist/data/` contains all JSON files
3. **Module errors**: Check browser console for import errors
4. **TypeScript errors**: Run `npm run typecheck` before building

## Automated Testing (Future)

Consider adding:
- Unit tests for core generators
- Integration tests for web app
- E2E tests with Playwright or Cypress
