# Testing Guide

## Quick Test Commands

### 1. Type Check
```bash
npm run typecheck
```
Should show: **0 errors**

### 2. Build
```bash
npm run build
```
Should create `dist/` folder with:
- `dist/index.html`
- `dist/script.js`
- `dist/style.css`
- `dist/data/` (word lists)
- `dist/cli/index.js`

### 3. Test CLI Tool

#### Basic password:
```bash
./dist/cli/index.js pwd --len 16
```

#### Passphrase:
```bash
./dist/cli/index.js passphrase --words 6
```

#### User IDs:
```bash
./dist/cli/index.js userid --mode cvc --count 5
```

#### JSON output:
```bash
./dist/cli/index.js pwd --len 20 --json
```

#### iCloud passwords:
```bash
./dist/cli/index.js icloud --count 3
```

### 4. Test Web App Locally

#### Option A: Using serve (recommended)
```bash
npm run serve:dist
```
Then open: `http://localhost:3000` (or the URL shown)

#### Option B: Using the custom server
```bash
npm start
```
Then open: `http://localhost:8000`

## What to Test in the Web App

### Password Tab:
- [ ] Generate strong password (default mode)
- [ ] Change length and regenerate
- [ ] Toggle character types (lowercase, uppercase, digits, symbols)
- [ ] Custom symbols input
- [ ] iCloud mode generates password
- [ ] Easy to write mode
- [ ] Easy to say mode
- [ ] Passphrase (Diceware) mode
- [ ] Entropy and crack time display updates
- [ ] Change hardware profile and see crack time update
- [ ] Copy button works
- [ ] Share button generates URL
- [ ] Clear button resets everything

### User ID Tab:
- [ ] Switch to User ID tab
- [ ] Generate CVC user IDs
- [ ] Generate Words user IDs
- [ ] Change settings (syllables, words count, separator)
- [ ] Copy individual user IDs
- [ ] Share button generates URL
- [ ] Reset settings button works

### Share Links:
- [ ] Copy share link from Password tab
- [ ] Open in new tab/window
- [ ] Settings restore correctly
- [ ] Password auto-generates (if `auto=1` in URL)
- [ ] Copy share link from User ID tab
- [ ] Settings restore correctly
- [ ] User IDs auto-generate (if `auto=1` in URL)

### Persistence:
- [ ] Change settings
- [ ] Refresh page
- [ ] Settings are restored
- [ ] Active tab is restored

## Expected Results

✅ **Type check**: 0 errors
✅ **Build**: Creates complete `dist/` folder
✅ **CLI**: All commands work and produce output
✅ **Web app**: Loads, generates passwords/IDs, shows entropy, copy/share work
✅ **Share links**: Restore settings and auto-generate
✅ **Persistence**: Settings saved and restored on reload

## Troubleshooting

### CLI not working?
- Make sure you ran `npm install` and `npm run build`
- Check file is executable: `ls -l dist/cli/index.js`
- Try: `node dist/cli/index.js pwd --len 16`

### Web app not loading?
- Make sure you built: `npm run build`
- Check `dist/` folder exists with files
- Use a local server (not `file://`)
- Check browser console for errors

### Type errors?
- Run `npm run typecheck` to see all errors
- Make sure all TypeScript files are in `src/`
