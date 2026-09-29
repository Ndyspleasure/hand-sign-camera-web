import { describe, expect, it } from 'vitest'
import { GESTURE_POSES } from '../gestures/poses'
import { composeTwoHands, resolveLandmarks, rotatePoints, type Point } from '../hand-svg/handModel'
import type { DrawCommand } from './DrawCommand'
import { EFFECT_FOR_GESTURE, EFFECT_LABELS, type EffectId } from './effectMap'
import { createEffects, EffectEngine } from './EffectEngine'
import { Gesture, gestureKind } from './Gesture'
import type { TrackedHand } from './TrackingTypes'

const SIZE = { width: 1280, height: 720 }

function toHand(points: Point[], dx = 0): TrackedHand {
  return {
    landmarks: points.map((p) => ({ x: p.x * 2.4 + 400 + dx, y: p.y * 2.4 - 60, z: 0 })),
    handedness: 'Right',
    score: 1,
  }
}

function handsFor(g: Gesture): TrackedHand[] {
  const gp = GESTURE_POSES[g]
  const pts = resolveLandmarks(gp.pose)
  if (gp.twoHand) {
    const { left, right } = composeTwoHands(pts, gp.twoHand)
    return [toHand(left, -200), toHand(right, -200)]
  }
  return [toHand(rotatePoints(pts, gp.rotate ?? 0))]
}

function numbersOf(c: DrawCommand): number[] {
  switch (c.kind) {
    case 'line': return [c.x1, c.y1, c.x2, c.y2, c.width]
    case 'circle': return [c.x, c.y, c.radius]
    case 'arc': return [c.x, c.y, c.radius, c.start, c.end, c.width]
    case 'text': return [c.x, c.y, c.size]
    case 'path': return c.points.flatMap((p) => [p.x, p.y])
  }
}

describe('effect map', () => {
  it('every gesture maps to a known effect, and every effect is implemented', () => {
    const implemented = new Set<EffectId>(createEffects().map((e) => e.id))
    implemented.add('wireframe')
    for (const g of Object.values(Gesture)) expect(implemented.has(EFFECT_FOR_GESTURE[g])).toBe(true)
    for (const id of Object.keys(EFFECT_LABELS) as EffectId[]) expect(implemented.has(id)).toBe(true)
  })

  it('every gesture has its own distinct effect', () => {
    const gestures = Object.values(Gesture).filter((g) => g !== Gesture.NONE)
    const effects = new Set(gestures.map((g) => EFFECT_FOR_GESTURE[g]))
    expect(effects.size).toBe(gestures.length)
  })
})

describe('EffectEngine', () => {
  const gestures = Object.values(Gesture).filter((g) => g !== Gesture.NONE)

  it.each(gestures)('%s drives its effect with valid draw commands', (g) => {
    const engine = new EffectEngine()
    const hands = handsFor(g)
    const two = gestureKind(g) === 'two-hand'
    const frame = { hands, gestures: hands.map(() => (two ? Gesture.NONE : g)), twoHand: two ? g : Gesture.NONE }

    let cmds: DrawCommand[] = []
    for (let i = 0; i < 40; i++) cmds = engine.step(frame, SIZE, 16)

    expect(engine.activeEffects).toContain(EFFECT_FOR_GESTURE[g])
    // More than the bare wireframe (21 bones + 21 joints per hand).
    expect(cmds.length).toBeGreaterThan(42 * hands.length)
    for (const c of cmds) for (const n of numbersOf(c)) expect(Number.isFinite(n)).toBe(true)
  })

  it('two hands can show two different effects at once', () => {
    const engine = new EffectEngine()
    const fist = handsFor(Gesture.FIST)[0]
    const peace = { ...handsFor(Gesture.PEACE)[0] }
    peace.landmarks = peace.landmarks.map((p) => ({ ...p, x: p.x + 500 }))
    engine.step({ hands: [fist, peace], gestures: [Gesture.FIST, Gesture.PEACE], twoHand: Gesture.NONE }, SIZE, 16)
    expect(engine.activeEffects).toEqual(expect.arrayContaining(['shockwave', 'rainbow-trail']))
  })

  it('a two-hand gesture claims both hands', () => {
    const engine = new EffectEngine()
    const hands = handsFor(Gesture.DOUBLE_PALM)
    engine.step({ hands, gestures: [Gesture.OPEN_PALM, Gesture.OPEN_PALM], twoHand: Gesture.DOUBLE_PALM }, SIZE, 16)
    expect(engine.activeEffects).toEqual(['energy-beam'])
  })

  it('effects fade out completely after the hands leave', () => {
    const engine = new EffectEngine()
    for (const g of gestures) {
      const hands = handsFor(g)
      const two = gestureKind(g) === 'two-hand'
      for (let i = 0; i < 10; i++) {
        engine.step({ hands, gestures: hands.map(() => (two ? Gesture.NONE : g)), twoHand: two ? g : Gesture.NONE }, SIZE, 16)
      }
    }
    let cmds: DrawCommand[] = []
    for (let i = 0; i < 200; i++) cmds = engine.step({ hands: [], gestures: [], twoHand: Gesture.NONE }, SIZE, 16)
    expect(cmds).toEqual([])
  })
})
