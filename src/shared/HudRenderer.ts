import { Gesture, gestureLabel } from './Gesture'

export interface HudState {
  tracking: boolean
  handCount: number
  gesture: Gesture
  activeEffectId: string
  inferenceMs: number
  fps: number
  lastEvent: Gesture
}

/**
 * Produces a live text readout of the tracking pipeline (status, detected
 * gesture, active effect, inference time, FPS). Returned as plain lines so the
 * UI can render them crisply as DOM text.
 */
export class HudRenderer {
  render(state: HudState): string[] {
    return [
      `STATUS   ${state.tracking ? '● TRACKING' : '○ NO HAND'}`,
      `HANDS    ${state.handCount}`,
      `GESTURE  ${gestureLabel(state.gesture)}`,
      `EFFECT   ${state.activeEffectId}`,
      `INFER    ${state.inferenceMs.toFixed(1)} ms`,
      `FPS      ${state.fps.toFixed(0)}`,
      `LAST EVT ${gestureLabel(state.lastEvent)}`,
    ]
  }
}
