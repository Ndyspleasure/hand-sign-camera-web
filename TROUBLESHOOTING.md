# 🔧 Hand Sign Camera Vanillate - Troubleshooting Guide

## Common Issues & Solutions

---

### ❌ "App won't load" or "Stuck on loading screen"

**Symptoms:**
- Loading spinner keeps spinning indefinitely
- No error message shown
- Browser console shows no errors

**Causes & Solutions:**

1. **Slow Internet Connection**
   - App needs to download ~30MB MediaPipe model on first load
   - Solution: Keep the app open for 2-3 minutes, check network speed
   - Try again from a faster WiFi connection

2. **Browser Compatibility**
   - Not all browsers support all required APIs
   - ✅ **Recommended:** Chrome, Firefox, Edge (latest versions)
   - ⚠️ **Limited support:** Safari (may work but slower)
   - ❌ **Not supported:** IE11, older browsers
   - Solution: Try a different browser

3. **JavaScript Disabled**
   - Solution: Enable JavaScript in browser settings

4. **Ad Blocker/Content Blocker Interfering**
   - Some blockers may prevent MediaPipe resources from loading
   - Solution: Disable ad blocker for this site temporarily

---

### ❌ "Initialization Failed" Error

#### Error: "Camera API not supported"
**Causes:**
- Using Internet Explorer or very old browser
- **Solution:** Use Chrome, Firefox, Edge, or Safari

#### Error: "Camera permission denied"
**Causes:**
- You clicked "Block" when browser asked for camera access
- Camera permissions are disabled in settings
- **Solutions:**
  1. **Chrome:** Settings → Privacy → Camera → Allow
  2. **Firefox:** Preferences → Privacy → Permissions → Camera → Allow
  3. **Safari:** Safari → Preferences → Websites → Camera
  4. **Try:** Reload the page and grant permission immediately

#### Error: "No camera device found"
**Causes:**
- No webcam connected to your computer
- USB camera is not recognized
- **Solutions:**
  1. Check if camera is plugged in (for USB cameras)
  2. Restart the computer
  3. Check Device Manager (Windows) or System Report (Mac) for camera detection
  4. Try a different USB port
  5. Update camera drivers

#### Error: "Camera is already in use"
**Causes:**
- Another app is using the camera (video call, etc.)
- Another browser tab has camera access
- **Solutions:**
  1. Close other camera apps or browser tabs
  2. Restart browser
  3. Restart computer if problem persists

#### Error: "HTTPS required for camera access"
**Causes:**
- Viewing over HTTP instead of HTTPS (happens on custom deployments)
- **Solutions:**
  1. Use the official Netlify deployment (https://...)
  2. If self-hosting: Set up HTTPS/SSL certificate

#### Error: "Video stream loading timeout"
**Causes:**
- Camera driver issues
- USB connection unstable
- Network/firewall blocking camera
- **Solutions:**
  1. Restart computer
  2. Update camera drivers
  3. Try a different USB port
  4. Check firewall isn't blocking browser
  5. Try reconnecting camera

---

### ❌ "Hand tracking not working" or "No gestures detected"

#### Symptoms:
- Camera shows but no hand detection
- HUD shows 0 hands detected
- Effects aren't triggering

**Causes & Solutions:**

1. **Poor Lighting**
   - MediaPipe needs good lighting to detect hands
   - Solution: Move to brighter area with direct light

2. **Hand Position Out of Frame**
   - Your hand needs to be visible in camera view
   - Solution: Position hand in center of screen

3. **Hand Too Close or Too Far**
   - Optimal distance: 30cm - 1.5m (1-5 feet)
   - Solution: Adjust distance from camera

4. **Model Still Loading**
   - MediaPipe model takes time to download (~20MB)
   - Solution: Wait 1-2 minutes before moving hands
   - Check console: should see "✓ GPU delegate initialized"

5. **Gesture Confidence Too Low**
   - App requires >40% confidence for gesture recognition
   - Solution: Make clearer, more distinct hand gestures

6. **GPU Fallback to CPU (Slower)**
   - If GPU doesn't work, app falls back to CPU
   - This is normal but slower
   - Solution: Nothing needed - app handles automatically

---

### ❌ "App is slow" or "Jerky performance"

**Symptoms:**
- Low FPS or stuttering
- High inference time (>100ms)
- Laggy gesture response

**Causes & Solutions:**

1. **CPU Being Used Instead of GPU**
   - Look at console: should say "GPU delegate"
   - Solution: Nothing needed - app auto-detects, but GPU is faster

2. **Device Too Old or Low-Spec**
   - MediaPipe can run on older devices but slower
   - Solution: Close other browser tabs/apps to free memory

3. **Poor WiFi (Model Download Still Happening)**
   - First load downloads 30MB model
   - Solution: Wait longer, use better internet

4. **Browser Hardware Acceleration Disabled**
   - Solution:
     - Chrome: Settings → Advanced → System → Hardware Acceleration (ON)
     - Firefox: about:config → layers.acceleration.force-enabled (true)

---

### ❌ "Recording doesn't work"

#### Symptoms:
- "Start Recording" button doesn't respond
- No .webm file downloads
- Recording stops immediately

**Causes & Solutions:**

1. **App Not Fully Initialized**
   - Solution: Wait for loading screen to disappear

2. **Video Codec Not Supported**
   - VP9 codec not available in all browsers
   - Solution: Try Chrome or Firefox (best codec support)

3. **Browser Sandbox Restrictions**
   - Some browsers block file downloads
   - Solution:
     1. Check browser's "Downloads" settings
     2. Disable pop-up blocker
     3. Grant download permissions

4. **Low Disk Space**
   - Recording needs space to buffer video
   - Solution: Free up at least 1GB of disk space

---

### ❌ "App crashes" or "White screen"

**Causes & Solutions:**

1. **Browser Console Errors**
   - Check: Right-click → Inspect → Console tab
   - Share error messages from console
   - Solution: Refresh page, try different browser

2. **Out of Memory**
   - App uses ~300MB RAM at peak
   - Solution: Close other applications

3. **Corrupted Cache**
   - Service Worker cache may be corrupted
   - Solution:
     1. Right-click on app → "Clear site data"
     2. Or open DevTools → Application → Clear Storage → Clear All
     3. Refresh page

---

## 📊 System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **CPU** | Dual-core | Quad-core or better |
| **RAM** | 2GB | 4GB+ |
| **GPU** | Integrated | Dedicated (GTX 1050+) |
| **Camera** | 480p webcam | 1080p webcam or better |
| **Internet** | 5 Mbps | 10 Mbps+ |
| **Browser** | Modern (2020+) | Latest Chrome/Firefox/Edge |
| **OS** | Windows 10, macOS 10.13, Linux | Windows 11, macOS 12+, Linux |

---

## 🔍 Diagnostic Steps

### Step 1: Check Browser Console
```
1. Right-click anywhere on page
2. Select "Inspect" or "Inspect Element"
3. Click "Console" tab
4. Look for red errors or warnings
5. Screenshot any errors and share
```

### Step 2: Check Network
```
1. Open DevTools Console
2. Look for messages like:
   ✓ Loading MediaPipe WASM...
   ✓ Creating HandLandmarker...
   ✓ Requesting camera access...
3. Note which step fails
```

### Step 3: Browser Info
```
Go to: chrome://version/ (Chrome) or about:firefox (Firefox)
Note down:
- Browser version
- OS version
- GPU info
```

### Step 4: Camera Test
```
Before trying the app:
1. Visit https://webcamtests.com/
2. Allow camera access
3. If camera works there, problem is likely app-specific
```

---

## ✅ Quick Fixes (Try These First)

1. **Refresh Page** (Ctrl+R or Cmd+R)
2. **Hard Refresh** (Ctrl+Shift+R or Cmd+Shift+R)
3. **Clear Browser Cache**
   - Chrome: Ctrl+Shift+Delete
   - Firefox: Ctrl+Shift+Delete
   - Safari: Develop → Empty Caches
4. **Try Incognito/Private Window** (Ctrl+Shift+N)
5. **Try Different Browser** (Chrome, Firefox, Edge)
6. **Restart Computer**
7. **Reconnect Camera** (unplug, wait 5s, replug)

---

## 📞 Getting Help

If none of these solutions work:

1. **Check browser console for exact error message**
   - Open: DevTools → Console → Screenshot errors
2. **Note down:**
   - Browser name and version
   - Operating system
   - Camera model (if known)
   - Exact error message
3. **Try:** 
   - Clear all browser data for the site
   - Test in a completely different browser
   - Test with a different device if available

---

## 🔄 Rollback Procedure

If you encounter an unrecoverable issue:

1. **Clear All App Data:**
   ```
   DevTools → Application → Clear Storage → "Clear Site Data"
   ```

2. **Hard Refresh:**
   ```
   Ctrl+Shift+R (Windows/Linux)
   Cmd+Shift+R (Mac)
   ```

3. **Close and Reopen Browser Completely**

4. **Try Again**

---

## 📈 Performance Tips

### For Better Hand Detection:
- **Lighting:** Position near a window or bright lamp
- **Distance:** Keep hand 30-100cm from camera
- **Background:** Plain background works best
- **Hand Posture:** Clear, distinct gestures work better

### For Better Performance:
- **Close Other Apps:** Frees up CPU/memory
- **Close Other Tabs:** Reduces browser overhead
- **Use Latest Browser:** Performance improvements
- **Use Wired Connection:** More stable than WiFi
- **Use GPU Device:** Modern laptops have better GPU support

---

## 🐛 Known Limitations

- ⏱️ **First Load:** ~30MB download (MediaPipe model) - normal, takes 1-3 minutes
- 📱 **Mobile:** Limited hand detection area (phone camera has narrower FOV)
- 🌍 **Offline:** Works offline after first load (Service Worker caches everything)
- 🔌 **Camera Lag:** 50-200ms latency depending on device
- 🖥️ **CPU Older Devices:** Falls back to CPU inference (slower, ~200ms)

---

## ✨ Tips & Tricks

1. **Fastest First Load:**
   - Open page, wait 2 minutes while model downloads
   - Don't refresh during loading
   - Once loaded, it caches forever (even offline)

2. **Best Hand Detection:**
   - Use good lighting
   - Clear hand gestures (fully open palm, peace sign, etc.)
   - Avoid blurred/motion-heavy gestures

3. **Recording Tips:**
   - Recording is ~5MB per minute
   - Save to cloud storage to avoid filling disk
   - Use Chrome/Firefox for best compatibility

4. **Mobile (if supported in future):**
   - Phone camera has narrower FOV than webcam
   - Back camera better than front camera for hand detection

---

**Last Updated:** Sep 2026  
**Version:** Hand Sign Camera Vanillate v1.0
