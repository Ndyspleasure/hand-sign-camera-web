# 🚀 Quick Start — Hand Sign Camera Vanillate

**Panduan cepat mulai dari 0 sampai live di Netlify dalam 10 menit**

---

## Step 1: Download & Ekstrak Project (1 menit)

Download file `hand-sign-camera-web.zip` dari sini, ekstrak ke folder.

```bash
unzip hand-sign-camera-web.zip
cd hand-sign-camera-web
```

---

## Step 2: Install Dependencies (3 menit)

```bash
npm install
```

Tunggu sampai selesai (download ~200MB, tapi sekali saja).

---

## Step 3: Test Lokal (2 menit)

```bash
npm run dev
```

Buka browser: **https://localhost:3000**

Bagian `insecure certificate` — abaikan, itu normal untuk HTTPS lokal.

**Yang seharusnya tampil:**
- Camera preview (might ask for permission)
- Button "Start Recording"
- Live inference time di bawah

**Tes gesture:**
- Buka telapak tangan (OPEN_PALM)
- Kepal tangan (FIST)
- Peace sign, batu gunting, dll

Kalau berjalan lancar → lanjut deploy.

---

## Step 4: Deploy ke Netlify (2 menit, pilih salah satu)

### **Cara A: Drag-Drop (Paling Cepat)**

Terminal:
```bash
npm run build
```

Buka: https://app.netlify.com/drop

Drag folder `dist` ke browser. **Selesai!** 🎉

URL random muncul — itu link live app Anda.

### **Cara B: GitHub + Auto-Deploy (Recommended Jangka Panjang)**

Terminal:
```bash
git init
git add .
git commit -m "Hand Sign Camera Vanillate MVP"
git remote add origin https://github.com/YOUR_USERNAME/hand-sign-camera-web.git
git push -u origin main
```

Browser:
1. Buka https://app.netlify.com/
2. "Add new site" → "Import an existing project"
3. Connect GitHub → pilih repo Anda
4. Settings sudah auto-detect (`npm run build` & `dist`)
5. Click **Deploy**

Selesai! Setiap kali push ke GitHub, auto-deploy.

### **Cara C: Netlify CLI (Developer-Friendly)**

Terminal:
```bash
npm install -g netlify-cli
npm run build
netlify deploy --prod --dir=dist
```

Login ke Netlify saat diminta. Link akan muncul.

---

## Step 5: Custom Domain (Optional, 2 menit)

Di Netlify dashboard:
- **Settings** → **Domain management**
- **Add custom domain** → ketik domain Anda
- Point DNS (Netlify akan kasih instruction)

SSL certificate gratis, otomatis.

---

## 🎯 Yang Sekarang Bisa Dilakukan

✅ **Open palm** → Aqua-teal neon skeleton muncul  
✅ **Point index finger** → Red laser beam keluar dari ujung jari  
✅ **Pinch (ibu jari + telunjuk)** → Yellow spark particles  
✅ **Record video** → Download WebM file  
✅ **Offline** → Works tanpa internet setelah first load  
✅ **Mobile** → Works di Android & iPhone (iOS 16+)  

---

## 🔧 Konfigurasi (Kalau Diperlukan)

### Camera Resolution
Edit `src/camera/index.ts`, line `getUserMedia`:
```typescript
video: {
  width: { ideal: 1920 },  // ganti ke 1280 kalau lambat
  height: { ideal: 1080 }
}
```

### Gesture Sensitivity
Edit `src/shared/GeometricGestureRecognizer.ts`, line ~11:
```typescript
const EXTENSION_RATIO_THRESHOLD = 1.15  // turun = lebih sensitif
const PINCH_RATIO_THRESHOLD = 0.4       // turun = lebih mudah pinch
```

### Recording Quality
Edit `src/App.tsx`, line ~115:
```typescript
mimeType: 'video/webm;codecs=vp9,opus'  // ganti ke vp8 kalau lebih compatible
```

---

## 📊 First Load Performance

| Metric | Value |
|--------|-------|
| Model download | ~20MB (sekali saja) |
| First load time | ~20-30 detik |
| Subsequent loads | <1 second (cached) |
| Hand tracking latency | ~50-100ms |
| Rendering FPS | ~60 (smooth) |

---

## 🆘 Common Issues & Fixes

### "Camera access denied"
**Fix:** Browser settings → allow camera untuk site ini

### "Model loading forever"
**Fix:** Check internet speed, reload page, try Chrome/Firefox

### "Recording codec error"
**Fix:** Use Chrome/Firefox (best WebM support), atau ganti codec di App.tsx

### "Gesture not recognized"
**Fix:** Ensure tangan fully dalam frame, try slower movement, check confidence threshold

### "Slow on first load"
**Fix:** Normal — model ~30MB, cached after. On WiFi faster.

---

## 📱 Mobile/iOS Notes

**Android:** Full support, semua fitur jalan  
**iPhone (iOS 16+):** Full support, semua fitur jalan  
**iPhone (iOS <16):** Hand tracking tidak support

---

## 🎓 Project Structure (Kalau Mau Modify)

```
src/
├── shared/               ← Core logic (gesture, effect, render commands)
├── camera/               ← MediaPipe + camera wiring
├── compositor/           ← Canvas rendering
├── audio/                ← Audio import (skeleton for now)
├── App.tsx               ← Main React component
└── sw.ts                 ← Service Worker (offline caching)
```

Setiap folder self-contained — mudah modifikasi atau extend.

---

## 🚀 Next Steps (Optional)

### Add More Gestures
Edit `src/shared/GeometricGestureRecognizer.ts` — tambah case baru, test.

### Add More Effects
Buat file baru `src/shared/MyNewEffect.ts`, implement interface `HandEffect`, add ke registry di `EffectEngine.ts`.

### Add Audio Timeline
`src/audio/` sudah punya skeleton, tinggal implement mixing dengan Web Audio API.

### Local Backend
Kalau perlu save projects: add endpoint di `.env`, fetch ke API di `App.tsx`.

---

## 📚 Full Documentation

- **COMPLETE_PROJECT_SUMMARY.md** — file hierarchy, architecture decisions, tech stack
- **README.md** — performance notes, browser support, offline behavior
- **DEPLOYMENT_GUIDE.md** — detailed Netlify deployment steps

---

## ✨ Done!

Sekarang punya production-ready web app yang:
- Deteksi gesture real-time
- Aplied effects live
- Record video
- Works offline
- Deploy auto (kalau pakai GitHub option)

**Senang menggunakan Hand Sign Camera Vanillate!** 🎉

---

**Support:** Check `README.md` → Troubleshooting section  
**Report bugs:** Add issue di GitHub repo (kalau pakai GitHub)  
**Questions:** Refer ke COMPLETE_PROJECT_SUMMARY.md
