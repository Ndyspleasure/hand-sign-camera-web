import { Gesture } from '../shared/Gesture'
import { GESTURE_POSES, type GesturePose } from './poses'

/**
 * Presentation metadata for gestures — the single source of truth for the
 * tutorial, gesture guide and onboarding. It is keyed by the recognizer's
 * {@link Gesture} enum and NEVER redefines which gestures exist: the recognizer
 * (GeometricGestureRecognizer) remains authoritative. `Record<GuideGesture, …>`
 * makes the compiler reject the file if a gesture is added to the recognizer
 * without a matching entry here.
 */

export type EffectId = 'neon-skeleton' | 'laser' | 'particle-spark'

/** Every recognizer gesture except NONE (which is "no gesture"). */
export type GuideGesture = Exclude<Gesture, Gesture.NONE>

export interface GestureInfo {
  id: GuideGesture
  name: string
  description: string
  /** Short, visual step-by-step for "How to make it". */
  howTo: string[]
  effectId: EffectId
  effectLabel: string
  pose: GesturePose
}

const EFFECT_LABELS: Record<EffectId, string> = {
  'neon-skeleton': 'Neon Skeleton',
  laser: 'Laser',
  'particle-spark': 'Particle Spark',
}

/**
 * Mirrors EffectEngine's gesture → effect mapping (POINTING → laser,
 * PINCH → particle spark, everything else → neon skeleton).
 */
function effectFor(g: GuideGesture): EffectId {
  if (g === Gesture.POINTING) return 'laser'
  if (g === Gesture.PINCH) return 'particle-spark'
  return 'neon-skeleton'
}

interface RawInfo {
  name: string
  description: string
  howTo: string[]
}

const RAW: Record<GuideGesture, RawInfo> = {
  [Gesture.OPEN_PALM]: {
    name: 'Open Palm',
    description: 'Show your whole hand with all five fingers spread.',
    howTo: ['Face your palm to the camera', 'Spread all five fingers', 'Hold steady'],
  },
  [Gesture.FIST]: {
    name: 'Fist',
    description: 'Close every finger into a fist.',
    howTo: ['Curl all four fingers in', 'Wrap your thumb across', 'Hold the fist steady'],
  },
  [Gesture.PEACE]: {
    name: 'Peace',
    description: 'Index and middle fingers up, the rest curled.',
    howTo: ['Raise your index and middle finger', 'Curl ring and pinky', 'Keep the two fingers apart'],
  },
  [Gesture.THUMBS_UP]: {
    name: 'Thumbs Up',
    description: 'Thumb pointing up while the other fingers stay curled.',
    howTo: ['Curl all four fingers', 'Point your thumb up', 'Hold steady'],
  },
  [Gesture.THUMBS_DOWN]: {
    name: 'Thumbs Down',
    description: 'Thumb pointing down while the other fingers stay curled.',
    howTo: ['Curl all four fingers', 'Point your thumb down', 'Hold steady'],
  },
  [Gesture.POINTING]: {
    name: 'Pointing',
    description: 'Only the index finger extended.',
    howTo: ['Curl middle, ring and pinky', 'Keep your index extended', 'Point toward the camera'],
  },
  [Gesture.OK]: {
    name: 'OK',
    description: 'Thumb and index form a ring, the other fingers extended.',
    howTo: ['Touch your thumb and index tips', 'Keep the other three fingers extended', 'Hold the ring shape'],
  },
  [Gesture.ROCK]: {
    name: 'Rock',
    description: 'Index and pinky up, middle and ring curled.',
    howTo: ['Raise your index and pinky', 'Curl middle and ring', 'Tuck your thumb in'],
  },
  [Gesture.PINCH]: {
    name: 'Pinch',
    description: 'Thumb and index tips pinched together.',
    howTo: ['Bring thumb and index tips together', 'Relax the other fingers', 'Hold the pinch'],
  },
}

function build(): Record<GuideGesture, GestureInfo> {
  const out = {} as Record<GuideGesture, GestureInfo>
  for (const key of Object.keys(RAW) as GuideGesture[]) {
    const effectId = effectFor(key)
    out[key] = {
      id: key,
      name: RAW[key].name,
      description: RAW[key].description,
      howTo: RAW[key].howTo,
      effectId,
      effectLabel: EFFECT_LABELS[effectId],
      pose: GESTURE_POSES[key],
    }
  }
  return out
}

export const GESTURES: Record<GuideGesture, GestureInfo> = build()

/** Full gesture list for the Gesture Library, in a sensible teaching order. */
export const GUIDE_ORDER: GuideGesture[] = [
  Gesture.OPEN_PALM,
  Gesture.FIST,
  Gesture.PEACE,
  Gesture.POINTING,
  Gesture.THUMBS_UP,
  Gesture.THUMBS_DOWN,
  Gesture.OK,
  Gesture.ROCK,
  Gesture.PINCH,
]

/** Core subset taught in first-run onboarding. */
export const CORE_GESTURES: GuideGesture[] = [
  Gesture.OPEN_PALM,
  Gesture.FIST,
  Gesture.PEACE,
  Gesture.POINTING,
  Gesture.THUMBS_UP,
]
