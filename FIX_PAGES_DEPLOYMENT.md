# Fix GitHub Pages Deployment Issue

## Problem
GitHub Pages is deploying from the branch (serving old JS files) instead of using the GitHub Actions workflow that builds `dist/`.

## Solution

### Step 1: Verify GitHub Pages Source

1. Go to: `https://github.com/mytherapy-coding/Password-Generator/settings/pages`
2. Under **"Build and deployment"** → **"Source"**
3. Make sure it says: **"GitHub Actions"** (NOT "Deploy from a branch")
4. If it's set to a branch (like `/root` or `/main`), change it to **"GitHub Actions"**
5. Click **Save**

### Step 2: Verify Workflow is Running

1. Go to: `https://github.com/mytherapy-coding/Password-Generator/actions`
2. Check if the workflow "Build and Deploy to GitHub Pages" has run
3. If it failed, check the error messages
4. The workflow should complete with a green checkmark

### Step 3: Check Workflow Output

The workflow should:
- ✅ Run `npm ci` (install dependencies)
- ✅ Run `npm run typecheck` (TypeScript check)
- ✅ Run `npm run build` (build to `dist/`)
- ✅ Upload `dist/` as artifact
- ✅ Deploy to GitHub Pages

### Step 4: Clear Cache

After changing the source to GitHub Actions:
1. Wait 2-3 minutes for the workflow to complete
2. Clear your browser cache
3. Visit: `https://mytherapy-coding.github.io/Password-Generator/`
4. Hard refresh: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+R` (Windows)

## Why This Happens

- **Old setup**: GitHub Pages was deploying directly from the `main` branch
  - Served: `index.html`, `script.js`, `js/`, `core/` (old JS files)
  
- **New setup**: GitHub Actions workflow builds TypeScript → JavaScript in `dist/`
  - Should serve: `dist/index.html`, `dist/script.js` (built files)

## Verification

After fixing, verify the deployed site uses the built files:

1. Open browser DevTools (F12)
2. Go to Network tab
3. Refresh the page
4. Check that `script.js` is loaded from the root (not from old paths)
5. The file should be the bundled version from `dist/script.js`

## If Still Not Working

1. **Check workflow permissions**:
   - Settings → Actions → General
   - Workflow permissions: "Read and write permissions"
   
2. **Manually trigger workflow**:
   - Actions → "Build and Deploy to GitHub Pages" → Run workflow

3. **Check for errors in workflow logs**:
   - Actions → Click on the workflow run → Check each step

4. **Verify `dist/` folder structure**:
   - The workflow should create `dist/` with:
     - `index.html`
     - `script.js`
     - `style.css`
     - `data/` folder
     - `cli/index.js`
