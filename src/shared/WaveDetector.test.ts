import { describe, expect, it } from 'vitest'
import { GESTURE_POSES } from '../gestures/poses'
import { resolveLandmarks } from '../hand-svg/handModel'
import { Gesture } from './Gesture'
import type { TrackedHand } from './TrackingTypes'
import { countReversals, WaveDetector } from './WaveDetector'

const open = resolveLandmarks(GESTURE_POSES[Gesture.OPEN_PALM].pose)
// Hand scale of the model hand is ~94 px, so 60 px ≈ 0.64 hand widths.
function handAt(offsetX: number): TrackedHand {
  return {
    landmarks: open.map((p) => ({ x: p.x + offsetX, y: p.y, z: 0 })),
    handedness: 'Right',
    score: 1,
  }
}

describe('countReversals', () => {
  it('ignores jitter below the amplitude', () => {
    expect(countReversals([0, 0.1, -0.1, 0.12, -0.05, 0.1])).toBe(0)
  })
  it('counts real back-and-forth swings', () => {
    expect(countReversals([0, 0.6, 0, 0.6, 0])).toBe(3)
  })
})

describe('WaveDetector', () => {
  it('detects an open hand swinging side to side', () => {
    const det = new WaveDetector()
    let waving = false
    // ±60 px swing, one direction change every 200 ms.
    for (let t = 0; t <= 1000; t += 50) {
      const phase = Math.floor(t / 200) % 2 === 0 ? 1 : -1
      const x = phase * (((t % 200) / 200) * 60)
      waving = det.update('h', handAt(x), Gesture.OPEN_PALM, t) || waving
    }
    expect(waving).toBe(true)
  })

  it('does not fire for a single sweep across the screen', () => {
    const det = new WaveDetector()
    let waving = false
    for (let t = 0; t <= 1000; t += 50) {
      waving = det.update('h', handAt(t * 0.4), Gesture.OPEN_PALM, t) || waving
    }
    expect(waving).toBe(false)
  })

  it('does not fire when the hand is not open', () => {
    const det = new WaveDetector()
    let waving = false
    for (let t = 0; t <= 1000; t += 50) {
      const x = (Math.floor(t / 200) % 2 === 0 ? 1 : -1) * 60
      waving = det.update('h', handAt(x), Gesture.FIST, t) || waving
    }
    expect(waving).toBe(false)
  })
})
