import { rgba, type DrawCommand } from '../DrawCommand'
import type { HandEffect } from '../Effect'
import { handScale, palmCenter } from '../handGeometry'
import type { CanvasSize, TrackedHand } from '../TrackingTypes'
import { clampDt, rand } from './fx'

interface Drop {
  x: number
  y: number
  vy: number
  len: number
}

const CLOUD = rgba(118, 132, 158, 0.9)
const CLOUD_SHADE = rgba(88, 100, 124, 0.9)
const DROP = rgba(125, 195, 255, 0.85)
const EMIT_MS = 22
const MAX_DROPS = 170

/** Puff layout of the cloud: [dx, dy, radius] in hand-scale units. */
const PUFFS: [number, number, number][] = [
  [-0.55, 0.05, 0.36],
  [-0.2, -0.18, 0.46],
  [0.25, -0.12, 0.44],
  [0.6, 0.05, 0.34],
  [0, 0.1, 0.42],
]

/** THUMBS_DOWN — a gloomy rain cloud hovers above the hand and pours rain. */
export class RainEffect implements HandEffect {
  readonly id = 'rain'
  private drops: Drop[] = []
  private emitTimer = 0

  step(hands: TrackedHand[], size: CanvasSize, dtMs: number): DrawCommand[] {
    const dt = clampDt(dtMs)
    this.emitTimer += dt
    const emit = this.emitTimer >= EMIT_MS
    if (emit) this.emitTimer = 0
    const cloudCmds: DrawCommand[] = []

    for (const hand of hands) {
      const lm = hand.landmarks
      if (lm.length < 21) continue
      const s = handScale(lm)
      let top = Infinity
      for (const p of lm) top = Math.min(top, p.y)
      const cx = palmCenter(lm).x
      const cy = top - s * 0.85

      for (const [dx, dy, r] of PUFFS) {
        cloudCmds.push({ kind: 'circle', x: cx + dx * s, y: cy + dy * s + s * 0.06, radius: r * s, color: CLOUD_SHADE, fill: true })
      }
      for (const [dx, dy, r] of PUFFS) {
        cloudCmds.push({ kind: 'circle', x: cx + dx * s, y: cy + dy * s, radius: r * s * 0.95, color: CLOUD, fill: true })
      }

      if (emit) {
        for (let i = 0; i < 2 && this.drops.length < MAX_DROPS; i++) {
          this.drops.push({ x: cx + rand(-0.75, 0.75) * s, y: cy + s * 0.3, vy: rand(0.55, 0.85), len: s * rand(0.12, 0.22) })
        }
      }
    }

    const dropCmds: DrawCommand[] = []
    const alive: Drop[] = []
    for (const d of this.drops) {
      d.y += d.vy * dt
      if (d.y > size.height) continue
      alive.push(d)
      dropCmds.push({ kind: 'line', x1: d.x, y1: d.y, x2: d.x - d.len * 0.08, y2: d.y + d.len, color: DROP, width: 2 })
    }
    this.drops = alive
    // Rain falls from behind the cloud.
    return [...dropCmds, ...cloudCmds]
  }
}
