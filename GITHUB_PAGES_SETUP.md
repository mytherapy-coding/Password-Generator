# GitHub Pages Setup Guide

## Step-by-Step Instructions

### 1. Go to Repository Settings

1. Open your GitHub repository: `https://github.com/mytherapy-coding/Password-Generator`
2. Click on **Settings** (top menu bar)
3. Scroll down to **Pages** in the left sidebar (under "Code and automation")

### 2. Configure Pages Source

1. Under **"Build and deployment"**, find **"Source"**
2. Click the dropdown menu
3. Select **"GitHub Actions"** (NOT "Deploy from a branch")
4. Click **Save** (if there's a save button)

### 3. Verify Workflow File

Make sure you have `.github/workflows/pages.yml` with this content:

```yaml
name: Build and Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install
        run: npm ci

      - name: Typecheck
        run: npm run typecheck

      - name: Build
        run: npm run build

      - name: Configure Pages
        uses: actions/configure-pages@v5

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: github-pages
    steps:
      - name: Deploy
        uses: actions/deploy-pages@v4
```

### 4. Trigger the Workflow

After configuring Pages, you need to trigger the workflow:

**Option A: Push to main branch**
```bash
git add .
git commit -m "Configure GitHub Pages workflow"
git push
```

**Option B: Manual trigger**
1. Go to **Actions** tab in your repository
2. Click on **"Build and Deploy to GitHub Pages"** workflow
3. Click **"Run workflow"** button (top right)
4. Select branch: `main`
5. Click **"Run workflow"**

### 5. Verify Deployment

1. Go to **Actions** tab
2. You should see the workflow running
3. Wait for it to complete (green checkmark)
4. Go back to **Settings → Pages**
5. You should see:
   - **"Your site is live at"** with your URL
   - Usually: `https://mytherapy-coding.github.io/Password-Generator/`

### 6. Check Your Site

Visit your GitHub Pages URL:
- `https://mytherapy-coding.github.io/Password-Generator/`

## Troubleshooting

### Workflow Not Running

- Make sure `.github/workflows/pages.yml` exists
- Check that you've pushed to the `main` branch
- Verify the workflow file has correct YAML syntax

### Workflow Fails

1. Go to **Actions** tab
2. Click on the failed workflow run
3. Check the error messages
4. Common issues:
   - Missing dependencies (run `npm install` locally first)
   - TypeScript errors (run `npm run typecheck` locally)
   - Build errors (run `npm run build` locally)

### Pages Not Updating

- Wait a few minutes after workflow completes
- Clear browser cache
- Check that workflow completed successfully (green checkmark)
- Verify Pages source is set to "GitHub Actions"

### Permission Errors

If you see permission errors:
1. Go to **Settings → Actions → General**
2. Under **"Workflow permissions"**, select:
   - **"Read and write permissions"**
   - Check **"Allow GitHub Actions to create and approve pull requests"**
3. Click **Save**

## Visual Guide

```
Repository → Settings → Pages
├─ Source: [GitHub Actions ▼]
└─ Save

Then:
Repository → Actions
├─ "Build and Deploy to GitHub Pages" workflow
└─ Should run automatically on push to main
```

## After Setup

Once configured, every push to `main` will:
1. ✅ Run TypeScript typecheck
2. ✅ Build the project
3. ✅ Deploy to GitHub Pages automatically

Your site will be live at: `https://mytherapy-coding.github.io/Password-Generator/`
