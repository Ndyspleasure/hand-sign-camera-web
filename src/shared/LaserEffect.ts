import { Colors, type DrawCommand } from './DrawCommand'
import type { HandEffect } from './Effect'
import { HandLandmark } from './HandTopology'
import type { CanvasSize, Landmark, TrackedHand } from './TrackingTypes'

/**
 * Red laser beam emitted from the index fingertip, following the direction the
 * finger points (index PIP → index TIP), extended to the edge of the canvas.
 */
export class LaserEffect implements HandEffect {
  readonly id = 'laser'

  step(hands: TrackedHand[], size: CanvasSize, _dtMs: number): DrawCommand[] {
    const cmds: DrawCommand[] = []

    for (const hand of hands) {
      const lm = hand.landmarks
      if (lm.length < 21) continue

      const tip = lm[HandLandmark.INDEX_TIP]
      const pip = lm[HandLandmark.INDEX_PIP]

      let dx = tip.x - pip.x
      let dy = tip.y - pip.y
      const len = Math.hypot(dx, dy) || 1
      dx /= len
      dy /= len

      const end = projectToEdge(tip, dx, dy, size)

      // Outer glow beam.
      cmds.push({
        kind: 'line',
        x1: tip.x, y1: tip.y,
        x2: end.x, y2: end.y,
        color: Colors.LASER,
        width: 8,
        glow: 24,
      })
      // Hot white core.
      cmds.push({
        kind: 'line',
        x1: tip.x, y1: tip.y,
        x2: end.x, y2: end.y,
        color: Colors.NEON_CORE,
        width: 2,
        glow: 6,
      })
      // Muzzle flash at the fingertip.
      cmds.push({
        kind: 'circle',
        x: tip.x, y: tip.y,
        radius: 8,
        color: Colors.LASER,
        fill: true,
        glow: 20,
      })
    }

    return cmds
  }
}

/** Extend a ray from `origin` in unit direction (dx,dy) until it hits a canvas edge. */
function projectToEdge(
  origin: Landmark,
  dx: number,
  dy: number,
  size: CanvasSize,
): { x: number; y: number } {
  let best = Infinity
  if (dx > 0) best = Math.min(best, (size.width - origin.x) / dx)
  else if (dx < 0) best = Math.min(best, (0 - origin.x) / dx)
  if (dy > 0) best = Math.min(best, (size.height - origin.y) / dy)
  else if (dy < 0) best = Math.min(best, (0 - origin.y) / dy)
  if (!isFinite(best)) best = Math.hypot(size.width, size.height)
  return { x: origin.x + dx * best, y: origin.y + dy * best }
}
