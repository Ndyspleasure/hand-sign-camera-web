import { rgba, type DrawCommand } from '../DrawCommand'
import type { HandEffect } from '../Effect'
import { direction, handScale } from '../handGeometry'
import { HandLandmark } from '../HandTopology'
import type { CanvasSize, TrackedHand } from '../TrackingTypes'
import { clampDt, projectToEdge } from './fx'

const BEAMS: { pip: number; tip: number; color: number }[] = [
  { pip: HandLandmark.INDEX_PIP, tip: HandLandmark.INDEX_TIP, color: rgba(255, 60, 70, 0.85) },
  { pip: HandLandmark.MIDDLE_PIP, tip: HandLandmark.MIDDLE_TIP, color: rgba(60, 255, 110, 0.85) },
  { pip: HandLandmark.RING_PIP, tip: HandLandmark.RING_TIP, color: rgba(70, 140, 255, 0.85) },
]

/**
 * THREE — red, green and blue beams shoot from the three raised fingertips.
 * Additive blending mixes them toward white where they overlap.
 */
export class TriBeamEffect implements HandEffect {
  readonly id = 'tri-beam'
  private time = 0

  step(hands: TrackedHand[], size: CanvasSize, dtMs: number): DrawCommand[] {
    this.time += clampDt(dtMs)
    const cmds: DrawCommand[] = []

    for (const hand of hands) {
      const lm = hand.landmarks
      if (lm.length < 21) continue
      const s = handScale(lm)
      BEAMS.forEach(({ pip, tip, color }, k) => {
        const p = lm[tip]
        const end = projectToEdge(p, direction(lm[pip], p), size)
        const wobble = 1 + 0.18 * Math.sin(this.time * 0.02 + k * 2)
        cmds.push({ kind: 'line', x1: p.x, y1: p.y, x2: end.x, y2: end.y, width: s * 0.075 * wobble, color, glow: 12, blend: 'add' })
        cmds.push({ kind: 'line', x1: p.x, y1: p.y, x2: end.x, y2: end.y, width: 1.6, color: rgba(255, 255, 255, 0.9), blend: 'add' })
        cmds.push({ kind: 'circle', x: p.x, y: p.y, radius: s * 0.08, color, fill: true, glow: 14, blend: 'add' })
      })
    }
    return cmds
  }
}
