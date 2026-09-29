import type { DrawCommand } from './DrawCommand'
import type { EffectId } from './effectMap'
import type { CanvasSize, TrackedHand } from './TrackingTypes'

/**
 * A visual effect. Effects may keep internal state across frames (e.g. particle
 * systems), so `step` receives the frame delta and returns the draw commands
 * for the current frame. The engine steps every effect every frame — with an
 * empty `hands` list when inactive — so particles can finish fading out.
 */
export interface HandEffect {
  readonly id: EffectId
  /**
   * Advance the effect by `dtMs` and produce draw commands for `hands`.
   * @param hands  Tracked hands in canvas pixel space (empty when inactive).
   * @param size   Canvas dimensions.
   * @param dtMs   Milliseconds since the previous frame.
   */
  step(hands: TrackedHand[], size: CanvasSize, dtMs: number): DrawCommand[]
}
