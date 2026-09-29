import { hsla, rgba, type DrawCommand } from '../DrawCommand'
import type { HandEffect } from '../Effect'
import { dist, handScale } from '../handGeometry'
import { HandLandmark } from '../HandTopology'
import type { CanvasSize, TrackedHand } from '../TrackingTypes'
import { clampDt } from './fx'

interface TrailPoint {
  x: number
  y: number
  t: number
}

const TRAIL_MS = 450
const TIPS = [HandLandmark.INDEX_TIP, HandLandmark.MIDDLE_TIP]

/**
 * PEACE — the two raised fingertips leave colorful, fading rainbow ribbons as
 * they move. Additive blending makes overlapping colors glow.
 */
export class RainbowTrailEffect implements HandEffect {
  readonly id = 'rainbow-trail'
  private trails = new Map<string, TrailPoint[]>()
  private time = 0

  step(hands: TrackedHand[], _size: CanvasSize, dtMs: number): DrawCommand[] {
    this.time += clampDt(dtMs)
    const now = this.time
    const cmds: DrawCommand[] = []

    hands.forEach((hand, h) => {
      const lm = hand.landmarks
      if (lm.length < 21) return
      const s = handScale(lm)
      TIPS.forEach((tip, k) => {
        const key = `${h}:${k}`
        const trail = this.trails.get(key) ?? []
        const p = lm[tip]
        const last = trail[trail.length - 1]
        // Hands can swap order between frames; restart instead of drawing a jump.
        if (last && dist(last, p) > s * 1.5) trail.length = 0
        trail.push({ x: p.x, y: p.y, t: now })
        this.trails.set(key, trail)

        cmds.push({ kind: 'circle', x: p.x, y: p.y, radius: s * 0.07, color: rgba(255, 255, 255, 0.95), fill: true, glow: 12 })
      })
    })

    for (const [key, trail] of this.trails) {
      while (trail.length > 0 && now - trail[0].t > TRAIL_MS) trail.shift()
      if (trail.length < 2) {
        if (trail.length === 0) this.trails.delete(key)
        continue
      }
      const offset = key.endsWith(':1') ? 180 : 0
      for (let i = 1; i < trail.length; i++) {
        const a = trail[i - 1]
        const b = trail[i]
        const f = 1 - (now - b.t) / TRAIL_MS
        const hue = now * 0.25 + i * 14 + offset
        cmds.push({
          kind: 'line', x1: a.x, y1: a.y, x2: b.x, y2: b.y,
          width: 2 + 16 * f, color: hsla(hue, 100, 60, f), blend: 'add',
        })
      }
    }

    return cmds
  }
}
