import { hsla, rgba, type DrawCommand } from '../DrawCommand'
import type { HandEffect } from '../Effect'
import { handScale, palmCenter } from '../handGeometry'
import type { CanvasSize, TrackedHand } from '../TrackingTypes'
import { clampDt, heartAt, rand } from './fx'

interface FloatingHeart {
  x: number
  y: number
  vy: number
  sway: number
  phase: number
  size: number
  hue: number
  age: number
  life: number
}

const EMIT_MS = 95
const MAX_HEARTS = 28

/** ILY (🤟) — pink hearts rise from the hand, swaying and growing as they fade. */
export class HeartsEffect implements HandEffect {
  readonly id = 'hearts'
  private hearts: FloatingHeart[] = []
  private emitTimer = 0

  step(hands: TrackedHand[], _size: CanvasSize, dtMs: number): DrawCommand[] {
    const dt = clampDt(dtMs)
    this.emitTimer += dt
    const emit = this.emitTimer >= EMIT_MS
    if (emit) this.emitTimer = 0

    for (const hand of hands) {
      const lm = hand.landmarks
      if (lm.length < 21 || !emit || this.hearts.length >= MAX_HEARTS) continue
      const s = handScale(lm)
      const c = palmCenter(lm)
      this.hearts.push({
        x: c.x + rand(-0.45, 0.45) * s,
        y: c.y + rand(-0.3, 0.2) * s,
        vy: rand(0.06, 0.12),
        sway: rand(0.15, 0.3) * s,
        phase: rand(0, Math.PI * 2),
        size: s * rand(0.28, 0.42),
        hue: rand(330, 358),
        age: 0,
        life: rand(1600, 2200),
      })
    }

    const cmds: DrawCommand[] = []
    const alive: FloatingHeart[] = []
    for (const h of this.hearts) {
      h.age += dt
      if (h.age >= h.life) continue
      alive.push(h)
      const t = h.age / h.life
      const y = h.y - h.vy * h.age
      const x = h.x + Math.sin(h.phase + h.age * 0.004) * h.sway
      const size = h.size * (0.6 + 0.6 * Math.min(1, t * 3))
      const a = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85
      cmds.push({ kind: 'path', points: heartAt(x, y, size), closed: true, fill: true, color: hsla(h.hue, 90, 62, a), glow: 10 })
      cmds.push({ kind: 'circle', x: x - size * 0.12, y: y - size * 0.12, radius: size * 0.05, fill: true, color: rgba(255, 255, 255, a * 0.8) })
    }
    this.hearts = alive
    return cmds
  }
}
