/** Recognized hand gestures (9 implemented + NONE). */
export enum Gesture {
  NONE = 'NONE',
  OPEN_PALM = 'OPEN_PALM',
  FIST = 'FIST',
  PEACE = 'PEACE',
  THUMBS_UP = 'THUMBS_UP',
  THUMBS_DOWN = 'THUMBS_DOWN',
  POINTING = 'POINTING',
  OK = 'OK',
  ROCK = 'ROCK',
  PINCH = 'PINCH',
}

/** Human-readable label for a gesture. */
export function gestureLabel(g: Gesture): string {
  switch (g) {
    case Gesture.OPEN_PALM:
      return 'Open Palm'
    case Gesture.FIST:
      return 'Fist'
    case Gesture.PEACE:
      return 'Peace'
    case Gesture.THUMBS_UP:
      return 'Thumbs Up'
    case Gesture.THUMBS_DOWN:
      return 'Thumbs Down'
    case Gesture.POINTING:
      return 'Pointing'
    case Gesture.OK:
      return 'OK'
    case Gesture.ROCK:
      return 'Rock'
    case Gesture.PINCH:
      return 'Pinch'
    default:
      return '—'
  }
}
