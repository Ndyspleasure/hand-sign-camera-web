import { Gesture } from '../shared/Gesture'
import type { HandPose, TwoHandLayout } from '../hand-svg/handModel'

/**
 * A hand pose for each recognizer gesture, plus how to present it. Curl:
 * 0 = extended, 1 = curled. Poses are built to satisfy the actual
 * GeometricGestureRecognizer rules (unit tests enforce this), so the example on
 * screen is exactly what triggers detection.
 */
export interface GesturePose {
  pose: HandPose
  /** Whole-hand rotation for display (e.g. 180 for thumbs-down). */
  rotate?: number
  /** Motion gestures are demonstrated with movement. */
  motion?: 'wave'
  /** Two-hand gestures: the model hand is mirrored into a pair. */
  twoHand?: TwoHandLayout & { glyph: 'heart' | 'energy' }
}

const f = (curl: number, highlight = false) => ({ curl, highlight })

const OPEN = {
  thumb: f(0, true), index: f(0, true), middle: f(0, true), ring: f(0, true), pinky: f(0, true),
}

export const GESTURE_POSES: Record<Gesture, GesturePose> = {
  [Gesture.NONE]: {
    pose: { thumb: f(0), index: f(0), middle: f(0), ring: f(0), pinky: f(0) },
  },
  [Gesture.OPEN_PALM]: { pose: OPEN },
  [Gesture.FIST]: {
    pose: {
      thumb: f(1, true), index: f(1, true), middle: f(1, true), ring: f(1, true), pinky: f(1, true),
    },
  },
  [Gesture.PEACE]: {
    pose: { thumb: f(0.7), index: f(0, true), middle: f(0, true), ring: f(1), pinky: f(1) },
  },
  [Gesture.THUMBS_UP]: {
    pose: { thumb: f(0, true), index: f(1), middle: f(1), ring: f(1), pinky: f(1) },
  },
  [Gesture.THUMBS_DOWN]: {
    pose: { thumb: f(0, true), index: f(1), middle: f(1), ring: f(1), pinky: f(1) },
    rotate: 180,
  },
  [Gesture.POINTING]: {
    pose: { thumb: f(0.6), index: f(0, true), middle: f(1), ring: f(1), pinky: f(1) },
  },
  [Gesture.OK]: {
    pose: {
      thumb: f(0, true), index: f(0.5, true), middle: f(0), ring: f(0), pinky: f(0),
      // Thumb tip (4) meets index tip (8) to form the "OK" ring.
      overrides: { 4: { x: 74, y: 116 }, 8: { x: 74, y: 116 } },
    },
  },
  [Gesture.ROCK]: {
    pose: { thumb: f(0.7), index: f(0, true), middle: f(1), ring: f(1), pinky: f(0, true) },
  },
  [Gesture.PINCH]: {
    pose: {
      thumb: f(0, true), index: f(0, true), middle: f(1), ring: f(1), pinky: f(1),
      // Index bends toward the thumb; the tips nearly touch (🤏).
      overrides: {
        3: { x: 30, y: 146 },
        4: { x: 38, y: 122 },
        7: { x: 55, y: 98 },
        8: { x: 40, y: 104 },
      },
    },
  },
  [Gesture.CALL_ME]: {
    pose: { thumb: f(0, true), index: f(1), middle: f(1), ring: f(1), pinky: f(0, true) },
  },
  [Gesture.THREE]: {
    pose: { thumb: f(0.8), index: f(0, true), middle: f(0, true), ring: f(0, true), pinky: f(1) },
  },
  [Gesture.FOUR]: {
    pose: {
      thumb: f(0.8), index: f(0, true), middle: f(0, true), ring: f(0, true), pinky: f(0, true),
    },
  },
  [Gesture.ILY]: {
    pose: { thumb: f(0, true), index: f(0, true), middle: f(1), ring: f(1), pinky: f(0, true) },
  },
  [Gesture.WAVE]: { pose: OPEN, motion: 'wave' },
  [Gesture.HEART]: {
    pose: {
      thumb: f(0.2, true), index: f(0.3, true), middle: f(0.7), ring: f(0.7), pinky: f(0.7),
      // Index curves in to meet its mirror at the top; thumb points down to
      // meet its mirror at the bottom — together the pair draws a heart. Each
      // chain stays on its own side of the center line (no crossing).
      overrides: {
        2: { x: 54, y: 196 },
        3: { x: 44, y: 206 },
        4: { x: 30, y: 218 },
        7: { x: 50, y: 98 },
        8: { x: 30, y: 110 },
      },
    },
    twoHand: { width: 400, dx: 170, glyph: 'heart' },
  },
  [Gesture.DOUBLE_PALM]: {
    pose: OPEN,
    twoHand: { width: 440, dx: 230, glyph: 'energy' },
  },
}
