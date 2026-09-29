/**
 * Platform-agnostic drawing instructions.
 *
 * Effects emit DrawCommand[] instead of touching Canvas directly, so the same
 * effect logic could be rendered by any backend (Canvas 2D here, WebGL or a
 * native surface elsewhere). Colors are 0xAARRGGBB integers.
 */
import type { Point2 } from './handGeometry'

export type ARGB = number

interface CommandStyle {
  color: ARGB
  /** Optional glow/blur radius in pixels. Use sparingly: it is expensive. */
  glow?: number
  /** 'add' = additive (lighter) blending — a cheap glow for particles. */
  blend?: 'add'
}

export interface LineCommand extends CommandStyle {
  kind: 'line'
  x1: number
  y1: number
  x2: number
  y2: number
  width: number
}

export interface CircleCommand extends CommandStyle {
  kind: 'circle'
  x: number
  y: number
  radius: number
  fill: boolean
  /** Stroke width when not filled (default 2). */
  width?: number
}

export interface PathCommand extends CommandStyle {
  kind: 'path'
  points: Point2[]
  closed?: boolean
  fill?: boolean
  /** Stroke width when not filled (default 2). */
  width?: number
}

export interface ArcCommand extends CommandStyle {
  kind: 'arc'
  x: number
  y: number
  radius: number
  /** Radians, clockwise from +x (canvas convention). */
  start: number
  end: number
  width: number
}

export interface TextCommand extends CommandStyle {
  kind: 'text'
  x: number
  y: number
  text: string
  size: number
  font?: 'mono' | 'sans'
}

export type DrawCommand = LineCommand | CircleCommand | PathCommand | ArcCommand | TextCommand

/** Common colors (0xAARRGGBB). */
export const Colors = {
  NEON: 0xff00e5ff,
  NEON_CORE: 0xffffffff,
  LASER: 0xffff2040,
  SPARK: 0xffffd23f,
} as const

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n)

/** Build an ARGB color from 0–255 channels and a 0–1 alpha. */
export function rgba(r: number, g: number, b: number, a = 1): ARGB {
  return ((Math.round(clamp01(a) * 255) << 24) | (r << 16) | (g << 8) | b) >>> 0
}

/** Replace the alpha of an ARGB color (0–1). */
export function withAlpha(color: ARGB, a: number): ARGB {
  return ((Math.round(clamp01(a) * 255) << 24) | (color & 0x00ffffff)) >>> 0
}

/** Build an ARGB color from HSL (h: degrees, s/l: 0–100) and alpha (0–1). */
export function hsla(h: number, s: number, l: number, a = 1): ARGB {
  const sat = clamp01(s / 100)
  const lig = clamp01(l / 100)
  const hue = (((h % 360) + 360) % 360) / 60
  const c = (1 - Math.abs(2 * lig - 1)) * sat
  const x = c * (1 - Math.abs((hue % 2) - 1))
  const m = lig - c / 2
  const [r, g, b] =
    hue < 1 ? [c, x, 0]
    : hue < 2 ? [x, c, 0]
    : hue < 3 ? [0, c, x]
    : hue < 4 ? [0, x, c]
    : hue < 5 ? [x, 0, c]
    : [c, 0, x]
  return rgba(
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
    a,
  )
}
