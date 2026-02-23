# Deployment Guide

## Pre-Deployment Testing

Run these commands to test locally before deploying:

```bash
# 1. Typecheck (verify TypeScript)
npm run typecheck

# 2. Build
npm run build

# 3. Test web app locally
npm run serve:dist
# Then open http://localhost:3000 (or the URL shown)

# 4. Test CLI
node dist/cli/index.js pwd --len 16
```

## Automated Deployment

The project uses GitHub Actions to automatically build and deploy to GitHub Pages.

### Setup (One-time)

1. **Enable GitHub Pages in repository settings:**
   - Go to: Settings → Pages
   - Source: Select "GitHub Actions"

2. **Push to main branch:**
   ```bash
   git add .
   git commit -m "Build and deploy to GitHub Pages"
   git push origin main
   ```

### What Happens on Push

1. GitHub Actions workflow (`.github/workflows/pages.yml`) triggers
2. Runs `npm ci` to install dependencies
3. Runs `npm run typecheck` to verify TypeScript
4. Runs `npm run build` to create `dist/` folder
5. Uploads `dist/` as artifact
6. Deploys to GitHub Pages

### Verify Deployment

1. Check Actions tab in GitHub repository
2. Wait for workflow to complete (green checkmark)
3. Visit your GitHub Pages URL (usually: `https://<username>.github.io/<repo-name>/`)

## Manual Testing Checklist

- [ ] Password generation works (all modes)
- [ ] User ID generation works (CVC and Words)
- [ ] Share links work (copy and restore)
- [ ] Word lists load correctly
- [ ] Entropy calculation displays
- [ ] Crack time estimation displays
- [ ] All tabs switch correctly

## Troubleshooting

### Build fails locally
- Run `npm install` to ensure dependencies are installed
- Check `tsconfig.json` is correct
- Verify all source files are in `src/` directory

### GitHub Actions fails
- Check Actions tab for error messages
- Verify `package.json` has correct scripts
- Ensure `.github/workflows/pages.yml` exists

### Pages not updating
- Wait a few minutes after push
- Check Actions tab to see if workflow completed
- Verify Pages source is set to "GitHub Actions" (not "main branch")
