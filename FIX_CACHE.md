# Fix Browser Cache Issue

## The Problem
Your browser is showing the old "Clear" button instead of "Reset Settings" because it's caching the old HTML/JS files.

## Solution 1: Hard Refresh (Try This First)

**Mac:**
- `Cmd + Shift + R`
- Or `Cmd + Option + R`

**Windows/Linux:**
- `Ctrl + Shift + R`
- Or `Ctrl + F5`

## Solution 2: Clear Browser Cache Completely

### Chrome/Edge:
1. Press `F12` to open DevTools
2. Right-click the refresh button (next to address bar)
3. Select "Empty Cache and Hard Reload"

### Firefox:
1. Press `F12` to open DevTools
2. Go to Network tab
3. Check "Disable cache"
4. Refresh the page

### Safari:
1. Press `Cmd + Option + E` to empty cache
2. Then refresh

## Solution 3: Clear Site Data

1. Open DevTools (F12)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Clear site data** or **Clear storage**
4. Refresh the page

## Solution 4: Use Incognito/Private Mode

1. Open a new incognito/private window
2. Navigate to your local server URL
3. This bypasses all cache

## Solution 5: Verify You're Viewing the Right File

Make sure you're serving from `dist/`:

```bash
npm run serve:dist
```

Then open: `http://localhost:3000` (or the URL shown)

**DO NOT** open `index.html` directly from the file system (file://) - always use a local server.

## Verify the Fix

After clearing cache, you should see:
- ✅ **Generate** (light gray button)
- ✅ **Share** (light gray button)  
- ✅ **Reset Settings** (dark gray/blue button)

Both Password and User ID tabs should have the same button order.

## If Still Not Working

1. Close the browser completely
2. Reopen it
3. Navigate to your local server
4. Do a hard refresh

The files are correct - this is 100% a browser cache issue.
