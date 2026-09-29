/** Small shared helpers for effects. */
import type { Point2 } from '../handGeometry'
import type { CanvasSize } from '../TrackingTypes'

export const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n)
export const rand = (min: number, max: number): number => min + Math.random() * (max - min)
export const easeOut = (t: number): number => 1 - (1 - t) * (1 - t)

/** Frame delta clamped so physics never jumps after a stalled tab. */
export const clampDt = (dtMs: number): number => Math.min(Math.max(dtMs, 0), 64)

/** Extend a ray from `origin` in unit direction `dir` until it hits the canvas edge. */
export function projectToEdge(origin: Point2, dir: Point2, size: CanvasSize): Point2 {
  let best = Infinity
  if (dir.x > 0) best = Math.min(best, (size.width - origin.x) / dir.x)
  else if (dir.x < 0) best = Math.min(best, -origin.x / dir.x)
  if (dir.y > 0) best = Math.min(best, (size.height - origin.y) / dir.y)
  else if (dir.y < 0) best = Math.min(best, -origin.y / dir.y)
  if (!isFinite(best) || best < 0) best = Math.hypot(size.width, size.height)
  return { x: origin.x + dir.x * best, y: origin.y + dir.y * best }
}

/**
 * A jagged lightning polyline from `a` to `b`: the straight line split into
 * segments, each interior point pushed sideways by up to `jitter` pixels.
 */
export function jaggedBolt(a: Point2, b: Point2, segments: number, jitter: number): Point2[] {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy) || 1
  const nx = -dy / len
  const ny = dx / len
  const pts: Point2[] = [a]
  for (let i = 1; i < segments; i++) {
    const t = i / segments
    // Taper the jitter toward both ends so the bolt stays attached.
    const k = Math.sin(Math.PI * t) * rand(-jitter, jitter)
    pts.push({ x: a.x + dx * t + nx * k, y: a.y + dy * t + ny * k })
  }
  pts.push(b)
  return pts
}

/**
 * Heart outline placed so its top dip sits at `dip` and its bottom point at
 * `tip` (the classic parametric heart, rotated to follow dip → tip).
 */
export function heartBetween(dip: Point2, tip: Point2, steps = 40): Point2[] {
  // Parametric heart: dip at y = -5, bottom tip at y = +17 (y down), 22 units apart.
  const span = Math.hypot(tip.x - dip.x, tip.y - dip.y) || 1
  const k = span / 22
  const angle = Math.atan2(tip.x - dip.x, tip.y - dip.y) // rotation from "straight down"
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const pts: Point2[] = []
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2
    const hx = 16 * Math.sin(t) ** 3
    const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t))
    // Local frame: origin at the dip.
    const lx = hx * k
    const ly = (hy + 5) * k
    pts.push({ x: dip.x + lx * cos + ly * sin, y: dip.y - lx * sin + ly * cos })
  }
  return pts
}

/** A small heart centered at (cx, cy) with total height ≈ `size`. */
export function heartAt(cx: number, cy: number, size: number): Point2[] {
  const half = size / 2
  return heartBetween({ x: cx, y: cy - half * 0.45 }, { x: cx, y: cy + half * 0.55 }, 20)
}

/** Five-point star path. */
export function star(cx: number, cy: number, outer: number, inner: number, rot: number): Point2[] {
  const pts: Point2[] = []
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner
    const a = rot + (i * Math.PI) / 5 - Math.PI / 2
    pts.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r })
  }
  return pts
}
