import { hsla, rgba, type DrawCommand } from '../DrawCommand'
import type { HandEffect } from '../Effect'
import { handScale, palmCenter } from '../handGeometry'
import type { CanvasSize, TrackedHand } from '../TrackingTypes'
import { clampDt, easeOut } from './fx'

interface Ring {
  x: number
  y: number
  scale: number
  age: number
}

const EMIT_MS = 420
const LIFE_MS = 900

/**
 * FIST — a charged glowing core in the fist that fires expanding amber
 * shockwave rings. Rings stay where they were emitted and keep expanding
 * after the fist opens.
 */
export class ShockwaveEffect implements HandEffect {
  readonly id = 'shockwave'
  private rings: Ring[] = []
  private emitTimer = EMIT_MS // fire immediately on the first fist frame
  private time = 0

  step(hands: TrackedHand[], _size: CanvasSize, dtMs: number): DrawCommand[] {
    const dt = clampDt(dtMs)
    this.time += dt
    const cmds: DrawCommand[] = []

    if (hands.length === 0) this.emitTimer = EMIT_MS
    else this.emitTimer += dt

    const emit = this.emitTimer >= EMIT_MS
    if (emit) this.emitTimer = 0

    for (const hand of hands) {
      const lm = hand.landmarks
      if (lm.length < 21) continue
      const s = handScale(lm)
      const c = palmCenter(lm)
      if (emit && this.rings.length < 14) this.rings.push({ x: c.x, y: c.y, scale: s, age: 0 })

      const charge = 0.75 + 0.25 * Math.sin(this.time * 0.02)
      cmds.push({
        kind: 'circle', x: c.x, y: c.y, radius: s * 0.55 * charge,
        color: hsla(30, 100, 55, 0.35), fill: true, glow: 22, blend: 'add',
      })
      cmds.push({ kind: 'circle', x: c.x, y: c.y, radius: s * 0.16, color: rgba(255, 240, 210, 0.9), fill: true })
    }

    const alive: Ring[] = []
    for (const r of this.rings) {
      r.age += dt
      const t = r.age / LIFE_MS
      if (t >= 1) continue
      alive.push(r)
      const radius = r.scale * (0.6 + 3.2 * easeOut(t))
      const a = Math.pow(1 - t, 1.5)
      cmds.push({
        kind: 'circle', x: r.x, y: r.y, radius, fill: false,
        width: 6 * (1 - t) + 1, color: hsla(32, 100, 58, a), glow: 10, blend: 'add',
      })
      cmds.push({
        kind: 'circle', x: r.x, y: r.y, radius: radius * 0.92, fill: false,
        width: 1.5, color: rgba(255, 255, 255, a * 0.8),
      })
    }
    this.rings = alive
    return cmds
  }
}
