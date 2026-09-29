import { Colors, withAlpha, type DrawCommand } from '../DrawCommand'
import type { HandEffect } from '../Effect'
import { midpoint } from '../handGeometry'
import { HandLandmark } from '../HandTopology'
import type { CanvasSize, TrackedHand } from '../TrackingTypes'
import { clampDt, rand } from './fx'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  life: number // remaining, ms
  maxLife: number
  size: number
}

/**
 * PINCH — yellow spark particles that spawn at the pinch point (midpoint of
 * thumb & index fingertips), then drift outward, fall and fade. Existing
 * sparks keep decaying after the gesture ends.
 */
export class ParticleSparkEffect implements HandEffect {
  readonly id = 'particle-spark'
  private particles: Particle[] = []
  private readonly maxParticles = 220
  private spawnAccumulator = 0

  step(hands: TrackedHand[], _size: CanvasSize, dtMs: number): DrawCommand[] {
    const dt = clampDt(dtMs)

    // ~1 particle per ms per pinching hand.
    this.spawnAccumulator += dt
    const toSpawn = Math.floor(this.spawnAccumulator)
    this.spawnAccumulator -= toSpawn

    for (const hand of hands) {
      const lm = hand.landmarks
      if (lm.length < 21) continue
      const c = midpoint(lm[HandLandmark.THUMB_TIP], lm[HandLandmark.INDEX_TIP])

      for (let i = 0; i < toSpawn && this.particles.length < this.maxParticles; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = rand(0.03, 0.15) // px per ms
        const life = rand(500, 900)
        this.particles.push({
          x: c.x + rand(-3, 3),
          y: c.y + rand(-3, 3),
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.04, // slight upward bias
          life,
          maxLife: life,
          size: rand(2, 5),
        })
      }
    }

    const cmds: DrawCommand[] = []
    const next: Particle[] = []
    for (const p of this.particles) {
      p.life -= dt
      if (p.life <= 0) continue
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += 0.00018 * dt // gravity
      next.push(p)
      cmds.push({
        kind: 'circle', x: p.x, y: p.y, radius: p.size,
        color: withAlpha(Colors.SPARK, p.life / p.maxLife), fill: true, blend: 'add',
      })
    }
    this.particles = next
    return cmds
  }
}
