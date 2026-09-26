import { Colors, type DrawCommand } from './DrawCommand'
import type { HandEffect } from './Effect'
import { FINGERTIPS, HAND_CONNECTIONS } from './HandTopology'
import type { CanvasSize, TrackedHand } from './TrackingTypes'

/**
 * Aqua-teal glowing skeleton: draws each bone twice (a wide glowing outer line
 * and a thin white core) plus a dot at every joint.
 */
export class NeonSkeletonEffect implements HandEffect {
  readonly id = 'neon-skeleton'

  step(hands: TrackedHand[], _size: CanvasSize, _dtMs: number): DrawCommand[] {
    const cmds: DrawCommand[] = []

    for (const hand of hands) {
      const lm = hand.landmarks
      if (lm.length < 21) continue

      // Bones — outer glow + white core.
      for (const [a, b] of HAND_CONNECTIONS) {
        cmds.push({
          kind: 'line',
          x1: lm[a].x, y1: lm[a].y,
          x2: lm[b].x, y2: lm[b].y,
          color: Colors.NEON,
          width: 7,
          glow: 14,
        })
        cmds.push({
          kind: 'line',
          x1: lm[a].x, y1: lm[a].y,
          x2: lm[b].x, y2: lm[b].y,
          color: Colors.NEON_CORE,
          width: 2,
        })
      }

      // Joint dots.
      for (let i = 0; i < lm.length; i++) {
        const isTip = (FINGERTIPS as readonly number[]).includes(i)
        cmds.push({
          kind: 'circle',
          x: lm[i].x, y: lm[i].y,
          radius: isTip ? 6 : 4,
          color: Colors.NEON,
          fill: true,
          glow: isTip ? 16 : 8,
        })
      }
    }

    return cmds
  }
}
