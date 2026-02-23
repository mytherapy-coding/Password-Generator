# Troubleshooting Guide

## Browser Cache Issues

### Problem: Seeing old buttons (Generate - Clear - Share instead of Generate - Share - Reset Settings)

**Solution 1: Hard Refresh**
- Mac: `Cmd + Shift + R`
- Windows/Linux: `Ctrl + Shift + R`
- Or: `Ctrl + F5`

**Solution 2: Clear Browser Cache Completely**
1. Open Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

**Solution 3: Use Incognito/Private Mode**
1. Open a new incognito/private window
2. Navigate to your local server URL
3. This bypasses all cache

**Solution 4: Verify You're Viewing the Right File**
Make sure you're serving from `dist/`:
```bash
npm run serve:dist
```
Then open the URL shown (usually `http://localhost:3000`)

**DO NOT** open `index.html` directly from the file system (file://) - always use a local server.

## GitHub Pages Deployment Issues

### Problem: GitHub Pages is deploying old JS files instead of built files

**Solution:**
1. Go to: `https://github.com/mytherapy-coding/Password-Generator/settings/pages`
2. Under **"Build and deployment"** → **"Source"**
3. Make sure it says: **"GitHub Actions"** (NOT "Deploy from a branch")
4. Click **Save**

### Problem: Workflow not appearing in GitHub Pages settings

**Solution:**
1. Check the workflow file exists: `.github/workflows/pages.yml`
2. Make sure it's committed and pushed to `main` branch
3. Go to Actions tab and trigger the workflow manually
4. Wait for it to complete, then go back to Settings → Pages

### Problem: Workflow fails

**Check:**
1. Go to Actions tab
2. Click on the failed workflow run
3. Check error messages in logs
4. Common issues:
   - Missing dependencies (run `npm install` locally first)
   - TypeScript errors (run `npm run typecheck` locally)
   - Build errors (run `npm run build` locally)

## Build Issues

### Problem: "Cannot find module" errors

**Solution:**
- Run `npm install` to install dependencies
- Make sure `package.json` has all required dependencies
- Check that `node_modules/` exists

### Problem: TypeScript compilation errors

**Solution:**
- Run `npm run typecheck` to see all errors
- Fix type errors in source files
- Make sure `tsconfig.json` is correct

### Problem: Build output missing files

**Solution:**
- Check `build.mjs` is copying all required files
- Verify `dist/` folder structure after build
- Make sure data files are copied to `dist/data/`

## Runtime Issues

### Problem: CORS errors in browser

**Solution:**
- Always use a local server, never open files directly
- Run `npm run serve:dist` or `npx serve dist`
- Use `http://localhost:XXXX` not `file:///...`

### Problem: Word lists not loading

**Solution:**
- Check that `dist/data/` contains all JSON files
- Verify build process copies data files
- Check browser console for 404 errors

### Problem: Buttons not working

**Solution:**
- Check browser console for JavaScript errors
- Verify `dist/script.js` exists and is loaded
- Make sure you're viewing the built version, not source files

## CLI Issues

### Problem: "Cannot find module" when running CLI

**Solution:**
- Run `npm run build` first
- Check that `dist/cli/index.js` exists
- Make sure you're running from project root

### Problem: "Permission denied" error

**Solution:**
- Run `chmod +x dist/cli/index.js`
- Or use `node dist/cli/index.js` instead of direct execution

## General Issues

### Problem: Changes not appearing after rebuild

**Solution:**
1. Make sure you actually ran `npm run build`
2. Clear browser cache (see Browser Cache Issues above)
3. Verify you're viewing the correct URL
4. Check that `dist/` folder was updated

### Problem: Git issues

**Solution:**
- Make sure you're in the correct directory
- Check `.gitignore` isn't excluding important files
- Verify you have write permissions
