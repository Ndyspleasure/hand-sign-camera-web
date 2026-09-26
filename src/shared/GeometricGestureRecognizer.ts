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
 * reference joint. This is orientation-independent and good enough for the
 * four non-thumb fingers.
 */
function isExtended(lm: Landmark[], tip: number, ref: number): boolean {
  const wrist = lm[HandLandmark.WRIST]
  return dist(lm[tip], wrist) > dist(lm[ref], wrist)
}

/**
 * The thumb needs its own test: the wrist-distance heuristic misreads a tucked
 * thumb (as in a fist) as "extended", which broke FIST detection. Instead treat
 * the thumb as extended only when its tip sticks out away from the index
 * knuckle — small when curled across the palm, large when it points out
 * (thumbs-up / open palm).
 */
function isThumbExtended(lm: Landmark[], handScale: number): boolean {
  return dist(lm[HandLandmark.THUMB_TIP], lm[HandLandmark.INDEX_MCP]) > handScale * 0.6
}

/**
 * Geometric (rule-based) gesture recognizer. Maps the finger-extension pattern
 * of a single hand to one of the supported {@link Gesture} values.
 */
export class GeometricGestureRecognizer {
  recognize(hand: TrackedHand | undefined): Gesture {
    if (!hand || hand.landmarks.length < 21) return Gesture.NONE
    const lm = hand.landmarks

    // Hand scale normalizes the thumb and pinch thresholds.
    const handScale = dist(lm[HandLandmark.WRIST], lm[HandLandmark.MIDDLE_MCP]) || 1

    const thumb = isThumbExtended(lm, handScale)
    const index = isExtended(lm, FINGERS.index.tip, FINGERS.index.ref)
    const middle = isExtended(lm, FINGERS.middle.tip, FINGERS.middle.ref)
    const ring = isExtended(lm, FINGERS.ring.tip, FINGERS.ring.ref)
    const pinky = isExtended(lm, FINGERS.pinky.tip, FINGERS.pinky.ref)

    const pinchDist = dist(lm[HandLandmark.THUMB_TIP], lm[HandLandmark.INDEX_TIP])
    const isPinching = pinchDist < handScale * 0.4

    // Pinch-based gestures. A closed fist also brings the thumb and index tips
    // together, so only treat it as OK/PINCH when the pose is clearly a pinch
    // (index — and for OK the other fingers — extended). Otherwise fall through
    // so a fist is recognized as FIST instead of firing the spark effect.
    if (isPinching) {
      if (middle && ring && pinky) return Gesture.OK
      if (index) return Gesture.PINCH
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
