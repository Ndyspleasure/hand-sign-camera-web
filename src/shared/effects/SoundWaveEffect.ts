import { hsla, type DrawCommand } from '../DrawCommand'
import type { HandEffect } from '../Effect'
import { handScale, palmCenter } from '../handGeometry'
import { HandLandmark } from '../HandTopology'
import type { CanvasSize, TrackedHand } from '../TrackingTypes'
import { clampDt } from './fx'

interface Wave {
  x: number
  y: number
  angle: number
  scale: number
  age: number
}

const EMIT_MS = 300
const LIFE_MS = 1000
const SPREAD = 0.6 // radians either side of the wave direction

/**
 * CALL_ME — "on the phone": green sound-wave arcs pulse outward from the thumb
 * (earpiece) and pinky (mouthpiece), pointing away from the palm.
 */
export class SoundWaveEffect implements HandEffect {
  readonly id = 'sound-wave'
  private waves: Wave[] = []
  private emitTimer = EMIT_MS

  step(hands: TrackedHand[], _size: CanvasSize, dtMs: number): DrawCommand[] {
    const dt = clampDt(dtMs)
    this.emitTimer = hands.length === 0 ? EMIT_MS : this.emitTimer + dt
    const emit = this.emitTimer >= EMIT_MS
    if (emit) this.emitTimer = 0

    for (const hand of hands) {
      const lm = hand.landmarks
      if (lm.length < 21 || !emit || this.waves.length > 40) continue
      const s = handScale(lm)
      const c = palmCenter(lm)
      for (const tip of [HandLandmark.THUMB_TIP, HandLandmark.PINKY_TIP]) {
        const p = lm[tip]
        this.waves.push({ x: p.x, y: p.y, angle: Math.atan2(p.y - c.y, p.x - c.x), scale: s, age: 0 })
      }
    }

    const cmds: DrawCommand[] = []
    const alive: Wave[] = []
    for (const w of this.waves) {
      w.age += dt
      const t = w.age / LIFE_MS
      if (t >= 1) continue
      alive.push(w)
      cmds.push({
        kind: 'arc', x: w.x, y: w.y, radius: w.scale * (0.15 + 1.3 * t),
        start: w.angle - SPREAD, end: w.angle + SPREAD,
        width: 4 * (1 - t) + 1, color: hsla(145, 85, 60, 1 - t), glow: 8, blend: 'add',
      })
    }
    this.waves = alive
    return cmds
  }
}
