import { describe, expect, it } from 'vitest'
import { Gesture } from '../shared/Gesture'
import { GesturePipeline, handKeys, projectHand } from '../shared/GesturePipeline'
import { DEMO_LENGTH_MS, DEMO_SEGMENTS, demoHands } from './DemoSource'

const W = 1280
const H = 720

describe('demo mode', () => {
  it('makes the real pipeline recognize every gesture it demonstrates', () => {
    const pipeline = new GesturePipeline()
    const seen = DEMO_SEGMENTS.map(() => new Set<Gesture>())
    for (let t = 0; t < DEMO_LENGTH_MS; t += 16) {
      const state = demoHands(t, W, H)
      const hands = state.hands
        .map((h) => projectHand(h, W, H))
        .sort((a, b) => a.landmarks[0].x - b.landmarks[0].x)
      const { gestures, twoHand } = pipeline.process(hands, handKeys(hands), t)
      for (const g of [...gestures, twoHand]) seen[state.index].add(g)
    }
    DEMO_SEGMENTS.forEach((s, i) => {
      const wanted = s.script.name === 'Mixed' ? [Gesture.FIST, Gesture.PEACE] : [s.gesture]
      for (const g of wanted) expect([...seen[i]], `${i} ${s.gesture} / ${s.script.name}`).toContain(g)
    })
  })

  it.each([
    [W, H],
    [H, W],
  ])('keeps every landmark inside a %i×%i frame', (w, h0) => {
    for (let t = 0; t < DEMO_LENGTH_MS; t += 50) {
      for (const h of demoHands(t, w, h0).hands) {
        for (const p of h.landmarks) {
          expect(p.x).toBeGreaterThan(0)
          expect(p.x).toBeLessThan(1)
          expect(p.y).toBeGreaterThan(0)
          expect(p.y).toBeLessThan(1)
        }
      }
    }
  })
})
