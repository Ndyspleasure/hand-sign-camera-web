import { Gesture } from '../shared/Gesture'
import type { HandPose } from '../hand-svg/handModel'

/**
 * A static hand pose for each recognizer gesture, plus an optional whole-hand
 * rotation for display. Curl: 0 = extended, 1 = curled. Poses are built to
 * mirror what GeometricGestureRecognizer actually detects (finger extension +
 * thumb/index pinch), so the on-screen example matches real detection.
 */
export interface GesturePose {
  pose: HandPose
  rotate?: number
}

const f = (curl: number, highlight = false) => ({ curl, highlight })

export const GESTURE_POSES: Record<Gesture, GesturePose> = {
  [Gesture.NONE]: {
    pose: { thumb: f(0), index: f(0), middle: f(0), ring: f(0), pinky: f(0) },
  },
  [Gesture.OPEN_PALM]: {
    pose: {
      thumb: f(0, true), index: f(0, true), middle: f(0, true), ring: f(0, true), pinky: f(0, true),
    },
  },
  [Gesture.FIST]: {
    pose: {
      thumb: f(1, true), index: f(1, true), middle: f(1, true), ring: f(1, true), pinky: f(1, true),
    },
  },
  [Gesture.PEACE]: {
    pose: {
      thumb: f(0.7), index: f(0, true), middle: f(0, true), ring: f(1), pinky: f(1),
    },
  },
  [Gesture.THUMBS_UP]: {
    pose: {
      thumb: f(0, true), index: f(1), middle: f(1), ring: f(1), pinky: f(1),
    },
  },
  [Gesture.THUMBS_DOWN]: {
    pose: {
      thumb: f(0, true), index: f(1), middle: f(1), ring: f(1), pinky: f(1),
    },
    rotate: 180,
  },
  [Gesture.POINTING]: {
    pose: {
      thumb: f(0.6), index: f(0, true), middle: f(1), ring: f(1), pinky: f(1),
    },
  },
  [Gesture.OK]: {
    pose: {
      thumb: f(0, true), index: f(0.5, true), middle: f(0), ring: f(0), pinky: f(0),
      // Thumb tip (4) meets index tip (8) to form the "OK" ring.
      overrides: { 4: { x: 74, y: 116 }, 8: { x: 74, y: 116 } },
    },
  },
  [Gesture.ROCK]: {
    pose: {
      thumb: f(0.7), index: f(0, true), middle: f(1), ring: f(1), pinky: f(0, true),
    },
  },
  [Gesture.PINCH]: {
    pose: {
      thumb: f(0.15, true), index: f(0.35, true), middle: f(0.25), ring: f(0.25), pinky: f(0.25),
      // Thumb tip (4) and index tip (8) pinched together.
      overrides: { 4: { x: 72, y: 126 }, 8: { x: 72, y: 126 } },
    },
  },
}
