import { Gesture } from './Gesture'
import { handScale, palmCenter } from './handGeometry'
import type { TrackedHand } from './TrackingTypes'

interface Track {
  samples: { t: number; x: number }[]
  waveUntil: number
}

/** Time window inspected for back-and-forth motion. */
const WINDOW_MS = 1400
/** Minimum swing, in hand-scale units, for a direction change to count. */
const AMPLITUDE = 0.4
/** Direction changes needed within the window. */
const REVERSALS = 2
/** How long WAVE stays active after the last detected swing. */
const HOLD_MS = 500

/**
 * Detects the WAVE motion gesture: an open hand swinging side to side. Keeps a
 * short history of the palm's horizontal position per hand (normalized by hand
 * size, so it works at any distance) and counts direction reversals with
 * hysteresis, so jitter or a single sweep across the screen doesn't count.
 */
export class WaveDetector {
  private tracks = new Map<string, Track>()

  /** Returns true while `hand` (identified by `key`) is waving. */
  update(key: string, hand: TrackedHand, staticGesture: Gesture, now: number): boolean {
    let track = this.tracks.get(key)
    if (!track) {
      track = { samples: [], waveUntil: 0 }
      this.tracks.set(key, track)
    }

    const open = staticGesture === Gesture.OPEN_PALM || staticGesture === Gesture.FOUR
    if (!open) {
      track.samples = []
      track.waveUntil = 0
      return false
    }

    const lm = hand.landmarks
    track.samples.push({ t: now, x: palmCenter(lm).x / handScale(lm) })
    while (track.samples.length > 0 && now - track.samples[0].t > WINDOW_MS) {
      track.samples.shift()
    }

    if (countReversals(track.samples.map((s) => s.x)) >= REVERSALS) {
      track.waveUntil = now + HOLD_MS
    }
    return now < track.waveUntil
  }

  /** Forget hands that are no longer present. */
  prune(activeKeys: string[]): void {
    for (const key of this.tracks.keys()) {
      if (!activeKeys.includes(key)) this.tracks.delete(key)
    }
  }
}

/** Count direction changes whose swing exceeds AMPLITUDE (with hysteresis). */
export function countReversals(xs: number[]): number {
  if (xs.length === 0) return 0
  let reversals = 0
  let dir = 0
  let ref = xs[0]
  for (const x of xs) {
    if (dir === 0) {
      if (x - ref > AMPLITUDE) {
        dir = 1
        ref = x
      } else if (ref - x > AMPLITUDE) {
        dir = -1
        ref = x
      }
    } else if (dir === 1) {
      if (x > ref) ref = x
      else if (ref - x > AMPLITUDE) {
        reversals++
        dir = -1
        ref = x
      }
    } else {
      if (x < ref) ref = x
      else if (x - ref > AMPLITUDE) {
        reversals++
        dir = 1
        ref = x
      }
    }
  }
  return reversals
}
