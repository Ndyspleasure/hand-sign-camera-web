import { HandLandmark } from './HandTopology'
import type { Landmark } from './TrackingTypes'

export interface Point2 {
  x: number
  y: number
}

export function dist(a: Point2, b: Point2): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/** Characteristic hand size (wrist → middle-finger knuckle). Never 0. */
export function handScale(lm: Landmark[]): number {
  return dist(lm[HandLandmark.WRIST], lm[HandLandmark.MIDDLE_MCP]) || 1
}

/** Center of the palm (average of the wrist and the four finger knuckles). */
export function palmCenter(lm: Landmark[]): Point2 {
  const ids = [
    HandLandmark.WRIST,
    HandLandmark.INDEX_MCP,
    HandLandmark.MIDDLE_MCP,
    HandLandmark.RING_MCP,
    HandLandmark.PINKY_MCP,
  ]
  let x = 0
  let y = 0
  for (const i of ids) {
    x += lm[i].x
    y += lm[i].y
  }
  return { x: x / ids.length, y: y / ids.length }
}

export function midpoint(a: Point2, b: Point2): Point2 {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
}

/** Unit direction from `from` to `to` (defaults to "up" if degenerate). */
export function direction(from: Point2, to: Point2): Point2 {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.hypot(dx, dy)
  return len > 1e-6 ? { x: dx / len, y: dy / len } : { x: 0, y: -1 }
}
