import { FINGERS, HandLandmark } from './HandTopology'
import { Gesture } from './Gesture'
import type { Landmark, TrackedHand } from './TrackingTypes'

function dist(a: Landmark, b: Landmark): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.hypot(dx, dy)
}

/**
 * A finger is "extended" when its tip is farther from the wrist than its
 * reference joint. This is orientation-independent and good enough for an
 * MVP finger-curl heuristic.
 */
function isExtended(lm: Landmark[], tip: number, ref: number): boolean {
  const wrist = lm[HandLandmark.WRIST]
  return dist(lm[tip], wrist) > dist(lm[ref], wrist)
}

/**
 * Geometric (rule-based) gesture recognizer. Maps the finger-extension pattern
 * of a single hand to one of the supported {@link Gesture} values.
 */
export class GeometricGestureRecognizer {
  recognize(hand: TrackedHand | undefined): Gesture {
    if (!hand || hand.landmarks.length < 21) return Gesture.NONE
    const lm = hand.landmarks

    const thumb = isExtended(lm, FINGERS.thumb.tip, FINGERS.thumb.ref)
    const index = isExtended(lm, FINGERS.index.tip, FINGERS.index.ref)
    const middle = isExtended(lm, FINGERS.middle.tip, FINGERS.middle.ref)
    const ring = isExtended(lm, FINGERS.ring.tip, FINGERS.ring.ref)
    const pinky = isExtended(lm, FINGERS.pinky.tip, FINGERS.pinky.ref)

    // Hand scale used to normalize the pinch threshold.
    const handScale = dist(lm[HandLandmark.WRIST], lm[HandLandmark.MIDDLE_MCP]) || 1
    const pinchDist = dist(lm[HandLandmark.THUMB_TIP], lm[HandLandmark.INDEX_TIP])
    const isPinching = pinchDist < handScale * 0.4

    // Pinch-based gestures take priority.
    if (isPinching) {
      return middle && ring && pinky ? Gesture.OK : Gesture.PINCH
    }

    if (index && middle && ring && pinky && thumb) return Gesture.OPEN_PALM
    if (index && middle && !ring && !pinky) return Gesture.PEACE
    if (index && pinky && !middle && !ring) return Gesture.ROCK
    if (index && !middle && !ring && !pinky) return Gesture.POINTING

    if (thumb && !index && !middle && !ring && !pinky) {
      const up = lm[HandLandmark.THUMB_TIP].y < lm[HandLandmark.WRIST].y
      return up ? Gesture.THUMBS_UP : Gesture.THUMBS_DOWN
    }

    if (!index && !middle && !ring && !pinky && !thumb) return Gesture.FIST

    return Gesture.NONE
  }
}
