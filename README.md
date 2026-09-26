# Hand Sign Camera Vanillate — Web Version (PWA)

**Fully offline-capable web app** — hand tracking, gesture recognition, and effects all run locally after one-time model download. No server calls after that. Works on any device with a modern browser (Chrome, Firefox, Safari, Edge).

## Local Setup

```bash
npm install
npm run dev
```

Open browser to `https://localhost:3000` (uses self-signed cert for local HTTPS — camera access requires HTTPS even on localhost).

## Architecture

### `/src/shared/` — Gesture + Effect logic (platform-agnostic)
Identical logic from native Kotlin project, ported to TypeScript:
- `GeometricGestureRecognizer` — 9 gestures from finger-curl geometry
- `EffectEngine` — maps gestures to effects with grace-period state
- `NeonSkeletonEffect`, `LaserEffect`, `ParticleSparkEffect` — 3 effects
- `HudRenderer` — live code readout
- `DrawCommand` — platform-agnostic drawing instructions

### `/src/camera/` — MediaPipe Web + getUserMedia
- `HandTracker.ts` — MediaPipe Web integration (@mediapipe/tasks-vision)
- Real-time hand landmark detection from camera stream
- 21-point tracking per hand, supports 2 hands

### `/src/compositor/` — Canvas rendering
Maps `DrawCommand[]` from effects to native Canvas API calls. ~60 FPS capable.

### `/src/audio/` — Audio system
Audio import, timeline, trim (MVP skeleton — production version needs mixing).

### `/src/sw.ts` — Service Worker
Offline support + aggressive caching. Pre-caches UI, caches MediaPipe WASM + model on first load.

## What works now

✅ Real camera access + hand tracking  
✅ 9 gesture recognition  
✅ 3 effects rendering live  
✅ HUD with detected gesture names  
✅ Video recording to WebM  
✅ Service worker + offline after first load  
✅ Build optimization (Vite + terser)  

## Performance

- **Hand tracking latency:** ~50-100ms (WASM), vs ~25-30ms on native. Acceptable for real-time.
- **Rendering:** 60 FPS capable on modern devices (Canvas is fast).
- **Download:** ~30MB first load (MediaPipe WASM + model), then cached forever.
- **Subsequent loads:** <1 second (everything cached).

## Building for Production

```bash
npm run build
# Outputs optimized dist/ directory
```

Output is ready for static hosting (Netlify, Vercel, GitHub Pages, etc).

---

## Deployment to Netlify

### Option 1: Connect GitHub (Recommended)

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Hand Sign Camera Vanillate web"
   git remote add origin https://github.com/YOUR_USERNAME/hand-sign-camera-web.git
   git push -u origin main
   ```

2. **Log in to Netlify** at https://app.netlify.com

3. **Click "Add new site" → "Import an existing project"**

4. **Connect your GitHub account** and select the repository

5. **Configure build settings:**
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Node version:** 18 (or higher)

6. **Click "Deploy"** — Netlify will build and deploy automatically

### Option 2: Direct Upload (No GitHub)

1. Build locally:
   ```bash
   npm run build
   ```

2. Go to https://app.netlify.com/drop

3. Drag & drop the `dist` folder

4. Your site is live in ~30 seconds

### Option 3: Netlify CLI (Fastest for Testing)

```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

Follow the prompts — login to Netlify and link to your site.

---

## HTTPS & Camera Access

✅ **Netlify deployments are HTTPS by default** — no extra setup needed.

Camera access requires HTTPS (even localhost needs HTTPS for `getUserMedia`). Netlify handles this automatically.

---

## Model Download & Caching

On first load:
1. Browser downloads MediaPipe WASM (~20MB)
2. Browser downloads `hand_landmarker.task` model (~20MB)
3. **Service Worker caches both** — subsequent visits use cache

If user clears cache, the download repeats (but only on next visit, not affecting app experience).

**Total first-load time:** ~10-30 seconds (depends on network speed).

---

## Environment Variables

Currently none required. See `.env.example` for future use.

---

## Offline Behavior

✅ **Works fully offline after first load:**
- Camera: works (local API)
- Hand tracking: works (cached WASM + model)
- Gesture recognition: works (local logic)
- Effects: work (local Canvas rendering)
- Recording: works (browser's MediaRecorder)

Network is NOT required after the first load completes.

---

## Browser Support

| Browser | Dukungan | Catatan |
|---------|----------|---------|
| Chrome 96+ | ✅ Penuh | Recommended |
| Firefox 120+ | ✅ Penuh | Works great |
| Safari 16+ | ✅ Penuh | iOS 16+ dibutuhkan untuk camera |
| Edge 96+ | ✅ Penuh | Chromium-based |
| Chrome Mobile | ✅ Penuh | Android 8+ |
| Safari iOS | ✅ Penuh | iOS 16+ dibutuhkan |

---

## Troubleshooting

**Camera tidak bekerja?**
- Browser harus punya camera permission
- Harus HTTPS (Netlify handles ini)
- Coba browser yang berbeda

**Hand tracking lambat?**
- First load cache WASM — instant after
- Close other browser tabs untuk free memory
- Check internet speed saat first load

**Recording tidak download?**
- Browser's pop-up blocker mungkin block download
- Check browser settings

---

## Future Improvements

- Audio mixing (currently silent blob)
- More effects (Blur, Glitch, Particle variants)
- Project storage (IndexedDB)
- Gesture combinations (BOTH_HANDS)
- Motion gestures (WAVE, dll)
