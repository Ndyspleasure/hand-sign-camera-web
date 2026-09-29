/** Recognized hand gestures: single-hand static, motion, and two-hand. */
export enum Gesture {
  NONE = 'NONE',
  // Single-hand, static
  OPEN_PALM = 'OPEN_PALM',
  FIST = 'FIST',
  PEACE = 'PEACE',
  THUMBS_UP = 'THUMBS_UP',
  THUMBS_DOWN = 'THUMBS_DOWN',
  POINTING = 'POINTING',
  OK = 'OK',
  ROCK = 'ROCK',
  PINCH = 'PINCH',
  CALL_ME = 'CALL_ME',
  THREE = 'THREE',
  FOUR = 'FOUR',
  ILY = 'ILY',
  // Single-hand, motion
  WAVE = 'WAVE',
  // Two-hand
  HEART = 'HEART',
  DOUBLE_PALM = 'DOUBLE_PALM',
}

export type GestureKind = 'static' | 'motion' | 'two-hand'

const KIND: Partial<Record<Gesture, GestureKind>> = {
  [Gesture.WAVE]: 'motion',
  [Gesture.HEART]: 'two-hand',
  [Gesture.DOUBLE_PALM]: 'two-hand',
}

/** Whether a gesture is a static pose, a motion, or needs both hands. */
export function gestureKind(g: Gesture): GestureKind {
  return KIND[g] ?? 'static'
}

const LABELS: Record<Gesture, string> = {
  [Gesture.NONE]: '—',
  [Gesture.OPEN_PALM]: 'Open Palm',
  [Gesture.FIST]: 'Fist',
  [Gesture.PEACE]: 'Peace',
  [Gesture.THUMBS_UP]: 'Thumbs Up',
  [Gesture.THUMBS_DOWN]: 'Thumbs Down',
  [Gesture.POINTING]: 'Pointing',
  [Gesture.OK]: 'OK',
  [Gesture.ROCK]: 'Rock',
  [Gesture.PINCH]: 'Pinch',
  [Gesture.CALL_ME]: 'Call Me',
  [Gesture.THREE]: 'Three',
  [Gesture.FOUR]: 'Four',
  [Gesture.ILY]: 'I Love You',
  [Gesture.WAVE]: 'Wave',
  [Gesture.HEART]: 'Heart',
  [Gesture.DOUBLE_PALM]: 'Double Palm',
}

const EMOJI: Record<Gesture, string> = {
  [Gesture.NONE]: '·',
  [Gesture.OPEN_PALM]: '✋',
  [Gesture.FIST]: '✊',
  [Gesture.PEACE]: '✌️',
  [Gesture.THUMBS_UP]: '👍',
  [Gesture.THUMBS_DOWN]: '👎',
  [Gesture.POINTING]: '☝️',
  [Gesture.OK]: '👌',
  [Gesture.ROCK]: '🤘',
  [Gesture.PINCH]: '🤏',
  [Gesture.CALL_ME]: '🤙',
  [Gesture.THREE]: '3️⃣',
  [Gesture.FOUR]: '4️⃣',
  [Gesture.ILY]: '🤟',
  [Gesture.WAVE]: '👋',
  [Gesture.HEART]: '🫶',
  [Gesture.DOUBLE_PALM]: '🙌',
}

/** Human-readable label for a gesture. */
export function gestureLabel(g: Gesture): string {
  return LABELS[g]
}

/** Emoji shorthand for a gesture. */
export function gestureEmoji(g: Gesture): string {
  return EMOJI[g]
}
