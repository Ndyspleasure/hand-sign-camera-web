/**
 * Platform-agnostic drawing instructions.
 *
 * Effects emit DrawCommand[] instead of touching Canvas directly, so the same
 * effect logic could be rendered by any backend (Canvas 2D here, WebGL or a
 * native surface elsewhere). Colors are 0xAARRGGBB integers.
 */

export type ARGB = number

export interface LineCommand {
  kind: 'line'
  x1: number
  y1: number
  x2: number
  y2: number
  color: ARGB
  width: number
  /** Optional glow/blur radius in pixels. */
  glow?: number
}

export interface CircleCommand {
  kind: 'circle'
  x: number
  y: number
  radius: number
  color: ARGB
  fill: boolean
  glow?: number
}

export type DrawCommand = LineCommand | CircleCommand

/** Common colors (0xAARRGGBB). */
export const Colors = {
  NEON: 0xff00e5ff,
  NEON_CORE: 0xffffffff,
  LASER: 0xffff2040,
  SPARK: 0xffffd23f,
} as const
