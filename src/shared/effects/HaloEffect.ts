import { hsla, rgba, type DrawCommand } from '../DrawCommand'
import type { HandEffect } from '../Effect'
import { handScale, midpoint } from '../handGeometry'
import { HandLandmark } from '../HandTopology'
import type { CanvasSize, TrackedHand } from '../TrackingTypes'
import { clampDt } from './fx'

const DOTS = 6

/**
 * OK — a glowing violet halo forms around the thumb-index ring, with a pulsing
 * outer ring and orbiting light dots.
 */
export class HaloEffect implements HandEffect {
  readonly id = 'halo'
  private time = 0

  step(hands: TrackedHand[], _size: CanvasSize, dtMs: number): DrawCommand[] {
    this.time += clampDt(dtMs)
    const cmds: DrawCommand[] = []

    for (const hand of hands) {
      const lm = hand.landmarks
      if (lm.length < 21) continue
      const s = handScale(lm)
      const c = midpoint(lm[HandLandmark.THUMB_TIP], lm[HandLandmark.INDEX_TIP])
      const r = s * 0.3
      const pulse = 1 + 0.1 * Math.sin(this.time * 0.006)

      cmds.push({ kind: 'circle', x: c.x, y: c.y, radius: r, fill: false, width: 4, color: hsla(280, 95, 70, 0.95), glow: 16 })
      cmds.push({ kind: 'circle', x: c.x, y: c.y, radius: r * 1.9 * pulse, fill: false, width: 1.5, color: hsla(290, 90, 75, 0.4) })
      cmds.push({ kind: 'circle', x: c.x, y: c.y, radius: r * 0.3, fill: true, color: rgba(255, 255, 255, 0.85), blend: 'add' })

      for (let k = 0; k < DOTS; k++) {
        const angle = this.time * 0.004 + (k * Math.PI * 2) / DOTS
        cmds.push({
          kind: 'circle',
          x: c.x + Math.cos(angle) * r * 2.6,
          y: c.y + Math.sin(angle) * r * 2.6,
          radius: s * 0.05,
          fill: true,
          color: hsla(270 + k * 15, 100, 75, 0.95),
          glow: 10,
        })
      }
    }
    return cmds
  }
}
