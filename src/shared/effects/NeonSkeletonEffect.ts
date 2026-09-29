import { Colors, withAlpha, type DrawCommand } from '../DrawCommand'
import type { HandEffect } from '../Effect'
import { handScale, palmCenter } from '../handGeometry'
import { FINGERTIPS, HAND_CONNECTIONS } from '../HandTopology'
import type { CanvasSize, TrackedHand } from '../TrackingTypes'

/**
 * OPEN_PALM — aqua-teal glowing skeleton: each bone drawn as a wide glowing
 * line with a thin white core, a dot at every joint, and a pulsing aura ring
 * around the palm.
 */
export class NeonSkeletonEffect implements HandEffect {
  readonly id = 'neon-skeleton'
  private time = 0

  step(hands: TrackedHand[], _size: CanvasSize, dtMs: number): DrawCommand[] {
    this.time += dtMs
    const cmds: DrawCommand[] = []

    for (const hand of hands) {
      const lm = hand.landmarks
      if (lm.length < 21) continue
      const s = handScale(lm)
      const c = palmCenter(lm)
      const pulse = 1 + 0.08 * Math.sin(this.time * 0.006)

      // Palm aura.
      cmds.push({
        kind: 'circle', x: c.x, y: c.y, radius: s * 0.95 * pulse,
        color: withAlpha(Colors.NEON, 0.4), fill: false, width: 3, glow: 14,
      })

      // Bones — outer glow + white core.
      for (const [a, b] of HAND_CONNECTIONS) {
        cmds.push({
          kind: 'line', x1: lm[a].x, y1: lm[a].y, x2: lm[b].x, y2: lm[b].y,
          color: Colors.NEON, width: 7, glow: 14,
        })
        cmds.push({
          kind: 'line', x1: lm[a].x, y1: lm[a].y, x2: lm[b].x, y2: lm[b].y,
          color: Colors.NEON_CORE, width: 2,
        })
      }

      // Joint dots.
      for (let i = 0; i < lm.length; i++) {
        const isTip = (FINGERTIPS as readonly number[]).includes(i)
        cmds.push({
          kind: 'circle', x: lm[i].x, y: lm[i].y, radius: isTip ? 6 : 4,
          color: Colors.NEON, fill: true, glow: isTip ? 16 : 8,
        })
      }
    }

    return cmds
  }
}
