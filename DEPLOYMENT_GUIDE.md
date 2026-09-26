# Deployment Guide — Hand Sign Camera Vanillate Web

## Fastest Way (5 minutes)

### Netlify Direct Upload (No Code/Git Required)

```bash
npm install
npm run build
```

Then:
1. Go to https://app.netlify.com/drop
2. Drag & drop the `dist` folder
3. **Done** — your site is live

---

## Recommended Way (GitHub + Netlify Auto-Deploy)

### Step 1: Create GitHub Repo
```bash
git init
git add .
git commit -m "Hand Sign Camera Vanillate web"
git remote add origin https://github.com/YOUR_USERNAME/hand-sign-camera-web.git
git push -u origin main
```

### Step 2: Connect to Netlify
1. Go to https://app.netlify.com/
2. Click **"Add new site" → "Import an existing project"**
3. Connect GitHub, select your repo
4. Build settings auto-detect:
   - Command: `npm run build`
   - Publish dir: `dist`
5. Click **Deploy**

Every push to `main` auto-deploys. That's it.

---

## Custom Domain

In Netlify dashboard:
- **Settings → Domain management → Add custom domain**
- Point your DNS to Netlify (they'll tell you how)

Free SSL certificate included.

---

## Environment Variables (None Needed)

The app works out of the box. No env vars required.

(If you add a backend later, add vars via Netlify Site Settings → Environment.)

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails locally | `npm install` then `npm run build` |
| Camera not working | HTTPS required (Netlify provides this) |
| Slow first load | First load ~20-30s (downloads model). Cached after. |
| Recording doesn't download | Check browser pop-up blocker settings |

---

## Performance Tips

- **First load:** ~30MB download (MediaPipe WASM + model). Cached forever.
- **Subsequent loads:** <1s (all cached)
- **Hand tracking:** ~50-100ms latency. Acceptable for real-time.
- **Recording:** WebM format (H.264 not available in browser yet)

---

## That's It

Netlify handles HTTPS, caching, CDN, and auto-deploy.
You have nothing to manage.
