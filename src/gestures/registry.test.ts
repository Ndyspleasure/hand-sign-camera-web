import { describe, expect, it } from 'vitest'
import { EFFECT_FOR_GESTURE } from '../shared/effectMap'
import { Gesture, gestureKind } from '../shared/Gesture'
import { CORE_GESTURES, GESTURES, GUIDE_ORDER, isGuideGesture } from './registry'

const guideGestures = Object.values(Gesture).filter((g) => g !== Gesture.NONE)

describe('gesture registry', () => {
  it('lists every recognizer gesture exactly once', () => {
    expect([...GUIDE_ORDER].sort()).toEqual([...guideGestures].sort())
  })

  it('teaches a core subset in onboarding', () => {
    for (const g of CORE_GESTURES) expect(GUIDE_ORDER).toContain(g)
  })

  it.each(guideGestures)('%s entry is consistent with the shared maps', (g) => {
    const info = GESTURES[g as keyof typeof GESTURES]
    expect(info.effectId).toBe(EFFECT_FOR_GESTURE[g])
    expect(info.kind).toBe(gestureKind(g))
    expect(info.howTo.length).toBeGreaterThan(0)
    expect(Boolean(info.pose.twoHand)).toBe(gestureKind(g) === 'two-hand')
    expect(info.pose.motion === 'wave').toBe(gestureKind(g) === 'motion')
  })

  it('validates deep-link values', () => {
    expect(isGuideGesture('HEART')).toBe(true)
    expect(isGuideGesture('NONE')).toBe(false)
    expect(isGuideGesture('nope')).toBe(false)
    expect(isGuideGesture('toString')).toBe(false)
    expect(isGuideGesture(null)).toBe(false)
  })
})
