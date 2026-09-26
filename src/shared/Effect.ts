import type { DrawCommand } from './DrawCommand'
import type { CanvasSize, TrackedHand } from './TrackingTypes'

/**
 * A visual effect. Effects may keep internal state across frames (e.g. particle
 * systems), so `step` receives the frame delta and returns the draw commands
 * for the current frame.
 */
export interface HandEffect {
  readonly id: string
  /**
   * Advance the effect by `dtMs` and produce draw commands for `hands`.
   * @param hands  Tracked hands in canvas pixel space.
   * @param size   Canvas dimensions.
   * @param dtMs   Milliseconds since the previous frame.
   */
  step(hands: TrackedHand[], size: CanvasSize, dtMs: number): DrawCommand[]
}
