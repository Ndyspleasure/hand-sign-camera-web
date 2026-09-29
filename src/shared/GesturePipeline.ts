import { Gesture } from './Gesture'
import { GeometricGestureRecognizer } from './GeometricGestureRecognizer'
import { GestureStabilizer } from './GestureStabilizer'
import type { Landmark, TrackedHand } from './TrackingTypes'
import { WaveDetector } from './WaveDetector'

/** Project normalized MediaPipe landmarks into mirrored canvas pixel space. */
export function projectHand(hand: TrackedHand, width: number, height: number): TrackedHand {
  return {
    ...hand,
    landmarks: hand.landmarks.map<Landmark>((lm) => ({
      x: (1 - lm.x) * width,
      y: lm.y * height,
      z: lm.z * width,
    })),
  }
}

/** Stable per-hand keys: MediaPipe's handedness when unambiguous, else screen order. */
export function handKeys(hands: TrackedHand[]): string[] {
  const labels = hands.map((h) => h.handedness)
  const unique = new Set(labels).size === labels.length && !labels.includes('Unknown')
  return unique ? labels : hands.map((_, i) => `hand${i}`)
}

export interface PipelineResult {
  /** Stabilized gesture of each hand, in the order given. */
  gestures: Gesture[]
  /** Stabilized two-hand gesture, or NONE. */
  twoHand: Gesture
}

/**
 * Per-frame gesture recognition for up to two hands: static pose → wave
 * motion → debounce, then the two-hand gesture from the pair. Hands must be
 * in pixel space, ordered left → right on screen.
 */
export class GesturePipeline {
  private readonly recognizer = new GeometricGestureRecognizer()
  private readonly stabilizer = new GestureStabilizer()
  private readonly wave = new WaveDetector()

  process(hands: TrackedHand[], keys: string[], ts: number): PipelineResult {
    const gestures = hands.map((hand, i) => {
      let raw = this.recognizer.recognize(hand)
      if (this.wave.update(keys[i], hand, raw, ts)) raw = Gesture.WAVE
      return this.stabilizer.update(keys[i], raw, ts)
    })
    const rawPair =
      hands.length >= 2
        ? this.recognizer.recognizeTwoHands(hands[0], hands[1], gestures[0], gestures[1])
        : Gesture.NONE
    const twoHand = this.stabilizer.update('pair', rawPair, ts)
    this.wave.prune(keys)
    this.stabilizer.prune([...keys, 'pair'])
    return { gestures, twoHand }
  }
}
