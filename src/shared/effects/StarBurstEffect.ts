import { hsla, rgba, type DrawCommand } from '../DrawCommand'
import type { HandEffect } from '../Effect'
import { handScale } from '../handGeometry'
import { HandLandmark } from '../HandTopology'
import type { CanvasSize, TrackedHand } from '../TrackingTypes'
import { clampDt, rand, star } from './fx'

interface Star {
  x: number
  y: number
  vx: number
  vy: number
  rot: number
  spin: number
  size: number
  life: number
  max: number
}

const EMIT_MS = 70
const MAX_STARS = 50

/** THUMBS_UP — golden stars burst from the thumb tip and float upward. */
export class StarBurstEffect implements HandEffect {
  readonly id = 'star-burst'
  private stars: Star[] = []
  private emitTimer = 0
  private time = 0

  step(hands: TrackedHand[], _size: CanvasSize, dtMs: number): DrawCommand[] {
    const dt = clampDt(dtMs)
    this.time += dt
    this.emitTimer += dt
    const emit = this.emitTimer >= EMIT_MS
    if (emit) this.emitTimer = 0
    const cmds: DrawCommand[] = []

    for (const hand of hands) {
      const lm = hand.landmarks
      if (lm.length < 21) continue
      const s = handScale(lm)
      const tip = lm[HandLandmark.THUMB_TIP]
      if (emit && this.stars.length < MAX_STARS) {
        const life = rand(1100, 1500)
        this.stars.push({
          x: tip.x, y: tip.y,
          vx: rand(-0.09, 0.09), vy: rand(-0.26, -0.12),
          rot: rand(0, Math.PI), spin: rand(-0.005, 0.005),
          size: s * rand(0.08, 0.15), life, max: life,
        })
      }
      const pulse = 1 + 0.25 * Math.sin(this.time * 0.015)
      cmds.push({
        kind: 'circle', x: tip.x, y: tip.y, radius: s * 0.18 * pulse,
        color: hsla(48, 100, 60, 0.5), fill: false, width: 2.5, glow: 14,
      })
    }

    const alive: Star[] = []
    for (const p of this.stars) {
      p.life -= dt
      if (p.life <= 0) continue
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += 0.00006 * dt // drifts up, slowly losing speed
      p.rot += p.spin * dt
      alive.push(p)
      const a = p.life / p.max
      cmds.push({
        kind: 'path', points: star(p.x, p.y, p.size, p.size * 0.45, p.rot),
        closed: true, fill: true, color: hsla(46, 100, 58, a), glow: 6,
      })
      cmds.push({ kind: 'circle', x: p.x, y: p.y, radius: p.size * 0.18, color: rgba(255, 255, 240, a), fill: true })
    }
    this.stars = alive
    return cmds
  }
}
