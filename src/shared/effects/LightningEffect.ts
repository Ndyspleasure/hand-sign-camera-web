import { hsla, rgba, type DrawCommand } from '../DrawCommand'
import type { HandEffect } from '../Effect'
import type { Point2 } from '../handGeometry'
import { direction, dist, handScale } from '../handGeometry'
import { HandLandmark } from '../HandTopology'
import type { CanvasSize, TrackedHand } from '../TrackingTypes'
import { clampDt, jaggedBolt, rand } from './fx'

const REGEN_MS = 55

/**
 * ROCK — crackling electric arcs jump between the index and pinky tips, with
 * sparks shooting up from both horns. Bolts are re-randomized ~18×/s.
 */
export class LightningEffect implements HandEffect {
  readonly id = 'lightning'
  private bolts: Point2[][] = []
  private regenTimer = REGEN_MS

  step(hands: TrackedHand[], _size: CanvasSize, dtMs: number): DrawCommand[] {
    this.regenTimer += clampDt(dtMs)
    if (hands.length === 0) {
      this.bolts = []
      return []
    }

    if (this.regenTimer >= REGEN_MS) {
      this.regenTimer = 0
      this.bolts = []
      for (const hand of hands) {
        const lm = hand.landmarks
        if (lm.length < 21) continue
        const s = handScale(lm)
        const a = lm[HandLandmark.INDEX_TIP]
        const b = lm[HandLandmark.PINKY_TIP]
        const main = jaggedBolt(a, b, 10, dist(a, b) * 0.22 + s * 0.05)
        this.bolts.push(main)
        // A branch splitting off the main bolt.
        const from = main[Math.floor(rand(2, main.length - 2))]
        this.bolts.push(jaggedBolt(from, { x: from.x + rand(-0.5, 0.5) * s, y: from.y - rand(0.3, 0.7) * s }, 5, s * 0.1))
        // Sparks rising from each horn.
        for (const [tip, pip] of [
          [HandLandmark.INDEX_TIP, HandLandmark.INDEX_PIP],
          [HandLandmark.PINKY_TIP, HandLandmark.PINKY_PIP],
        ]) {
          const d = direction(lm[pip], lm[tip])
          const end = { x: lm[tip].x + d.x * s * 0.8 + rand(-0.2, 0.2) * s, y: lm[tip].y + d.y * s * 0.8 }
          this.bolts.push(jaggedBolt(lm[tip], end, 6, s * 0.12))
        }
      }
    }

    const cmds: DrawCommand[] = []
    for (const bolt of this.bolts) {
      cmds.push({ kind: 'path', points: bolt, color: hsla(190, 100, 70, 0.95), width: 4, glow: 14, blend: 'add' })
      cmds.push({ kind: 'path', points: bolt, color: rgba(255, 255, 255, 0.95), width: 1.4 })
    }
    for (const hand of hands) {
      const lm = hand.landmarks
      if (lm.length < 21) continue
      for (const tip of [HandLandmark.INDEX_TIP, HandLandmark.PINKY_TIP]) {
        cmds.push({ kind: 'circle', x: lm[tip].x, y: lm[tip].y, radius: 7, fill: true, color: hsla(190, 100, 80, 0.9), glow: 16 })
      }
    }
    return cmds
  }
}
