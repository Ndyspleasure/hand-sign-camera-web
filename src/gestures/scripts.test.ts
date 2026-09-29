import { describe, expect, it } from 'vitest'
import { Gesture } from '../shared/Gesture'
import { GESTURE_POSES } from './poses'
import { GUIDE_ORDER } from './registry'
import { sampleScript, scriptDuration, SCRIPTS, type Keyframe } from './scripts'

const total = (frames: Keyframe[]): number => frames.reduce((s, k) => s + k.dur + k.hold, 0)

describe('gesture animation scripts', () => {
  it('gives every gesture at least three variants, including a two-hand one', () => {
    for (const g of GUIDE_ORDER) {
      expect(SCRIPTS[g].length, g).toBeGreaterThanOrEqual(3)
      const twoHand = GESTURE_POSES[g].twoHand !== undefined || SCRIPTS[g].some((s) => s.pair)
      expect(twoHand, g).toBe(true)
    }
  })

  it('shows the target pose in every variant', () => {
    for (const g of GUIDE_ORDER) {
      const target = GESTURE_POSES[g === Gesture.WAVE ? Gesture.OPEN_PALM : g].pose
      for (const script of SCRIPTS[g]) {
        const curls = (p: typeof target) => [p.thumb.curl, p.index.curl, p.middle.curl, p.ring.curl, p.pinky.curl].join()
        const frames = [...script.frames, ...(script.left ?? [])]
        const hit = frames.some((k) => curls(k.pose) === curls(target))
        expect(hit, `${g} / ${script.name}`).toBe(true)
      }
    }
  })

  it('keeps both hands of a relay in sync', () => {
    for (const g of GUIDE_ORDER) {
      for (const script of SCRIPTS[g]) {
        if (script.left) expect(total(script.left), script.name).toBe(total(script.frames))
      }
    }
  })

  it('samples finite points throughout every script', () => {
    for (const g of GUIDE_ORDER) {
      for (const script of SCRIPTS[g]) {
        const d = scriptDuration(script)
        for (let t = 0; t <= d * 1.5; t += 97) {
          const f = sampleScript(script, t)
          expect(f.points).toHaveLength(21)
          for (const p of [...f.points, ...(f.left?.points ?? [])]) {
            expect(Number.isFinite(p.x) && Number.isFinite(p.y), `${g} / ${script.name} @${t}`).toBe(true)
          }
          expect(Number.isFinite(f.rotate + f.dx + f.dy + f.scale + f.gap)).toBe(true)
        }
      }
    }
  })

  it('has unique variant names per gesture', () => {
    for (const g of GUIDE_ORDER) {
      const names = SCRIPTS[g].map((s) => s.name)
      expect(new Set(names).size, g).toBe(names.length)
    }
  })
})
