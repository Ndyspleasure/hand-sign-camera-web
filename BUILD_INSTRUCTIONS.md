# Build Instructions - Hand Sign Camera Vanillate v1.1

## Windows Command Line Build

### ✅ Step 1: Verify Installation
```cmd
cd C:\Users\UseR\Downloads\hand-sign-camera-web

npm --version
# Should show: v11.x or higher

node --version
# Should show: v24.x or higher
```

### ✅ Step 2: Install Dependencies (Already Done ✓)
```cmd
npm install
# Already completed with 370 packages
# Warnings about glob@11.1.0 are OK (not critical)
```

### ✅ Step 3: Build Project
```cmd
npm run build
```

**What this does:**
1. `tsc` - Compiles TypeScript to JavaScript
2. `vite build` - Bundles everything into optimized `dist/` folder
3. Creates production-ready files (~300KB gzipped)

**Expected output:**
```
> tsc && vite build

vite v5.x.x building for production...
✓ 53 modules transformed.
dist/index.html                   0.72 kB │ gzip:  0.42 kB
dist/assets/index-xxx.css         0.49 kB │ gzip:  0.30 kB
dist/assets/index-xxx.js        286.65 kB │ gzip: 90.58 kB
dist/manifest.webmanifest         0.43 kB
dist/registerSW.js                0.13 kB
✓ built in 2.92s

vite v5.x.x building for production...
✓ 1 modules transformed.
dist/sw.js                        0.93 kB │ gzip: 0.48 kB
✓ built in 11ms
```

**Build completed in:** ~5-10 seconds

### ✅ Step 4: Verify Build
```cmd
dir dist
# Should show these files:
# - index.html
# - manifest.webmanifest
# - registerSW.js
# - sw.js
# - assets\ (folder with .js and .css)
```

### ✅ Step 5: Deploy to Netlify

#### **Option A: Drag-Drop (Fastest - 30 seconds)**
```
1. Open: https://app.netlify.com/drop
2. Drag the "dist" folder from File Explorer
3. Wait ~30 seconds
4. Your app is LIVE! ✅
```

#### **Option B: GitHub Auto-Deploy**
```cmd
git init
git add .
git commit -m "v1.1: Production build"
git remote add origin https://github.com/yourusername/hand-sign-camera
git push -u origin main

# Then on Netlify:
# 1. Click "Import from Git"
# 2. Select your repository
# 3. Auto-deploys on every push
```

#### **Option C: Netlify CLI**
```cmd
npm install -g netlify-cli

netlify deploy --prod --dir=dist
# Then follow prompts to authenticate
```

---

## Troubleshooting Build Issues

### ❌ "error TS5103: Invalid value for '--ignoreDeprecations'"
**Status:** ✅ FIXED in latest version  
**If still happening:**
1. Delete tsconfig.json line with `ignoreDeprecations`
2. Run `npm run build` again

### ❌ "Cannot find module 'react'"
**Cause:** Dependencies not installed  
**Solution:**
```cmd
npm install
npm run build
```

### ❌ "ENOENT: no such file or directory"
**Cause:** node_modules deleted  
**Solution:**
```cmd
npm install
npm run build
```

### ❌ Port 3000 already in use
**If running dev server:**
```cmd
# Kill other Node.js process or use different port:
npm run dev -- --port 3001
```

### ❌ "dist folder not created"
**Cause:** Build failed silently  
**Solution:**
```cmd
npm run build
# Look for error messages ☝️ above
# Fix the error and try again
```

---

## Full Build Workflow (Windows)

```cmd
C:\Users\UseR\Downloads\hand-sign-camera-web>

# Step 1: Install dependencies
npm install

# Step 2: Compile TypeScript + Bundle with Vite
npm run build

# Step 3: Check dist folder created
dir dist

# Step 4: Upload dist to Netlify
# Option A: Drag-drop https://app.netlify.com/drop
# Option B: CLI: netlify deploy --prod --dir=dist
# Option C: Git: git push (if connected to GitHub)
```

---

## What Gets Built

After `npm run build`, the `dist/` folder contains:

```
dist/
├── index.html                    (~0.7 KB) - Main HTML file
├── manifest.webmanifest          (~0.4 KB) - PWA manifest
├── registerSW.js                 (~0.1 KB) - Service Worker registry
├── sw.js                         (~0.9 KB) - Service Worker
└── assets/
    ├── index-[hash].js           (~91 KB gzipped) - App code
    ├── index-[hash].css          (~0.3 KB gzipped) - Styles
    └── [other assets]
```

**Total size:** ~93 KB gzipped (downloads quickly)  
**Performance:** 30-50 FPS hand detection

---

## Deployment Checklist

```
Before deploying:
✓ npm install (completed)
✓ npm run build (no errors)
✓ dist/ folder has files
✓ index.html exists in dist/
✓ index.html size > 500 bytes

Deployment:
✓ Open https://app.netlify.com/drop
✓ Drag dist/ folder
✓ Wait for build (~30 seconds)
✓ Get URL like https://[name].netlify.app
✓ Share the link!

After deployment:
✓ Hard refresh (Ctrl+Shift+R)
✓ Open Developer Tools (F12)
✓ Check Console tab for debug logs
✓ Test hand detection
✓ Test recording
```

---

## Production Build vs Development

### Development (`npm run dev`)
```
- Unoptimized code
- Full source maps
- Slow
- Used for testing locally
- Run: npm run dev
```

### Production (`npm run build`)
```
✓ Optimized code (~91 KB gzipped)
✓ No source maps (smaller)
✓ Fast loading
✓ Ready for deployment
✓ Run: npm run build
✓ Deploy: dist/ folder
```

---

## Performance After Build

| Metric | Value |
|--------|-------|
| **Bundle Size** | 93 KB gzipped |
| **Load Time** | 2-3 seconds (cached) |
| **First Load** | 2-3 minutes (30MB model) |
| **Hand Detection** | 30-50 FPS |
| **Memory** | ~300 MB |
| **Offline** | Works after cache |

---

## Success Indicators

### ✅ Build Succeeded
```
✓ built in 2.92s  ← Should see this
✓ 53 modules transformed
No red error messages
dist/ folder has files
```

### ✅ Deployment Succeeded
```
https://[your-site].netlify.app/  ← Live URL
Console shows debug logs
Hand detection works
Recording works
```

---

## Next Steps

1. **Build:** `npm run build`
2. **Verify:** `dir dist` (check files exist)
3. **Deploy:** Drag `dist/` to https://app.netlify.com/drop
4. **Test:** Open deployed URL + test features
5. **Share:** Send link to users!

---

## Need Help?

1. **Build errors?** Check TROUBLESHOOTING.md
2. **Runtime errors?** Check DEBUG_GUIDE.md
3. **Deployment stuck?** Check RELEASE_NOTES_v1.1.md
4. **Console logs?** Open DevTools (F12)

**Status:** ✅ Ready to build and deploy!

Build time: 5-10 seconds  
Deploy time: 30 seconds  
Total: < 1 minute to production! 🚀
