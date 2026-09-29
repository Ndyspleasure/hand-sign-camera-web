import { Colors, withAlpha, type DrawCommand } from '../DrawCommand'
import type { HandEffect } from '../Effect'
import { direction } from '../handGeometry'
import { HandLandmark } from '../HandTopology'
import type { CanvasSize, TrackedHand } from '../TrackingTypes'
import { projectToEdge } from './fx'

/**
 * POINTING — red laser beam from the index fingertip along the pointing
 * direction (index PIP → TIP) to the edge of the canvas, with a flickering
 * impact burst where it hits.
 */
export class LaserEffect implements HandEffect {
  readonly id = 'laser'
  private time = 0

  step(hands: TrackedHand[], size: CanvasSize, dtMs: number): DrawCommand[] {
    this.time += dtMs
    const cmds: DrawCommand[] = []
    const flicker = 1 + 0.12 * Math.sin(this.time * 0.05)

    for (const hand of hands) {
      const lm = hand.landmarks
      if (lm.length < 21) continue

      const tip = lm[HandLandmark.INDEX_TIP]
      const end = projectToEdge(tip, direction(lm[HandLandmark.INDEX_PIP], tip), size)

      cmds.push({
        kind: 'line', x1: tip.x, y1: tip.y, x2: end.x, y2: end.y,
        color: Colors.LASER, width: 8 * flicker, glow: 24,
      })
      cmds.push({
        kind: 'line', x1: tip.x, y1: tip.y, x2: end.x, y2: end.y,
        color: Colors.NEON_CORE, width: 2, glow: 6,
      })
      // Muzzle flash at the fingertip.
      cmds.push({ kind: 'circle', x: tip.x, y: tip.y, radius: 8, color: Colors.LASER, fill: true, glow: 20 })
      // Impact burst at the edge.
      cmds.push({
        kind: 'circle', x: end.x, y: end.y, radius: 16 * flicker,
        color: withAlpha(Colors.LASER, 0.55), fill: true, glow: 26, blend: 'add',
      })
      cmds.push({ kind: 'circle', x: end.x, y: end.y, radius: 6, color: Colors.NEON_CORE, fill: true })
    }

    return cmds
  }
}
