import { EFFECT_FOR_GESTURE, EFFECT_LABELS, type EffectId } from '../shared/effectMap'
import { Gesture, gestureEmoji, gestureKind, gestureLabel, type GestureKind } from '../shared/Gesture'
import { GESTURE_POSES, type GesturePose } from './poses'

/**
 * Presentation metadata for gestures — the single source of truth for the
 * tutorial, gesture guide and onboarding. It is keyed by the recognizer's
 * {@link Gesture} enum and NEVER redefines which gestures exist: the recognizer
 * (GeometricGestureRecognizer) remains authoritative, and effects come from the
 * shared EFFECT_FOR_GESTURE map. `Record<GuideGesture, …>` makes the compiler
 * reject the file if a gesture is added without a matching entry here.
 */

/** Every recognizer gesture except NONE (which is "no gesture"). */
export type GuideGesture = Exclude<Gesture, Gesture.NONE>

export interface GestureInfo {
  id: GuideGesture
  name: string
  emoji: string
  kind: GestureKind
  description: string
  /** Short, visual step-by-step for "How to make it". */
  howTo: string[]
  effectId: EffectId
  effectLabel: string
  pose: GesturePose
}

interface RawInfo {
  description: string
  howTo: string[]
}

const RAW: Record<GuideGesture, RawInfo> = {
  [Gesture.OPEN_PALM]: {
    description: 'Show your whole hand with all five fingers spread.',
    howTo: ['Face your palm to the camera', 'Spread all five fingers', 'Hold steady'],
  },
  [Gesture.FIST]: {
    description: 'Close every finger into a fist.',
    howTo: ['Curl all four fingers in', 'Wrap your thumb across', 'Hold the fist steady'],
  },
  [Gesture.PEACE]: {
    description: 'Index and middle fingers up, the rest curled. Move it to paint trails.',
    howTo: ['Raise your index and middle finger', 'Curl ring and pinky', 'Move your hand to draw rainbows'],
  },
  [Gesture.THUMBS_UP]: {
    description: 'Thumb pointing up while the other fingers stay curled.',
    howTo: ['Curl all four fingers', 'Point your thumb up', 'Hold steady'],
  },
  [Gesture.THUMBS_DOWN]: {
    description: 'Thumb pointing down while the other fingers stay curled.',
    howTo: ['Curl all four fingers', 'Point your thumb down', 'Hold steady'],
  },
  [Gesture.POINTING]: {
    description: 'Only the index finger extended — aim it anywhere.',
    howTo: ['Curl middle, ring and pinky', 'Keep your index extended', 'Point toward the camera'],
  },
  [Gesture.OK]: {
    description: 'Thumb and index form a ring, the other fingers extended.',
    howTo: ['Touch your thumb and index tips', 'Keep the other three fingers extended', 'Hold the ring shape'],
  },
  [Gesture.ROCK]: {
    description: 'Index and pinky up, middle and ring curled, thumb tucked.',
    howTo: ['Raise your index and pinky', 'Curl middle and ring', 'Tuck your thumb in'],
  },
  [Gesture.PINCH]: {
    description: 'Thumb and index tips pinched together, other fingers curled.',
    howTo: ['Bring thumb and index tips together', 'Keep the index pointing forward', 'Curl the other fingers'],
  },
  [Gesture.CALL_ME]: {
    description: 'Thumb and pinky out, like holding a phone.',
    howTo: ['Curl index, middle and ring fingers', 'Stretch out your thumb and pinky', 'Hold it like a phone'],
  },
  [Gesture.THREE]: {
    description: 'Index, middle and ring fingers up.',
    howTo: ['Raise index, middle and ring fingers', 'Fold your pinky down', 'Tuck your thumb over it'],
  },
  [Gesture.FOUR]: {
    description: 'Four fingers up with the thumb tucked in.',
    howTo: ['Raise all four fingers', 'Fold your thumb across the palm', 'Keep the fingers straight'],
  },
  [Gesture.ILY]: {
    description: 'Thumb, index and pinky out — sign language for "I love you".',
    howTo: ['Curl your middle and ring fingers', 'Raise index and pinky', 'Stretch your thumb out to the side'],
  },
  [Gesture.WAVE]: {
    description: 'Swing an open hand side to side.',
    howTo: ['Show an open palm', 'Swing it left and right', 'Keep waving'],
  },
  [Gesture.HEART]: {
    description: 'Both hands make a heart: index tips touch on top, thumb tips below.',
    howTo: ['Curve the fingers of both hands', 'Touch your index fingertips together', 'Touch your thumb tips below them'],
  },
  [Gesture.DOUBLE_PALM]: {
    description: 'Both open palms to the camera, held apart.',
    howTo: ['Raise both hands', 'Open both palms toward the camera', 'Hold them apart to charge the beam'],
  },
}

function build(): Record<GuideGesture, GestureInfo> {
  const out = {} as Record<GuideGesture, GestureInfo>
  for (const key of Object.keys(RAW) as GuideGesture[]) {
    const effectId = EFFECT_FOR_GESTURE[key]
    out[key] = {
      id: key,
      name: gestureLabel(key),
      emoji: gestureEmoji(key),
      kind: gestureKind(key),
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
  Gesture.CALL_ME,
  Gesture.THREE,
  Gesture.FOUR,
  Gesture.ILY,
  Gesture.WAVE,
  Gesture.HEART,
  Gesture.DOUBLE_PALM,
]

/** Core subset taught in first-run onboarding. */
export const CORE_GESTURES: GuideGesture[] = [
  Gesture.OPEN_PALM,
  Gesture.FIST,
  Gesture.PEACE,
  Gesture.POINTING,
  Gesture.THUMBS_UP,
]

/** Validate an untrusted string (e.g. a `?guide=` deep link). */
export function isGuideGesture(value: string | null): value is GuideGesture {
  return value !== null && Object.prototype.hasOwnProperty.call(GESTURES, value)
}
