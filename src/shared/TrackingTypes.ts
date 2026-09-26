/** Core hand-tracking data types (platform-agnostic). */

/** A single landmark point. In this app landmarks are stored in canvas pixel space. */
export interface Landmark {
  x: number
  y: number
  z: number
}

export type Handedness = 'Left' | 'Right' | 'Unknown'

/** One detected hand. */
export interface TrackedHand {
  /** 21 landmarks, ordered per {@link HandTopology}. */
  landmarks: Landmark[]
  handedness: Handedness
  /** Detection confidence 0..1. */
  score: number
}

/** Result of a single tracking pass over one video frame. */
export interface HandTrackingResult {
  hands: TrackedHand[]
  /** Inference time in milliseconds. */
  inferenceMs: number
}

/** Canvas / drawing surface dimensions in pixels. */
export interface CanvasSize {
  width: number
  height: number
}
