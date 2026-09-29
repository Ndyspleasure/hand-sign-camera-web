import { hsla, rgba, type DrawCommand } from '../DrawCommand'
import type { HandEffect } from '../Effect'
import { handScale, midpoint, palmCenter } from '../handGeometry'
import { HandLandmark } from '../HandTopology'
import type { CanvasSize, TrackedHand } from '../TrackingTypes'
import { clampDt, heartAt, heartBetween, rand } from './fx'

interface Burst {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  age: number
  life: number
}

const BURST_MS = 450

/**
 * HEART (two hands) — a big glowing heart pulses in the shape the hands make
 * (top dip at the index tips, bottom point at the thumbs), bursting small
 * hearts outward.
 */
export class BigHeartEffect implements HandEffect {
  readonly id = 'big-heart'
  private bursts: Burst[] = []
  private burstTimer = BURST_MS
  private time = 0

  step(hands: TrackedHand[], _size: CanvasSize, dtMs: number): DrawCommand[] {
    const dt = clampDt(dtMs)
    this.time += dt
    const cmds: DrawCommand[] = []

    if (hands.length >= 2 && hands[0].landmarks.length >= 21 && hands[1].landmarks.length >= 21) {
      const a = hands[0].landmarks
      const b = hands[1].landmarks
      const s = (handScale(a) + handScale(b)) / 2
      const dip = midpoint(a[HandLandmark.INDEX_TIP], b[HandLandmark.INDEX_TIP])
      const tip = midpoint(a[HandLandmark.THUMB_TIP], b[HandLandmark.THUMB_TIP])
      const pulse = 1 + 0.07 * Math.sin(this.time * 0.008)
      // Scale the heart around its center for the heartbeat.
      const cx = (dip.x + tip.x) / 2
      const cy = (dip.y + tip.y) / 2
      const beat = (p: { x: number; y: number }) => ({ x: cx + (p.x - cx) * pulse, y: cy + (p.y - cy) * pulse })
      const outline = heartBetween(beat(dip), beat(tip), 48)

      cmds.push({ kind: 'path', points: outline, closed: true, fill: true, color: hsla(345, 90, 55, 0.35), blend: 'add' })
      cmds.push({ kind: 'path', points: outline, closed: true, width: 5, color: hsla(345, 100, 65, 0.95), glow: 24 })
      cmds.push({ kind: 'path', points: outline, closed: true, width: 1.5, color: rgba(255, 235, 240, 0.9) })

      this.burstTimer += dt
      if (this.burstTimer >= BURST_MS && this.bursts.length < 64) {
        this.burstTimer = 0
        for (let k = 0; k < 8; k++) {
          const angle = (k / 8) * Math.PI * 2 + rand(-0.2, 0.2)
          const speed = rand(0.12, 0.2)
          this.bursts.push({ x: cx, y: cy, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, size: s * rand(0.18, 0.28), age: 0, life: 1000 })
        }
      }
    } else if (hands.length === 1 && hands[0].landmarks.length >= 21) {
      // Degenerate case: show a small heart over the single palm.
      const lm = hands[0].landmarks
      const c = palmCenter(lm)
      cmds.push({ kind: 'path', points: heartAt(c.x, c.y, handScale(lm)), closed: true, fill: true, color: hsla(345, 90, 60, 0.7), glow: 14 })
    } else {
      this.burstTimer = BURST_MS
    }

    const alive: Burst[] = []
    for (const p of this.bursts) {
      p.age += dt
      if (p.age >= p.life) continue
      alive.push(p)
      const t = p.age / p.life
      cmds.push({
        kind: 'path', points: heartAt(p.x + p.vx * p.age, p.y + p.vy * p.age, p.size),
        closed: true, fill: true, color: hsla(340, 95, 65, 1 - t), blend: 'add',
      })
    }
    this.bursts = alive
    return cmds
  }
}
