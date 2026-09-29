import { Gesture } from './Gesture'

/** Every visual effect the engine can run. */
export type EffectId =
  | 'wireframe'
  | 'neon-skeleton'
  | 'shockwave'
  | 'rainbow-trail'
  | 'star-burst'
  | 'rain'
  | 'laser'
  | 'halo'
  | 'lightning'
  | 'particle-spark'
  | 'sound-wave'
  | 'tri-beam'
  | 'code-rain'
  | 'hearts'
  | 'ripple'
  | 'big-heart'
  | 'energy-beam'

/**
 * Single source of truth for which effect each gesture triggers — used by the
 * EffectEngine, the status UI, and the gesture guide. Every gesture has its own
 * effect; NONE shows the plain tracking wireframe.
 */
export const EFFECT_FOR_GESTURE: Record<Gesture, EffectId> = {
  [Gesture.NONE]: 'wireframe',
  [Gesture.OPEN_PALM]: 'neon-skeleton',
  [Gesture.FIST]: 'shockwave',
  [Gesture.PEACE]: 'rainbow-trail',
  [Gesture.THUMBS_UP]: 'star-burst',
  [Gesture.THUMBS_DOWN]: 'rain',
  [Gesture.POINTING]: 'laser',
  [Gesture.OK]: 'halo',
  [Gesture.ROCK]: 'lightning',
  [Gesture.PINCH]: 'particle-spark',
  [Gesture.CALL_ME]: 'sound-wave',
  [Gesture.THREE]: 'tri-beam',
  [Gesture.FOUR]: 'code-rain',
  [Gesture.ILY]: 'hearts',
  [Gesture.WAVE]: 'ripple',
  [Gesture.HEART]: 'big-heart',
  [Gesture.DOUBLE_PALM]: 'energy-beam',
}

export const EFFECT_LABELS: Record<EffectId, string> = {
  wireframe: 'Wireframe',
  'neon-skeleton': 'Neon Skeleton',
  shockwave: 'Shockwave',
  'rainbow-trail': 'Rainbow Trail',
  'star-burst': 'Star Burst',
  rain: 'Rain Cloud',
  laser: 'Laser',
  halo: 'Halo',
  lightning: 'Lightning',
  'particle-spark': 'Particle Spark',
  'sound-wave': 'Sound Waves',
  'tri-beam': 'Tri-Beam',
  'code-rain': 'Code Rain',
  hearts: 'Floating Hearts',
  ripple: 'Ripple',
  'big-heart': 'Big Heart',
  'energy-beam': 'Energy Beam',
}

export function effectLabel(id: EffectId): string {
  return EFFECT_LABELS[id]
}
