import { hsla, type DrawCommand } from '../DrawCommand'
import type { HandEffect } from '../Effect'
import { handScale, palmCenter } from '../handGeometry'
import type { CanvasSize, TrackedHand } from '../TrackingTypes'
import { clampDt } from './fx'

interface Ripple {
  x: number
  y: number
  scale: number
  age: number
}

interface TrailPoint {
  x: number
  y: number
  t: number
}

const EMIT_MS = 90
const LIFE_MS = 1100
const TRAIL_MS = 500

/** WAVE (👋) — a waving palm leaves water ripples and a flowing trail behind it. */
export class RippleEffect implements HandEffect {
  readonly id = 'ripple'
  private ripples: Ripple[] = []
  private trail: TrailPoint[] = []
  private emitTimer = EMIT_MS
  private time = 0

  step(hands: TrackedHand[], _size: CanvasSize, dtMs: number): DrawCommand[] {
    const dt = clampDt(dtMs)
    this.time += dt
    this.emitTimer = hands.length === 0 ? EMIT_MS : this.emitTimer + dt
    const emit = this.emitTimer >= EMIT_MS
    if (emit) this.emitTimer = 0

    for (const hand of hands) {
      const lm = hand.landmarks
      if (lm.length < 21) continue
      const s = handScale(lm)
      const c = palmCenter(lm)
      if (emit && this.ripples.length < 24) this.ripples.push({ x: c.x, y: c.y, scale: s, age: 0 })
      this.trail.push({ x: c.x, y: c.y, t: this.time })
    }
    while (this.trail.length > 0 && this.time - this.trail[0].t > TRAIL_MS) this.trail.shift()

    const cmds: DrawCommand[] = []
    const alive: Ripple[] = []
    for (const r of this.ripples) {
      r.age += dt
      const t = r.age / LIFE_MS
      if (t >= 1) continue
      alive.push(r)
      const radius = r.scale * (0.3 + 1.6 * t)
      const a = (1 - t) * 0.85
      cmds.push({ kind: 'circle', x: r.x, y: r.y, radius, fill: false, width: 2.5 * (1 - t) + 0.6, color: hsla(190, 90, 70, a), blend: 'add' })
      cmds.push({ kind: 'circle', x: r.x, y: r.y, radius: radius * 0.68, fill: false, width: 1.2, color: hsla(200, 90, 80, a * 0.7), blend: 'add' })
    }
    this.ripples = alive

    for (let i = 1; i < this.trail.length; i++) {
      const a = this.trail[i - 1]
      const b = this.trail[i]
      const f = 1 - (this.time - b.t) / TRAIL_MS
      cmds.push({ kind: 'line', x1: a.x, y1: a.y, x2: b.x, y2: b.y, width: 2 + 12 * f, color: hsla(195, 100, 65, f * 0.8), blend: 'add' })
    }
    return cmds
  }
}
