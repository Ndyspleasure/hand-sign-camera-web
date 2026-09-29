import { rgba, type DrawCommand } from '../DrawCommand'
import type { HandEffect } from '../Effect'
import { handScale } from '../handGeometry'
import { HAND_CONNECTIONS } from '../HandTopology'
import type { CanvasSize, TrackedHand } from '../TrackingTypes'

const BONE = rgba(170, 225, 240, 0.5)
const JOINT = rgba(215, 245, 252, 0.8)

/**
 * Thin tracking wireframe drawn under every hand, so a tracked hand is always
 * visible even before (or between) gestures. Cheap: no glow, no state.
 */
export class WireframeEffect implements HandEffect {
  readonly id = 'wireframe'

  step(hands: TrackedHand[], _size: CanvasSize, _dtMs: number): DrawCommand[] {
    const cmds: DrawCommand[] = []
    for (const hand of hands) {
      const lm = hand.landmarks
      if (lm.length < 21) continue
      const w = Math.max(1.2, handScale(lm) * 0.014)
      for (const [a, b] of HAND_CONNECTIONS) {
        cmds.push({ kind: 'line', x1: lm[a].x, y1: lm[a].y, x2: lm[b].x, y2: lm[b].y, color: BONE, width: w })
      }
      for (const p of lm) {
        cmds.push({ kind: 'circle', x: p.x, y: p.y, radius: w * 1.6, color: JOINT, fill: true })
      }
    }
    return cmds
  }
}
