import { FINGERS, HandLandmark } from './HandTopology'
import { Gesture } from './Gesture'
import { dist, handScale } from './handGeometry'
import type { Landmark, TrackedHand } from './TrackingTypes'

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
function isThumbExtended(lm: Landmark[], scale: number): boolean {
  return dist(lm[HandLandmark.THUMB_TIP], lm[HandLandmark.INDEX_MCP]) > scale * 0.6
}

/**
 * Geometric (rule-based) gesture recognizer. Maps the finger-extension pattern
 * of a single hand to one of the supported {@link Gesture} values, and pairs of
 * hands to two-hand gestures.
 */
export class GeometricGestureRecognizer {
  recognize(hand: TrackedHand | undefined): Gesture {
    if (!hand || hand.landmarks.length < 21) return Gesture.NONE
    const lm = hand.landmarks

    // Hand scale normalizes the thumb and pinch thresholds.
    const scale = handScale(lm)

    const thumb = isThumbExtended(lm, scale)
    const index = isExtended(lm, FINGERS.index.tip, FINGERS.index.ref)
    const middle = isExtended(lm, FINGERS.middle.tip, FINGERS.middle.ref)
    const ring = isExtended(lm, FINGERS.ring.tip, FINGERS.ring.ref)
    const pinky = isExtended(lm, FINGERS.pinky.tip, FINGERS.pinky.ref)

    const pinchDist = dist(lm[HandLandmark.THUMB_TIP], lm[HandLandmark.INDEX_TIP])
    const isPinching = pinchDist < scale * 0.4

    // Pinch-based gestures. A closed fist also brings the thumb and index tips
    // together, so only treat it as OK/PINCH when the pose is clearly a pinch
    // (index — and for OK the other fingers — extended). Otherwise fall through
    // so a fist is recognized as FIST instead of firing the spark effect.
    if (isPinching) {
      if (middle && ring && pinky) return Gesture.OK
      if (index) return Gesture.PINCH
    }

    if (index && middle && ring && pinky) return thumb ? Gesture.OPEN_PALM : Gesture.FOUR
    if (index && middle && ring && !pinky) return Gesture.THREE
    if (index && middle && !ring && !pinky) return Gesture.PEACE
    // Horns: thumb tucked = ROCK, thumb out = "I love you".
    if (index && pinky && !middle && !ring) return thumb ? Gesture.ILY : Gesture.ROCK
    if (index && !middle && !ring && !pinky) return Gesture.POINTING

    if (!index && !middle && !ring) {
      if (thumb && pinky) return Gesture.CALL_ME
      if (thumb && !pinky) {
        const up = lm[HandLandmark.THUMB_TIP].y < lm[HandLandmark.WRIST].y
        return up ? Gesture.THUMBS_UP : Gesture.THUMBS_DOWN
      }
      if (!thumb && !pinky) return Gesture.FIST
    }

    return Gesture.NONE
  }

  /**
   * Two-hand gestures, given both hands and their single-hand gestures:
   * - DOUBLE_PALM: both hands show an open palm.
   * - HEART: index tips touch at the top and thumb tips touch at the bottom,
   *   with the wrists apart (which rules out palms pressed together).
   */
  recognizeTwoHands(
    a: TrackedHand | undefined,
    b: TrackedHand | undefined,
    gestureA: Gesture,
    gestureB: Gesture,
  ): Gesture {
    if (!a || !b || a.landmarks.length < 21 || b.landmarks.length < 21) return Gesture.NONE

    if (gestureA === Gesture.OPEN_PALM && gestureB === Gesture.OPEN_PALM) {
      return Gesture.DOUBLE_PALM
    }

    const la = a.landmarks
    const lb = b.landmarks
    const scale = (handScale(la) + handScale(lb)) / 2

    const indexGap = dist(la[HandLandmark.INDEX_TIP], lb[HandLandmark.INDEX_TIP])
    const thumbGap = dist(la[HandLandmark.THUMB_TIP], lb[HandLandmark.THUMB_TIP])
    const wristGap = dist(la[HandLandmark.WRIST], lb[HandLandmark.WRIST])
    const indexY = (la[HandLandmark.INDEX_TIP].y + lb[HandLandmark.INDEX_TIP].y) / 2
    const thumbY = (la[HandLandmark.THUMB_TIP].y + lb[HandLandmark.THUMB_TIP].y) / 2

    if (
      indexGap < scale * 0.7 &&
      thumbGap < scale * 0.7 &&
      thumbY - indexY > scale * 0.45 &&
      wristGap > scale * 0.6
    ) {
      return Gesture.HEART
    }

    return Gesture.NONE
  }
}
