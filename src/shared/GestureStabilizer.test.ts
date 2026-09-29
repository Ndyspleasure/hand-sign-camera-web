import { describe, expect, it } from 'vitest'
import { Gesture } from './Gesture'
import { GestureStabilizer } from './GestureStabilizer'

describe('GestureStabilizer', () => {
  it('accepts the first reading immediately', () => {
    const s = new GestureStabilizer()
    expect(s.update('a', Gesture.FIST, 0)).toBe(Gesture.FIST)
  })

  it('ignores a one-frame blip', () => {
    const s = new GestureStabilizer()
    s.update('a', Gesture.FIST, 0)
    expect(s.update('a', Gesture.PINCH, 16)).toBe(Gesture.FIST)
    expect(s.update('a', Gesture.FIST, 32)).toBe(Gesture.FIST)
  })

  it('switches once the new gesture persists', () => {
    const s = new GestureStabilizer()
    s.update('a', Gesture.FIST, 0)
    s.update('a', Gesture.PEACE, 10)
    expect(s.update('a', Gesture.PEACE, 60)).toBe(Gesture.FIST)
    expect(s.update('a', Gesture.PEACE, 110)).toBe(Gesture.PEACE)
  })

  it('holds a gesture briefly when recognition drops to NONE', () => {
    const s = new GestureStabilizer()
    s.update('a', Gesture.OK, 0)
    s.update('a', Gesture.NONE, 10)
    expect(s.update('a', Gesture.NONE, 200)).toBe(Gesture.OK)
    expect(s.update('a', Gesture.NONE, 270)).toBe(Gesture.NONE)
  })

  it('tracks keys independently and prunes them', () => {
    const s = new GestureStabilizer()
    s.update('left', Gesture.FIST, 0)
    s.update('right', Gesture.PEACE, 0)
    expect(s.update('left', Gesture.FIST, 16)).toBe(Gesture.FIST)
    expect(s.update('right', Gesture.PEACE, 16)).toBe(Gesture.PEACE)
    s.prune(['left'])
    expect(s.update('right', Gesture.OK, 32)).toBe(Gesture.OK)
  })
})
