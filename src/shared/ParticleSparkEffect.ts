import { Colors, type DrawCommand } from './DrawCommand'
import type { HandEffect } from './Effect'
import { HandLandmark } from './HandTopology'
import type { CanvasSize, TrackedHand } from './TrackingTypes'

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
 * Yellow spark particles that spawn at the pinch point (midpoint of thumb &
 * index fingertips), then drift outward and fade.
 */
export class ParticleSparkEffect implements HandEffect {
  readonly id = 'particle-spark'
  private particles: Particle[] = []
  private readonly maxParticles = 240
  private spawnAccumulator = 0

  step(hands: TrackedHand[], _size: CanvasSize, dtMs: number): DrawCommand[] {
    const dt = Math.min(dtMs, 64) // clamp to avoid huge jumps after tab switch

    // Spawn from each pinching hand (~1 particle per ms while active).
    this.spawnAccumulator += dt
    const toSpawn = Math.floor(this.spawnAccumulator)
    this.spawnAccumulator -= toSpawn

    for (const hand of hands) {
      const lm = hand.landmarks
      if (lm.length < 21) continue
      const thumb = lm[HandLandmark.THUMB_TIP]
      const index = lm[HandLandmark.INDEX_TIP]
      const cx = (thumb.x + index.x) / 2
      const cy = (thumb.y + index.y) / 2

      for (let i = 0; i < toSpawn && this.particles.length < this.maxParticles; i++) {
        const angle = Math.random() * Math.PI * 2
        const speed = 0.03 + Math.random() * 0.12 // px per ms
        this.particles.push({
          x: cx + (Math.random() - 0.5) * 6,
          y: cy + (Math.random() - 0.5) * 6,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.04, // slight upward bias
          life: 500 + Math.random() * 400,
          maxLife: 900,
          size: 2 + Math.random() * 3,
        })
      }
    }

    // Advance + cull.
    const cmds: DrawCommand[] = []
    const next: Particle[] = []
    for (const p of this.particles) {
      p.life -= dt
      if (p.life <= 0) continue
      p.x += p.vx * dt
      p.y += p.vy * dt
      p.vy += 0.00018 * dt // gravity
      next.push(p)

      const alpha = Math.max(0, Math.min(1, p.life / p.maxLife))
      const argb = (Math.round(alpha * 255) << 24) | (Colors.SPARK & 0x00ffffff)
      cmds.push({
        kind: 'circle',
        x: p.x, y: p.y,
        radius: p.size,
        color: argb >>> 0,
        fill: true,
        glow: 12,
      })
    }
    this.particles = next

    return cmds
  }
}
