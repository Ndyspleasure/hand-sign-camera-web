import type { DrawCommand } from './DrawCommand'
import type { HandEffect } from './Effect'
import { EFFECT_FOR_GESTURE, type EffectId } from './effectMap'
import {
  BigHeartEffect,
  CodeRainEffect,
  EnergyBeamEffect,
  HaloEffect,
  HeartsEffect,
  LaserEffect,
  LightningEffect,
  NeonSkeletonEffect,
  ParticleSparkEffect,
  RainbowTrailEffect,
  RainEffect,
  RippleEffect,
  ShockwaveEffect,
  SoundWaveEffect,
  StarBurstEffect,
  TriBeamEffect,
  WireframeEffect,
} from './effects'
import { Gesture } from './Gesture'
import type { CanvasSize, TrackedHand } from './TrackingTypes'

/** One frame of tracking input for the engine. */
export interface EffectFrame {
  hands: TrackedHand[]
  /** Stabilized gesture of each hand (same order as `hands`). */
  gestures: Gesture[]
  /** Two-hand gesture across both hands, or NONE. */
  twoHand: Gesture
}

/** A fresh instance of every gesture effect (the wireframe base is separate). */
export function createEffects(): HandEffect[] {
  return [
    new NeonSkeletonEffect(),
    new ShockwaveEffect(),
    new RainbowTrailEffect(),
    new StarBurstEffect(),
    new RainEffect(),
    new LaserEffect(),
    new HaloEffect(),
    new LightningEffect(),
    new ParticleSparkEffect(),
    new SoundWaveEffect(),
    new TriBeamEffect(),
    new CodeRainEffect(),
    new HeartsEffect(),
    new RippleEffect(),
    new BigHeartEffect(),
    new EnergyBeamEffect(),
  ]
}

/**
 * Decide which hands feed which effect. A two-hand gesture claims both hands
 * for its effect; otherwise each hand drives the effect of its own gesture, so
 * two hands can show two different effects at once.
 */
export function groupHandsByEffect(frame: EffectFrame): Map<EffectId, TrackedHand[]> {
  const groups = new Map<EffectId, TrackedHand[]>()
  if (frame.twoHand !== Gesture.NONE && frame.hands.length >= 2) {
    groups.set(EFFECT_FOR_GESTURE[frame.twoHand], frame.hands.slice(0, 2))
    return groups
  }
  frame.hands.forEach((hand, i) => {
    const id = EFFECT_FOR_GESTURE[frame.gestures[i] ?? Gesture.NONE]
    if (id === 'wireframe') return // already drawn as the base layer
    const list = groups.get(id)
    if (list) list.push(hand)
    else groups.set(id, [hand])
  })
  return groups
}

/**
 * Runs the effects: a tracking wireframe under every hand, then each gesture's
 * own effect. Every effect is stepped every frame — inactive ones with no
 * hands — so particles and rings finish fading instead of vanishing.
 */
export class EffectEngine {
  private readonly base = new WireframeEffect()
  private readonly effects: HandEffect[]
  private active: EffectId[] = []

  constructor(effects: HandEffect[] = createEffects()) {
    this.effects = effects
  }

  step(frame: EffectFrame, size: CanvasSize, dtMs: number): DrawCommand[] {
    const groups = groupHandsByEffect(frame)
    this.active = [...groups.keys()]

    const cmds = this.base.step(frame.hands, size, dtMs)
    for (const effect of this.effects) {
      const out = effect.step(groups.get(effect.id) ?? [], size, dtMs)
      for (const c of out) cmds.push(c)
    }
    return cmds
  }

  /** Effects driven by a hand in the last frame (excludes the wireframe). */
  get activeEffects(): EffectId[] {
    return this.active
  }
}
