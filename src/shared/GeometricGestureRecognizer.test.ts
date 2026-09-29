import { describe, expect, it } from 'vitest'
import { GESTURE_POSES } from '../gestures/poses'
import {
  composeTwoHands,
  resolveLandmarks,
  rotatePoints,
  type Point,
} from '../hand-svg/handModel'
import { Gesture, gestureKind } from './Gesture'
import { GeometricGestureRecognizer } from './GeometricGestureRecognizer'
import type { TrackedHand } from './TrackingTypes'

const recognizer = new GeometricGestureRecognizer()

function toHand(points: Point[]): TrackedHand {
  return {
    landmarks: points.map((p) => ({ x: p.x, y: p.y, z: 0 })),
    handedness: 'Right',
    score: 1,
  }
}

/** Landmarks of a gesture's guide pose, as displayed (rotation applied). */
function posePoints(g: Gesture): Point[] {
  const { pose, rotate } = GESTURE_POSES[g]
  return rotatePoints(resolveLandmarks(pose), rotate ?? 0)
}

const staticGestures = Object.values(Gesture).filter(
  (g) => g !== Gesture.NONE && gestureKind(g) === 'static',
)

describe('GeometricGestureRecognizer — guide poses match detection', () => {
  it.each(staticGestures)('%s pose is recognized as itself', (g) => {
    expect(recognizer.recognize(toHand(posePoints(g)))).toBe(g)
  })

  it.each(staticGestures)('%s is scale- and position-invariant', (g) => {
    const moved = posePoints(g).map((p) => ({ x: p.x * 2.5 + 300, y: p.y * 2.5 - 40 }))
    expect(recognizer.recognize(toHand(moved))).toBe(g)
  })

  it.each(staticGestures)('%s works for the mirrored (other) hand', (g) => {
    const mirrored = posePoints(g).map((p) => ({ x: -p.x, y: p.y }))
    expect(recognizer.recognize(toHand(mirrored))).toBe(g)
  })

  it('the static WAVE pose is an open palm (waving needs motion)', () => {
    expect(recognizer.recognize(toHand(posePoints(Gesture.WAVE)))).toBe(Gesture.OPEN_PALM)
  })

  it('returns NONE for a missing or incomplete hand', () => {
    expect(recognizer.recognize(undefined)).toBe(Gesture.NONE)
    expect(recognizer.recognize(toHand(posePoints(Gesture.FIST).slice(0, 10)))).toBe(Gesture.NONE)
  })
})

describe('GeometricGestureRecognizer — two hands', () => {
  function pair(g: Gesture): [TrackedHand, TrackedHand] {
    const { pose, twoHand } = GESTURE_POSES[g]
    if (!twoHand) throw new Error(`${g} has no two-hand layout`)
    const { left, right } = composeTwoHands(resolveLandmarks(pose), twoHand)
    return [toHand(left), toHand(right)]
  }

  it.each([Gesture.HEART, Gesture.DOUBLE_PALM])('%s pair is recognized (either order)', (g) => {
    const [a, b] = pair(g)
    const ga = recognizer.recognize(a)
    const gb = recognizer.recognize(b)
    expect(recognizer.recognizeTwoHands(a, b, ga, gb)).toBe(g)
    expect(recognizer.recognizeTwoHands(b, a, gb, ga)).toBe(g)
  })

  it('palms pressed together (wrists touching) is not a heart', () => {
    const four = resolveLandmarks(GESTURE_POSES[Gesture.FOUR].pose)
    const { left, right } = composeTwoHands(four, { width: 200, dx: 0 })
    const a = toHand(left)
    const b = toHand(right)
    const result = recognizer.recognizeTwoHands(a, b, recognizer.recognize(a), recognizer.recognize(b))
    expect(result).toBe(Gesture.NONE)
  })

  it('a single hand never yields a two-hand gesture', () => {
    const a = toHand(posePoints(Gesture.OPEN_PALM))
    expect(recognizer.recognizeTwoHands(a, undefined, Gesture.OPEN_PALM, Gesture.NONE)).toBe(
      Gesture.NONE,
    )
  })
})
