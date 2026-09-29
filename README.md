# Hand Sign Camera Vanillate — Web Version (PWA)

**Real-time hand-gesture camera in the browser.** MediaPipe tracks up to two hands, a rule-based recognizer reads 16 gestures (including a motion gesture and two-hand gestures), and every gesture triggers its own visual effect. Everything runs locally and works offline after the first load.

## Features

- **16 gestures**: 13 single-hand poses, Wave (motion), and two-hand Heart / Double Palm
- **A distinct effect for every gesture** (table below)
- **Two hands at once**: each hand gets its own gesture and effect; two-hand gestures take over both
- **Gesture Guide** with animated 21-landmark SVG hands: 3–6 animation variants per gesture (forming, counting 1–10 on two hands, double-hand versions, fist bump, heart beat, high five, …), auto-cycling or pick one to loop, plus a live preview of each effect
- **Interactive tutorial** that advances only when the camera actually detects each gesture
- **Demo mode** (`?demo`, or the Demo button): synthetic hands, played from the same animation scripts, run through the real recognizer and effects, with no camera needed
- **Desktop workspace** (≥1024 px with a mouse/trackpad): a full-screen, code-editor style layout. The editor types out the app's real source (shown without comments), `landmarks.live.json` streams live coordinates, the tracker panel shows a filterable log and a gesture reference, and a status bar shows hands/gesture/effect/FPS. Every control works: open files, pause typing, copy JSON, toggle panels (Settings), switch camera/demo, record.
- **Recording** to WebM with a live timer
- **Offline PWA**: WASM runtime and model are cached after first use

## Gestures & effects

| Gesture | How | Effect |
|---|---|---|
| Open Palm | all five fingers spread | Neon Skeleton |
| Fist | all fingers curled | Shockwave |
| Peace | index + middle up | Rainbow Trail |
| Pointing | index up | Laser |
| Thumbs Up | thumb up, fingers curled | Star Burst |
| Thumbs Down | thumb down, fingers curled | Rain Cloud |
| OK | thumb–index ring, others up | Halo |
| Rock | index + pinky up, thumb tucked | Lightning |
| Pinch | thumb & index tips together | Particle Spark |
| Call Me | thumb + pinky out | Sound Waves |
| 3️⃣ Three | index + middle + ring up | Tri-Beam |
| 4️⃣ Four | four fingers up, thumb tucked | Code Rain |
| I Love You | thumb + index + pinky out | Floating Hearts |
| Wave | open palm swinging side to side | Ripple |
| Heart (2 hands) | index tips touch on top, thumbs below | Big Heart |
| Double Palm (2 hands) | both palms open | Energy Beam |

## Site structure

| URL | Page |
|---|---|
| `/` | Home: what the app does, how it works, all gestures, FAQ |
| `/camera/` | The camera app (PWA start page) |
| `/gestures/` | Gesture guide hub (one-hand, motion, two-hand, counting) |
| `/gestures/<slug>/` | One page per gesture: how to make it, meaning, how it's recognized, effect, tips, variations |
| `/privacy/` | On-device processing, what is downloaded and stored |

App deep links: `/camera/?guide` opens the Gesture Guide (`?guide=HEART` selects a gesture); `?demo` starts demo mode; `?layout=ide` / `?layout=mobile` force a layout. Old links on `/` (`/?guide=…`, `/?demo`) redirect to `/camera/`.

## SEO

Content pages are rendered to static HTML at build time from the same gesture data the app uses (`src/seo/`), with zero client JavaScript and inlined CSS:

- Unique title, meta description, H1 and heading outline per page; canonical URLs; Open Graph + Twitter cards with a 1200×630 image per page (`public/og/`)
- JSON-LD: `WebSite`, `WebApplication`, `Organization`, `FAQPage` (home), `CollectionPage`/`ItemList` (hub), `HowTo` (gesture pages), `BreadcrumbList`
- `sitemap.xml`, `robots.txt` (non-production Netlify builds disallow crawling), `llms.txt` for AI assistants, real 404s (no SPA catch-all)
- Canonical origin: `SITE_URL` (set to https://handsign.vanillate.id in Netlify), else Netlify's `URL`
- `npm run build` runs `scripts/check-seo.mjs`, which fails the build on missing/duplicate titles or descriptions, broken internal links, bad canonicals, invalid JSON-LD, heading jumps or noindex pages in the sitemap
- OG images and icons are regenerated with `npm run og:images` while `npm run dev` is running (needs Playwright)

## Local setup

```bash
npm install
npm run dev     # http://localhost:3000 (camera app at /camera/; localhost is a secure context, so the camera works over http)
npm test        # unit tests (vitest)
npm run build   # production build → dist/
```

## Architecture

### `src/shared/` — platform-agnostic core
- `GeometricGestureRecognizer` — finger-extension rules for single-hand gestures + `recognizeTwoHands` (Heart, Double Palm)
- `WaveDetector` — the Wave motion gesture (direction reversals of the palm, normalized by hand size)
- `GestureStabilizer` — debounces per-hand recognition so effects and labels don't flicker
- `effectMap` — the single gesture → effect mapping used by the engine, UI and guide
- `EffectEngine` + `effects/` — a tracking wireframe under every hand, then each hand's own effect; inactive effects keep decaying so particles fade out
- `DrawCommand` — platform-agnostic drawing (line, circle, arc, path, text, additive blend)

### `src/camera/` — MediaPipe + getUserMedia
`HandTracker` wraps `@mediapipe/tasks-vision` HandLandmarker (2 hands, GPU with CPU fallback). The WASM runtime is copied from `node_modules` by `scripts/prepare-mediapipe.mjs` and served same-origin, so it always matches the bundled JS version.

### `src/gestures/`, `src/hand-svg/` — guide data & visuals
Registry of gesture metadata keyed by the recognizer's enum (the compiler rejects a gesture without an entry), canonical 21-landmark hand model, poses, and the pose-animation engine. Unit tests assert that **every guide pose is recognized as its own gesture**.

### `src/ui/` — interface
Status pill, control bar, Gesture Guide (+ live effect preview), tutorial, and `ide/` (desktop code-editor layout).

### `src/compositor/` — Canvas rendering
Maps `DrawCommand[]` to Canvas 2D with minimal state changes.

## Deployment to Netlify

The repo is connected to Netlify: every push to `main` deploys automatically, and pull requests get deploy previews. The site is served at **https://handsign.vanillate.id**; the old `vanillate-hand-sign-camera.netlify.app` address 301-redirects there (see `netlify.toml`). `netlify.toml` sets `npm run build` → `dist` on Node 20. For a manual deploy, run `npm run build` and drag `dist/` to https://app.netlify.com/drop.

Netlify serves HTTPS by default, which the camera requires (except on localhost).

## Model download & caching

On first load the browser downloads the MediaPipe WASM runtime (same origin) and the `hand_landmarker.task` model (Google's model CDN). The service worker caches both, so later visits start instantly and work offline.

## Offline behavior

After the first load, camera, hand tracking, gesture recognition, effects and recording all work without a network.

## Browser support

| Browser | Support | Notes |
|---------|---------|-------|
| Chrome 96+ | ✅ | Recommended |
| Firefox 120+ | ✅ | |
| Safari 16+ | ✅ | iOS 16+ for camera |
| Edge 96+ | ✅ | Chromium-based |
| Chrome Mobile | ✅ | Android 8+ |

## Troubleshooting

**Camera not working?** Allow camera permission and use HTTPS (or localhost).

**A gesture isn't detected?** Open the Guide to compare with the demo; keep the whole hand in frame. Rock needs the thumb tucked (thumb out = I Love You); Four needs the thumb folded (thumb out = Open Palm).

**Recording doesn't download?** A pop-up/download blocker may be interfering.

## Future improvements

- Audio mixing in recordings
- Custom gesture recording
- More two-hand gestures (e.g. camera frame)
