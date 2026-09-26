# 🎬 Animation Coding Showcase

**Contoh kode dari setiap effect — study these untuk bikin effect sendiri.**

---

## 1. Kaleidoscope — Coordinate Transform

Technique: Rotating handler connections symmetrically.

```typescript
// Translate to origin
let x1 = (start.x * canvasWidth) - centerX
let y1 = (start.y * canvasHeight) - centerY

// Rotate by angle
const cos = Math.cos(segmentRotation)
const sin = Math.sin(segmentRotation)
const rotX1 = x1 * cos - y1 * sin  // 2D rotation matrix
const rotY1 = x1 * sin + y1 * cos

// Translate back
const finalX1 = centerX + rotX1
const finalY1 = centerY + rotY1
```

**Key:** Coordinate transforms (translate → rotate → translate) repeated N times for symmetry.

---

## 2. Spiral — Parametric Curves

Technique: Logarithmic spiral math.

```typescript
// Archimedean spiral: r = a * e^(b*theta)
const theta = rotation + t * Math.PI * 3
const a = 10
const b = 0.3

const r = a * Math.exp(b * theta)  // radius grows exponentially
const radius = Math.min(r, maxRadius)

const x = cx + radius * Math.cos(theta)
const y = cy + radius * Math.sin(theta)
```

**Key:** Mathematical formula generates complex curves. Minimal code, maximum visual impact.

---

## 3. Bloom — Eased Expansion

Technique: Concentric rings expanding with easing.

```typescript
// Bloom cycle: 0-1 over 1200ms
const bloomPhase = (elapsedMs % bloomCycleDuration) / bloomCycleDuration

for (let ring = 0; ring < 4; ring++) {
  const ringDelay = ring * 0.1
  const ringPhase = (bloomPhase - ringDelay) % 1.0
  
  // Fast expand, slow fade
  const ringExpand = Easing.easeOutCubic(ringPhase)
  const ringFade = Easing.easeInQuad(1 - Math.abs(ringPhase - 0.7) / 0.3)
  
  const radius = 10 + ringExpand * 80
  const alpha = Math.round(180 * clamped * ringFade)
}
```

**Key:** Combine multiple easing functions for complex motion curves. Stagger rings for wave effect.

---

## 4. Glow Pulse — Oscillation

Technique: Sine wave oscillation.

```typescript
import { sine } from './AnimationUtils'

const phase = (elapsedMs % 1000) / 1000  // 0→1 cycle per 1 second

// Oscillate scale between 0.4 and 1.0
const pulseScale = sine(phase * Math.PI * 2, 0.3, 0.7)

const glowRadius = baseRadius * pulseScale
const alpha = Math.round(100 * clamped * (1 - pulseScale))  // inverse fade
```

**Key:** Sine wave creates smooth oscillation. Offset parameter (0.7) shifts baseline.

---

## 5. Trail — Age-Based Decay

Technique: Particle aging + fade.

```typescript
interface TrailPoint {
  x: number
  y: number
  age: number
  maxAge: number
}

// Sample new point every 10ms
if (now - lastTime > 10) {
  trails.push({
    x: indexTip.x * canvasWidth,
    y: indexTip.y * canvasHeight,
    age: 0,
    maxAge: 500  // vanish after 500ms
  })
}

// Age and render
for (const trail of trails) {
  trail.age += deltaTime
  const ageFraction = trail.age / trail.maxAge  // 0→1
  
  // Fade properties with age
  const alpha = Math.round((1 - ageFraction) * 150 * clamped)
  const strokeWidth = 2 + (1 - ageFraction) * 3  // thicker when fresh
  const blur = ageFraction * 10  // blur increases
  
  commands.push({
    type: 'line',
    x1: trail.x,
    y1: trail.y,
    x2: nextTrail.x,
    y2: nextTrail.y,
    colorArgb: color,
    strokeWidth,
    blurRadius: blur,
    alpha
  })
}

// Remove old
const alive = trails.filter(t => t.age < t.maxAge)
```

**Key:** Simple age-based math creates smooth decay. Stateful particle system.

---

## 6. Wave — Sine Perturbation

Technique: Perturb circle points with sine wave.

```typescript
const waveCount = 8
const wavePhase = (timePhase - waveDelay + 1) % 1.0
const waveRadius = wavePhase * maxWaveRadius
const waveAmplitude = 15

for (let i = 0; i < sampleCount; i++) {
  const angle = (i / sampleCount) * Math.PI * 2
  
  // Perturb radius with sine
  const perturb = Math.sin(angle * waveFrequency + elapsedMs / 100) * waveAmplitude
  const r = waveRadius + perturb
  
  const x = centerX + r * Math.cos(angle)
  const y = centerY + r * Math.sin(angle)
}
```

**Key:** Sine perturbation creates organic wavy effect. Frequency controls bumps per circle.

---

## 7. Color Spectrum — Lerp Interpolation

Technique: Color space interpolation.

```typescript
import { lerpColor } from './AnimationUtils'

// Define spectrum
const colorStart = 0xff00ffff  // cyan
const colorEnd = 0xffff00ff    // magenta

// Interpolate based on phase
const bloomColor = lerpColor(colorStart, colorEnd, ringPhase)

// Or cycle through array
const colors = [
  0xffff0000,  // red
  0xffff7f00,  // orange
  0xffffff00,  // yellow
  0xff00ff00,  // green
  0xff0000ff,  // blue
  0xffff00ff   // magenta
]
const colorPhase = (angle / (Math.PI * 2) + wavePhase) % 1.0
const hue = colorPhase * colors.length
const color = colors[Math.floor(hue) % colors.length]
```

**Key:** Smooth color transitions via lerp, or cyclic via array + modulo.

---

## 8. Ripple Rings — Staggered Timing

Technique: Multiple waves with phase delay.

```typescript
// Multiple rings, each slightly behind the last
for (let ring = 0; ring < 3; ring++) {
  const ripplePhase = (phase + ring * 0.33) % 1.0  // offset each by 0.33
  const ringAlpha = Math.round(150 * (1 - ripplePhase) * Easing.easeOutQuad(...))
  const ringRadius = baseRadius + ripplePhase * 60 + ring * 20
  
  commands.push({
    type: 'circle',
    cx, cy,
    radius: ringRadius,
    colorArgb: color,
    alpha: ringAlpha
  })
}
```

**Key:** Stagger with offsets (0.33, 0.66, 1.0) creates echo effect.

---

## 9. Animation Utils — Reusable Helpers

```typescript
// Easing (from AnimationUtils.ts)
Easing.easeOutQuad(t)        // quick start, slow finish
Easing.easeOutCubic(t)       // more extreme curve
Easing.easeOutBounce(t)      // bouncy landing
Easing.easeOutElastic(t)     // elastic snap

// Lerp
lerp(a, b, t)               // a + (b-a)*t
lerpColor(colorA, colorB, t) // smooth color fade

// Oscillation
sine(phase, amplitude, offset)   // Math.sin with scale
saw(phase, amplitude, offset)    // sawtooth wave

// Procedural
noise(x, y, seed)           // Perlin-like noise

// Timeline
new Timeline()
  .addKeyframe(0, 0, Easing.linear)
  .addKeyframe(500, 100, Easing.easeOutCubic)
  .addKeyframe(1000, 50, Easing.easeInQuad)
  .evaluate(time)            // interpolate at any time
```

---

## 🧠 Animation Design Patterns

### Pattern 1: Expandable Rings

```typescript
for (let ring = 0; ring < numRings; ring++) {
  const t = (time / duration) + ring * delayPerRing
  const alpha = (1 - t) * maxAlpha
  const radius = startRadius + t * expandDistance
  // draw circle
}
```

### Pattern 2: Rotating Segments

```typescript
const segmentCount = N
for (let i = 0; i < segmentCount; i++) {
  const angle = (i / segmentCount) * Math.PI * 2 + rotation
  const x = cx + radius * Math.cos(angle)
  const y = cy + radius * Math.sin(angle)
  // draw at (x, y)
}
```

### Pattern 3: Age-Based Decay

```typescript
for (const particle of particles) {
  const ageFraction = particle.age / particle.maxAge  // 0→1
  const alpha = (1 - ageFraction) * maxAlpha
  const size = startSize * (1 - ageFraction * 0.5)
  // draw with alpha & size
}
```

### Pattern 4: Color Cycling

```typescript
const colorPhase = (time / duration + position) % 1.0
const colorIndex = Math.floor(colorPhase * colors.length)
const color = colors[colorIndex % colors.length]
```

### Pattern 5: Eased Keyframes

```typescript
if (time < t1) {
  const local = time / t1
  value = lerp(v0, v1, Easing.easeOutCubic(local))
} else if (time < t2) {
  const local = (time - t1) / (t2 - t1)
  value = lerp(v1, v2, Easing.easeInQuad(local))
}
```

---

## 📊 Performance Tips

### ✅ Do This (Fast)
```typescript
// Pre-calculate once per frame
const cos = Math.cos(angle)
const sin = Math.sin(angle)

// Reuse in loop
for (let i = 0; i < 100; i++) {
  const x = cos * values[i]
  const y = sin * values[i]
}
```

### ❌ Avoid This (Slow)
```typescript
for (let i = 0; i < 100; i++) {
  const cos = Math.cos(angle)  // recalculate every iteration
  const sin = Math.sin(angle)
  const x = cos * values[i]
  const y = sin * values[i]
}
```

### ✅ Optimize Arrays
```typescript
// Pre-allocate
const trails: TrailPoint[] = []

// Reuse instead of allocate
if (trails.length > MAX) {
  trails.shift()  // remove oldest
}
trails.push(newPoint)
```

---

## 🎨 Create Your Own Effect

**Template:**

```typescript
import { HandEffect } from './Effect'
import { HandTopology } from './HandTopology'
import type { TrackedHand } from './TrackingTypes'
import type { DrawCommand } from './DrawCommand'
import { Easing, lerp, sine } from './AnimationUtils'

export class MyEffect implements HandEffect {
  readonly id = 'my_effect_v1'
  private startTimeMs = Date.now()

  draw(hand: TrackedHand, w: number, h: number, intensity: number): DrawCommand[] {
    const lm = hand.landmarks
    const now = Date.now()
    const elapsed = now - this.startTimeMs
    const phase = (elapsed % 2000) / 2000  // 2-second cycle

    const commands: DrawCommand[] = []
    const clamped = Math.max(0, Math.min(1, intensity))

    // Get key points
    const wrist = lm[HandTopology.WRIST]
    const cx = wrist.x * w
    const cy = wrist.y * h

    // Your animation code here
    // Use Easing, lerp, sine from AnimationUtils
    // Push DrawCommands

    return commands
  }
}
```

**3 lines → fully animated custom effect!**

---

**Ready to code?** Pick a simple effect like `TrailEffect.ts` or `GlowPulseEffect.ts` and modify!
