# Which Workflow to Choose in GitHub Pages

## The Answer

When GitHub Pages asks you to choose a workflow, select:

**"Build and Deploy to GitHub Pages"**

This is the name defined in `.github/workflows/pages.yml`:

```yaml
name: Build and Deploy to GitHub Pages
```

## Step-by-Step

1. Go to: `https://github.com/mytherapy-coding/Password-Generator/settings/pages`

2. Under **"Build and deployment"** → **"Source"**

3. Select: **"GitHub Actions"** (not "Deploy from a branch")

4. A dropdown will appear asking you to choose a workflow

5. Select: **"Build and Deploy to GitHub Pages"**

6. Click **Save**

## Visual Guide

```
Settings → Pages
├─ Build and deployment
│  └─ Source: [GitHub Actions ▼]
│     └─ Workflow: [Build and Deploy to GitHub Pages ▼] ← SELECT THIS
└─ Save
```

## If You Don't See the Workflow

If "Build and Deploy to GitHub Pages" doesn't appear in the dropdown:

1. **Check the workflow file exists**:
   - Should be at: `.github/workflows/pages.yml`
   - Make sure it's committed and pushed to `main` branch

2. **Trigger the workflow first**:
   - Go to: Actions tab
   - Click "Build and Deploy to GitHub Pages"
   - Click "Run workflow"
   - Wait for it to complete
   - Then go back to Settings → Pages

3. **Verify workflow name**:
   - The workflow name in `pages.yml` must be: `Build and Deploy to GitHub Pages`
   - GitHub uses this exact name in the dropdown

## After Selecting

Once you select the workflow and save:
- GitHub Pages will use the workflow's output (`dist/` folder)
- Every push to `main` will trigger a new deployment
- Your site will be at: `https://mytherapy-coding.github.io/Password-Generator/`
