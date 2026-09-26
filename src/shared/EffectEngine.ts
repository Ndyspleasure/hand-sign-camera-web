import type { DrawCommand } from './DrawCommand'
import type { HandEffect } from './Effect'
import { Gesture } from './Gesture'
import { LaserEffect } from './LaserEffect'
import { NeonSkeletonEffect } from './NeonSkeletonEffect'
import { ParticleSparkEffect } from './ParticleSparkEffect'
import type { CanvasSize, TrackedHand } from './TrackingTypes'

/**
 * Maps the current gesture to an active effect and renders it.
 *
 * Mapping:
 *   POINTING            → laser
 *   PINCH               → particle spark
 *   everything else     → neon skeleton (default, so the hand is always visible)
 *
 * A short grace period keeps the laser/particle effect alive for a moment after
 * its gesture is lost, preventing flicker from noisy per-frame recognition.
 */
export class EffectEngine {
  private readonly effects: Record<string, HandEffect>
  private currentId = 'neon-skeleton'
  private graceTimerMs = 0
  private readonly graceMs = 350

  constructor() {
    const neon = new NeonSkeletonEffect()
    const laser = new LaserEffect()
    const particle = new ParticleSparkEffect()
    this.effects = {
      [neon.id]: neon,
      [laser.id]: laser,
      [particle.id]: particle,
    }
  }

  private targetId(gesture: Gesture): string {
    switch (gesture) {
      case Gesture.POINTING:
        return 'laser'
      case Gesture.PINCH:
        return 'particle-spark'
      default:
        return 'neon-skeleton'
    }
  }

  step(hands: TrackedHand[], gesture: Gesture, size: CanvasSize, dtMs: number): DrawCommand[] {
    const desired = this.targetId(gesture)

    if (desired !== this.currentId) {
      const leavingSpecial = this.currentId === 'laser' || this.currentId === 'particle-spark'
      if (leavingSpecial && desired === 'neon-skeleton') {
        // Hold the special effect briefly before falling back to neon.
        this.graceTimerMs += dtMs
        if (this.graceTimerMs < this.graceMs) {
          return this.effects[this.currentId].step(hands, size, dtMs)
        }
      }
      this.currentId = desired
      this.graceTimerMs = 0
    } else {
      this.graceTimerMs = 0
    }

    return this.effects[this.currentId].step(hands, size, dtMs)
  }

  get activeEffectId(): string {
    return this.currentId
  }
}
