# 🎨 Effects Guide — Hand Sign Camera Vanillate

**9 visual effects dengan animasi kompleks, masing-masing triggered oleh gesture berbeda.**

---

## Effects Overview

| Gesture | Effect | Visual | Animation |
|---------|--------|--------|-----------|
| **OPEN_PALM** | Kaleidoscope | Mirrored hand skeleton rotating | 6-fold symmetry, continuous rotation |
| **PEACE** | Spiral | Rotating logarithmic spiral | Expanding spiral with color gradient |
| **FIST** | Bloom | Rainbow bursts dari fingertips | Expanding rings dengan color cycle |
| **THUMBS_UP** | Glow Pulse | Pulsing aura around hand | Oscillating rings + ripples |
| **THUMBS_DOWN** | Wave | Procedural sine waves | Expanding wavefronts dengan color spectrum |
| **OK** | Trail | Motion path visualization | Fading line trail dari index finger |
| **ROCK** | Neon Skeleton | Aqua-teal glowing bones | Static + joint circles (base effect) |
| **POINTING** | Laser | Red energy beam | Directional laser dari fingertip |
| **PINCH** | Particle Spark | Yellow spark particles | Spawning + fading + drifting |

---

## 🎬 Detailed Effect Descriptions

### 1. **Kaleidoscope** (OPEN_PALM)
```
Visual: Hand skeleton rotated 6 times around center, mirrored
Animation: Continuous smooth rotation
Technique: Rotated coordinate transforms, color interpolation
Files: KaleidoscopeEffect.ts
```

**How it works:**
- Wrist = rotation center
- Hand connections drawn 6 times at 60° intervals
- Colors lerp from cyan → magenta per segment
- Rotating rings at center for mandala effect

**Customization:**
```typescript
const segmentCount = 6        // change for different symmetry
const rotation = (elapsedMs / 4000) * Math.PI * 2  // slower/faster
const colorStart = 0xff00ffff // cyan
const colorEnd = 0xffff00ff   // magenta
```

---

### 2. **Spiral** (PEACE)
```
Visual: Logarithmic spiral emanating from wrist
Animation: Expanding spiral with rotating particles
Technique: Archimedean spiral formula (r = a*e^(b*theta))
Files: SpiralEffect.ts
```

**How it works:**
- Spiral drawn via parametric equation
- Multiple concentric expanding rings
- Particles follow spiral path
- Color changes per segment

**Customization:**
```typescript
const a = 10          // spiral tightness
const b = 0.3         // spiral expansion rate
const maxRadius = ... // where spiral stops
```

---

### 3. **Bloom** (FIST)
```
Visual: Expanding light bursts dari setiap fingertip
Animation: Concentric rings expanding then fading
Technique: Eased parametric expansion + color lerp
Files: BloomEffect.ts
```

**How it works:**
- 5 fingertips = 5 simultaneous blooms
- Each fingertip punya warna spectrum (red→orange→yellow→green→blue)
- 4 rings per bloom dengan staggered timing
- Bright core at fingertip

**Customization:**
```typescript
const bloomCycleDuration = 1200  // ms per cycle
const ringCount = 4               // layers
const colors = [0xffff0000, ...]  // spectrum
```

---

### 4. **Glow Pulse** (THUMBS_UP)
```
Visual: Pulsing aura expanding dari wrist
Animation: Oscillating glow + expanding ripple rings
Technique: Sine wave oscillation + ripple propagation
Files: GlowPulseEffect.ts
```

**How it works:**
- Wrist = center
- Main glow grows/shrinks sinusoidally
- 3 ripple rings expanding outward
- Inner bright core
- 1-second pulse cycle

**Customization:**
```typescript
const pulseScale = sine(phase * Math.PI * 2, 0.3, 0.7)  // pulse shape
const baseRadius = handSpan + 20  // glow size relative to hand
```

---

### 5. **Wave** (THUMBS_DOWN)
```
Visual: Procedural sine waves emanating dari wrist
Animation: Color-changing wavefronts expanding
Technique: Perturbed circles + sine displacement
Files: WaveEffect.ts
```

**How it works:**
- Concentric circular wavefronts
- Each front perturbed dengan sine wave
- Color spectrum cycles through expanding waves
- 8 concurrent wave fronts at different phases

**Customization:**
```typescript
const waveCount = 8
const maxWaveRadius = 200
const waveAmplitude = 15     // how much sine perturbs radius
const waveFrequency = 8      // how many bumps per circle
```

---

### 6. **Trail** (OK)
```
Visual: Fading line trail following index finger
Animation: Points decay over 500ms
Technique: Particle trail dengan age-based fade
Files: TrailEffect.ts
```

**How it works:**
- Sample index fingertip every 10ms
- Store points dengan age tracking
- Draw lines connecting consecutive points
- Stroke width & blur increase dengan age
- Remove points older than 500ms

**Customization:**
```typescript
const maxAge = 500  // how long trail stays
const sampleRate = 10  // ms between samples
const strokeVariation = 2 + (1-age)*3  // thicker when fresh
```

---

### 7. **Neon Skeleton** (ROCK)
```
Visual: Aqua-teal glowing hand bones
Animation: Static (atau optional pulse)
Technique: Double-pass rendering (glow + core)
Files: NeonSkeletonEffect.ts (existing)
```

**How it works:**
- Draw all hand connections
- Glow pass: wide blur stroke
- Core pass: thin white line
- Joint circles at every landmark
- No time-based animation (static effect)

---

### 8. **Laser** (POINTING)
```
Visual: Red energy beam dari index fingertip
Animation: Directional, follows finger direction
Technique: Vector math (PIP→TIP direction)
Files: LaserEffect.ts (existing)
```

**How it works:**
- Direction = index TIP - index MID
- Beam extends across entire screen
- Glow + core rendering
- Muzzle glow at fingertip origin

---

### 9. **Particle Spark** (PINCH)
```
Visual: Yellow spark particles spawning at fingertip
Animation: Particles spawn, drift, fade
Technique: Stateful particle system per hand
Files: ParticleSparkEffect.ts (existing)
```

**How it works:**
- Spawn 3 particles/frame (scalable)
- Each has random velocity direction
- Alpha & size decay over 500ms
- State tracked per hand (LEFT/RIGHT independent)

---

## 📝 How to Add a New Effect

### Step 1: Create Effect File
File: `src/shared/MyNewEffect.ts`

```typescript
import { HandEffect } from './Effect'
import type { TrackedHand } from './TrackingTypes'
import type { DrawCommand } from './DrawCommand'

export class MyNewEffect implements HandEffect {
  readonly id = 'my_new_effect_v1'
  
  draw(hand: TrackedHand, canvasWidth: number, canvasHeight: number, intensity: number): DrawCommand[] {
    const commands: DrawCommand[] = []
    const clamped = Math.max(0, Math.min(1, intensity))
    
    // Your animation logic here
    // Return list of DrawCommands
    
    return commands
  }
}
```

### Step 2: Add to Registry
Edit `src/shared/EffectEngine.ts`:

```typescript
import { MyNewEffect } from './MyNewEffect'

// In createDefaultRegistry():
const myNew = new MyNewEffect()

return new Map([
  // ... existing
  [Gesture.HEART, myNew],  // or any gesture
])
```

### Step 3: Export
Edit `src/shared/index.ts`:

```typescript
export { MyNewEffect } from './MyNewEffect'
```

### Step 4: Test
```bash
npm run dev
# Test gesture in browser
```

---

## 🎨 Animation Techniques Used

### Easing Functions
Smooth acceleration/deceleration:
- `Easing.easeOutQuad` — quick start, slow finish
- `Easing.easeOutCubic` — more dramatic
- `Easing.easeOutBounce` — bouncy landing
- Custom: chain multiple for complex curves

### Time-Based Animation
```typescript
const now = Date.now()
const elapsedMs = now - this.startTimeMs
const phase = (elapsedMs % cycleDuration) / cycleDuration  // 0→1 loop
```

### Color Interpolation
```typescript
import { lerpColor } from './AnimationUtils'
const color = lerpColor(colorA, colorB, phase)  // smooth color fade
```

### Procedural Generation
```typescript
import { noise, sine, saw } from './AnimationUtils'
const perturb = sine(angle * frequency + time) * amplitude
const randomVal = noise(x, y, seed)
```

---

## 🎬 Effect Gallery

**Check these effects in action:**

```bash
npm run dev
# Try gestures:
- OPEN_PALM → Kaleidoscope (most impressive)
- PEACE → Spiral (hypnotic)
- FIST → Bloom (powerful)
- THUMBS_UP → Glow (zen)
- THUMBS_DOWN → Wave (mystical)
- OK → Trail (elegant)
- ROCK → Neon (classic)
- POINTING → Laser (direct)
- PINCH → Particles (playful)
```

---

## 📊 Performance Notes

All effects run 60 FPS on modern devices:
- **Trail & Particles**: Light (simple geometry)
- **Kaleidoscope & Spiral**: Medium (6 segments or 100 points)
- **Bloom & Wave**: Light-Medium (circles, simple math)
- **Neon & Laser**: Light (static or linear)
- **Glow Pulse**: Light (few circles)

Combined: ~1000 DrawCommands per frame max, easily handled by Canvas.

---

## 🔧 Tips & Tricks

### Make Animations Faster
Lower the cycle duration:
```typescript
const phase = (elapsedMs % 500) / 500  // was 1000, now 2x faster
```

### Make Animations More Intense
Increase amplitude/scale:
```typescript
const radius = baseRadius * 2  // double the size
const alpha = Math.round(255 * clamped)  // more opaque
```

### Add More Colors
Expand the spectrum:
```typescript
const colors = [0xffff0000, 0xffff00ff, 0xff0000ff, 0xff00ffff, ...]
const color = colors[Math.floor(phase * colors.length)]
```

### Debug Animation
Add console.log to trackframe:
```typescript
console.log(`Phase: ${phase.toFixed(2)}, Alpha: ${alpha}, Scale: ${scale.toFixed(2)}`)
```

---

## 📖 References

- `src/shared/AnimationUtils.ts` — easing, lerp, noise
- `src/shared/DrawCommand.ts` — line, circle, rect, text types
- `src/shared/HandTopology.ts` — 21-point landmark indices
- `src/shared/Effect.ts` — HandEffect interface
- `src/shared/EffectEngine.ts` — gesture→effect registry

---

**Ready to create your own effects?** Start with copying `TrailEffect.ts`, change the animation logic, test it!
