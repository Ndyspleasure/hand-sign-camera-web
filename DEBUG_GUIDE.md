# 🔍 Hand Sign Camera Vanillate - Debug Guide

## Auto-Debug Logging

When you open the app, **browser console automatically logs debug info**:

### What Gets Logged
```
🎮 Hand Sign Camera Vanillate - Debug Mode

🔍 Device & Network Info
Browser: Chrome 120
OS: Windows 10
GPU: NVIDIA GeForce GTX 1650
RAM: 8GB
Connection: 4g
Timestamp: 2026-09-20T06:00:00Z

📡 Testing Critical Resources
✅ https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.29/wasm
✅ https://storage.googleapis.com/mediapipe-models/...

📶 Testing network latency...
✅ Network latency: 45ms
```

---

## Opening Browser Console

### Chrome / Edge / Firefox
```
1. Right-click anywhere on page
2. Click "Inspect" or "Inspect Element"
3. Click "Console" tab
```

### Safari
```
1. Safari Menu → Preferences → Advanced
2. Enable "Show Develop menu in menu bar"
3. Develop → Show JavaScript Console
```

---

## Reading Console Logs

### ✅ Success Indicators
```
✓ Loading MediaPipe WASM...
✓ WASM loaded successfully from https://cdn.jsdelivr.net/...
✓ Creating HandLandmarker with GPU delegate...
✓ GPU delegate initialized successfully
✓ Hand tracker initialization complete
```

When you see all ✓'s, app is ready to use.

### ⚠️ Warning Indicators
```
GPU delegate failed: [error message]
Falling back to CPU delegate...

✓ CPU delegate initialized successfully
```

App will still work, but slower (~100-300ms per frame).

### ❌ Error Indicators
```
❌ Hand tracker initialization failed: [error details]
```

This is the actual error - read it carefully and see solutions below.

---

## Common Errors & Solutions

### Error: "Network or resource load error"

**Causes:**
1. No internet connection
2. ISP blocking CDNs
3. Firewall blocking resources
4. CDN temporarily down

**Solutions:**
1. **Check internet:** Open google.com, verify working
2. **Try mobile hotspot:** If WiFi is blocked, use phone hotspot
3. **Check firewall:** Temporarily disable or add app to whitelist
4. **Try different network:** Coffee shop WiFi, mobile data, etc.
5. **Wait 5 minutes:** CDN might be temporarily down
6. **Try different CDN:** App has fallback CDN (unpkg.com)

### Error: "Failed to load MediaPipe WASM"

**Causes:**
- Same as above (network issues)
- Browser doesn't support WebAssembly
- JavaScript disabled

**Solutions:**
1. Check internet connection
2. Check browser is modern (Chrome, Firefox, Edge, Safari 2020+)
3. Enable JavaScript: Settings → Privacy → JavaScript
4. Clear cache: Ctrl+Shift+Delete

### Error: "Failed to create HandLandmarker"

**Causes:**
- Model file not accessible
- GPU/CPU resources exhausted
- Incompatible browser

**Solutions:**
1. Check internet still connected
2. Close other heavy apps (Photoshop, games, etc.)
3. Try different browser
4. Restart computer

### Error: "Event Error: [type]"

**Means:** Something threw a generic Event instead of an Error

**Solutions:**
1. Check browser console for more details above this error
2. Try hard refresh: Ctrl+Shift+R
3. Clear all browser data:
   - DevTools → Application → Clear Storage → Clear All
4. Try different browser

---

## Network Diagnostics

### Test 1: Check Specific Resources

In browser console, paste this and run:
```javascript
async function testResources() {
  const urls = [
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.29/wasm',
    'https://unpkg.com/@mediapipe/tasks-vision@0.10.29/wasm',
    'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'
  ];
  
  for (const url of urls) {
    try {
      const r = await fetch(url, { method: 'HEAD' });
      console.log(`✅ ${url.split('/').pop()} - ${r.status}`);
    } catch(e) {
      console.log(`❌ ${url.split('/').pop()} - ${e.message}`);
    }
  }
}
testResources();
```

### Test 2: Check DNS Resolution

In browser console:
```javascript
// If this works, DNS is fine
fetch('https://google.com').then(() => console.log('✅ DNS OK')).catch(() => console.log('❌ DNS/Network issue'))
```

### Test 3: Check Firewall/Proxy

```javascript
fetch('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.29/package.json')
  .then(r => console.log('✅ CDN accessible:', r.status))
  .catch(e => console.log('❌ Firewall may be blocking:', e.message))
```

### Test 4: Check Network Speed

In browser console:
```javascript
async function testSpeed() {
  const start = performance.now();
  try {
    await fetch('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.29/wasm', { method: 'HEAD' });
    const latency = Math.round(performance.now() - start);
    console.log(`Network latency: ${latency}ms ${latency < 100 ? '✅' : '⚠️'}`);
  } catch(e) {
    console.log('❌ Network test failed:', e.message);
  }
}
testSpeed();
```

---

## Browser-Specific Issues

### Chrome/Chromium

**Problem:** "CORS error" or "blocked by CORS policy"
- **Cause:** Browser CORS policy
- **Solution:** Reload page, try incognito window, update Chrome

**Problem:** "WebAssembly is not defined"
- **Cause:** WebAssembly disabled
- **Solution:** 
  1. Chrome → Settings → Advanced → System
  2. WebAssembly toggle ON
  3. Reload page

### Firefox

**Problem:** "SharedArrayBuffer is not defined"
- **Cause:** Security setting
- **Solution:**
  1. Type `about:config` in address bar
  2. Search `javascript.options.shared_memory`
  3. Toggle TRUE
  4. Reload page

### Safari

**Problem:** "Fetch failed" or "Network request failed"
- **Cause:** Safari's strict security policy
- **Solution:**
  1. Safari → Settings → Privacy
  2. "Prevent cross-site tracking" OFF
  3. Or try Chrome (better compatibility)

### Edge

**Problem:** Similar to Chrome
- **Solution:** Update to latest Edge version

---

## Advanced Debugging

### Enable Maximum Logging

Add this to browser console:
```javascript
localStorage.debug = '*';
window.location.reload();
```

Then check console for even more detailed logs.

### Check Network Tab

1. Open DevTools → Network tab
2. Reload page
3. Look for requests to:
   - `cdn.jsdelivr.net` - should be ✅ (200-304)
   - `storage.googleapis.com` - should be ✅ (200-304)
   - Any ❌ (404, 403, timeout) = network issue

### Check Performance

1. DevTools → Performance tab
2. Click record
3. Do something in app (detect hand, etc.)
4. Click stop
5. Look for red bars = performance issues

### Check Memory

1. DevTools → Memory tab
2. Click "Heap snapshot"
3. Look for:
   - Green = normal
   - Red = memory leak or large object

---

## When to Contact Support

If you've tried all solutions above, provide this info:

1. **Error message (from console):**
   ```
   ⚠️ [copy full error message]
   ```

2. **Device info (from console first line):**
   ```
   Browser: Chrome 120
   OS: Windows 10
   GPU: [shown in console]
   Connection: [shown in console]
   ```

3. **Network test results:**
   - ✅ or ❌ for each test above

4. **Screenshot of console errors**

5. **What you tried:**
   - [ ] Tried different browser
   - [ ] Cleared cache
   - [ ] Checked internet
   - [ ] Restarted computer
   - [ ] Etc.

---

## Performance Optimization

### If App is Slow

1. **Check GPU vs CPU:**
   ```
   Console shows: "✓ GPU delegate initialized"
   vs
   Console shows: "Falling back to CPU"
   ```

2. **If CPU (slow):**
   - Close other apps
   - Close other browser tabs
   - Try Chrome (better GPU support)
   - Try faster computer

3. **If still slow:**
   - Check Network latency (should be <100ms)
   - Check CPU usage (Task Manager → Performance)
   - Check RAM usage (should be <500MB)

---

## Debug Commands

### Copy Device Info

```javascript
// Copy to clipboard
copy(JSON.stringify({
  browser: navigator.userAgent,
  cores: navigator.hardwareConcurrency,
  memory: navigator.deviceMemory,
  connection: navigator.connection?.effectiveType
}, null, 2));
// Then paste in message
```

### Test Hand Detection

```javascript
// If app is running, test hand detection
console.log('Hand tracking active:', !!window.handLandmarker);
```

### Clear App Cache

```javascript
// Clear service worker cache
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(r => r.unregister());
    console.log('Service workers unregistered');
  });
}

// Clear app cache
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
  console.log('All caches cleared');
});
```

---

## Quick Fixes Flowchart

```
App won't initialize
├─ Check internet?
│  └─ NO → Connect to WiFi/mobile data
│  └─ YES ↓
├─ Check console for errors?
│  └─ YES → See "Common Errors" above
│  └─ NO ↓
├─ Hard refresh?
│  └─ Ctrl+Shift+R (Windows/Linux)
│  └─ Cmd+Shift+R (Mac)
│  └─ Still not working? ↓
├─ Clear cache?
│  └─ Ctrl+Shift+Delete
│  └─ Still not working? ↓
├─ Try different browser?
│  └─ Chrome or Firefox recommended
│  └─ Still not working? ↓
├─ Try incognito/private window?
│  └─ Ctrl+Shift+N (Chrome)
│  └─ Ctrl+Shift+P (Firefox)
│  └─ Still not working? ↓
└─ Restart computer
   └─ Still not working? → Contact support with console logs
```

---

## Console Log Format

All logs follow this format:

```
[emoji] [component] [message] [details]

Examples:
✅ WASM loaded successfully
❌ Hand tracker initialization failed: Network error
⚠️ GPU delegate failed, falling back to CPU
📡 Testing Critical Resources
🔧 Initializing hand tracker...
```

Use the emoji and message to quickly identify issues.

---

## Final Checklist Before Giving Up

- [ ] Internet connection verified
- [ ] Console logs checked
- [ ] Hard refresh tried (Ctrl+Shift+R)
- [ ] Cache cleared
- [ ] Different browser tried
- [ ] Incognito window tried
- [ ] Computer restarted
- [ ] Network tests run (copy-paste commands above)
- [ ] Firewall checked
- [ ] Device info collected (from console)

If you've checked all these and it still doesn't work, contact support with:
1. Console logs (screenshot)
2. Device info (from first console group)
3. Network test results
4. What you've already tried

---

**Version:** Hand Sign Camera Vanillate v1.0  
**Last Updated:** Sep 2026  
**Status:** Complete Debug Suite
