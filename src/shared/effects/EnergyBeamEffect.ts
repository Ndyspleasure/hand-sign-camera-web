import { hsla, rgba, type DrawCommand } from '../DrawCommand'
import type { HandEffect } from '../Effect'
import type { Point2 } from '../handGeometry'
import { dist, handScale, palmCenter } from '../handGeometry'
import type { CanvasSize, TrackedHand } from '../TrackingTypes'
import { clampDt, jaggedBolt } from './fx'

const REGEN_MS = 45
const FLOW_PARTICLES = 18

/**
 * DOUBLE_PALM (two hands) — a crackling energy beam connects both palms, with
 * glowing orbs in each hand and sparks flowing along the beam.
 */
export class EnergyBeamEffect implements HandEffect {
  readonly id = 'energy-beam'
  private bolts: Point2[][] = []
  private regenTimer = REGEN_MS
  private time = 0

  step(hands: TrackedHand[], _size: CanvasSize, dtMs: number): DrawCommand[] {
    const dt = clampDt(dtMs)
    this.time += dt
    if (hands.length < 2 || hands[0].landmarks.length < 21 || hands[1].landmarks.length < 21) {
      this.bolts = []
      return []
    }

    const la = hands[0].landmarks
    const lb = hands[1].landmarks
    const A = palmCenter(la)
    const B = palmCenter(lb)
    const s = (handScale(la) + handScale(lb)) / 2
    const span = dist(A, B)

    this.regenTimer += dt
    if (this.regenTimer >= REGEN_MS) {
      this.regenTimer = 0
      this.bolts = [0.14, 0.1, 0.06].map((j) => jaggedBolt(A, B, 14, span * j))
    }

    const cmds: DrawCommand[] = []
    const hue = 250 + 30 * Math.sin(this.time * 0.003)
    this.bolts.forEach((bolt, k) => {
      cmds.push({ kind: 'path', points: bolt, width: 5 - k * 1.3, color: hsla(hue + k * 25, 100, 65, 0.9), glow: 16, blend: 'add' })
    })
    cmds.push({ kind: 'line', x1: A.x, y1: A.y, x2: B.x, y2: B.y, width: 2, color: rgba(255, 255, 255, 0.85), blend: 'add' })

    // Sparks flowing from A to B along a gentle sine around the beam.
    const nx = -(B.y - A.y) / (span || 1)
    const ny = (B.x - A.x) / (span || 1)
    for (let i = 0; i < FLOW_PARTICLES; i++) {
      const u = (i / FLOW_PARTICLES + this.time * 0.0009) % 1
      const off = Math.sin(u * Math.PI * 3 + i) * span * 0.08
      cmds.push({
        kind: 'circle', x: A.x + (B.x - A.x) * u + nx * off, y: A.y + (B.y - A.y) * u + ny * off,
        radius: 3, fill: true, color: hsla(190, 100, 75, 0.9), blend: 'add',
      })
    }

    // Charged orbs in both palms.
    const pulse = 1 + 0.12 * Math.sin(this.time * 0.012)
    for (const c of [A, B]) {
      cmds.push({ kind: 'circle', x: c.x, y: c.y, radius: s * 0.5 * pulse, fill: true, color: hsla(hue, 100, 62, 0.35), glow: 26, blend: 'add' })
      cmds.push({ kind: 'circle', x: c.x, y: c.y, radius: s * 0.17, fill: true, color: rgba(255, 255, 255, 0.95) })
    }
    return cmds
  }
}
