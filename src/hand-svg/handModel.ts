/**
 * Canonical 2D hand model for the SVG gesture guide.
 *
 * The model mirrors MediaPipe's 21-landmark topology (see shared/HandTopology)
 * so the guide's skeleton matches the tracker's. A {@link HandPose} describes
 * each finger's curl (0 = fully extended, 1 = fully curled) plus optional
 * per-landmark overrides; {@link resolveLandmarks} turns a pose into 21 points
 * that can be interpolated for animation.
 *
 * Layout: a right hand, palm to the viewer, fingers pointing up, in a
 * 200 x 260 viewBox. Wrist at the bottom, fingertips at the top.
 */

export const VIEW_WIDTH = 200
export const VIEW_HEIGHT = 260
/** Center used for whole-hand rotations (e.g. thumbs-down). */
export const VIEW_CENTER = { x: 100, y: 132 } as const

export type FingerName = 'thumb' | 'index' | 'middle' | 'ring' | 'pinky'
export const FINGER_NAMES: FingerName[] = ['thumb', 'index', 'middle', 'ring', 'pinky']

export interface Point {
  x: number
  y: number
}

/** Movable landmark indices per finger, ordered proximal → tip. */
export const FINGER_JOINTS: Record<FingerName, number[]> = {
  thumb: [2, 3, 4],
  index: [6, 7, 8],
  middle: [10, 11, 12],
  ring: [14, 15, 16],
  pinky: [18, 19, 20],
}

/** All 21 landmark indices grouped by finger, for highlight decisions. */
export const FINGER_LANDMARKS: Record<FingerName, number[]> = {
  thumb: [1, 2, 3, 4],
  index: [5, 6, 7, 8],
  middle: [9, 10, 11, 12],
  ring: [13, 14, 15, 16],
  pinky: [17, 18, 19, 20],
}

/** Fixed landmarks (wrist, thumb CMC, and the four finger MCP knuckles). */
const BASE: Record<number, Point> = {
  0: { x: 100, y: 240 }, // wrist
  1: { x: 72, y: 198 }, // thumb CMC
  5: { x: 80, y: 150 }, // index MCP
  9: { x: 104, y: 146 }, // middle MCP
  13: { x: 126, y: 150 }, // ring MCP
  17: { x: 146, y: 160 }, // pinky MCP
}

/** Movable joints when the finger is fully extended. */
const EXTENDED: Record<number, Point> = {
  2: { x: 56, y: 176 }, 3: { x: 44, y: 156 }, 4: { x: 34, y: 138 },
  6: { x: 77, y: 116 }, 7: { x: 75, y: 92 }, 8: { x: 73, y: 72 },
  10: { x: 104, y: 108 }, 11: { x: 104, y: 82 }, 12: { x: 104, y: 60 },
  14: { x: 129, y: 114 }, 15: { x: 131, y: 90 }, 16: { x: 133, y: 70 },
  18: { x: 150, y: 130 }, 19: { x: 153, y: 110 }, 20: { x: 156, y: 94 },
}

/** Movable joints when the finger is fully curled toward the palm. */
const CURLED: Record<number, Point> = {
  2: { x: 60, y: 180 }, 3: { x: 74, y: 170 }, 4: { x: 90, y: 162 },
  6: { x: 80, y: 122 }, 7: { x: 82, y: 140 }, 8: { x: 80, y: 152 },
  10: { x: 104, y: 120 }, 11: { x: 106, y: 140 }, 12: { x: 104, y: 152 },
  14: { x: 126, y: 122 }, 15: { x: 125, y: 140 }, 16: { x: 126, y: 152 },
  18: { x: 146, y: 132 }, 19: { x: 146, y: 148 }, 20: { x: 145, y: 158 },
}

export interface FingerState {
  /** 0 = extended, 1 = curled. */
  curl: number
  /** Emphasize this finger in the guide. */
  highlight?: boolean
}

export interface HandPose {
  thumb: FingerState
  index: FingerState
  middle: FingerState
  ring: FingerState
  pinky: FingerState
  /** Pin specific landmarks (e.g. the pinch point for OK / PINCH). */
  overrides?: Record<number, Point>
}

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n)

const lerpPoint = (a: Point, b: Point, t: number): Point => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
})

/** Resolve a pose into 21 absolute landmark points. */
export function resolveLandmarks(pose: HandPose): Point[] {
  const pts: Point[] = new Array(21)

  for (const key of Object.keys(BASE)) {
    const i = Number(key)
    pts[i] = { ...BASE[i] }
  }

  for (const finger of FINGER_NAMES) {
    const t = clamp01(pose[finger].curl)
    for (const idx of FINGER_JOINTS[finger]) {
      pts[idx] = lerpPoint(EXTENDED[idx], CURLED[idx], t)
    }
  }

  if (pose.overrides) {
    for (const key of Object.keys(pose.overrides)) {
      const i = Number(key)
      pts[i] = { ...pose.overrides[i] }
    }
  }

  return pts
}

/** Which finger a landmark index belongs to (null for the wrist). */
export function fingerOfLandmark(index: number): FingerName | null {
  for (const finger of FINGER_NAMES) {
    if (FINGER_LANDMARKS[finger].includes(index)) return finger
  }
  return null
}

/** Blend two poses finger-by-finger (used by the animation engine). */
export function blendPose(from: HandPose, to: HandPose, curlByFinger: Record<FingerName, number>): HandPose {
  const out = {} as HandPose
  for (const finger of FINGER_NAMES) {
    const t = clamp01(curlByFinger[finger])
    out[finger] = {
      curl: from[finger].curl + (to[finger].curl - from[finger].curl) * t,
      highlight: to[finger].highlight,
    }
  }
  // Overrides only apply once the pose is essentially complete.
  const nearlyDone = FINGER_NAMES.every((f) => curlByFinger[f] > 0.85)
  if (nearlyDone) out.overrides = to.overrides
  return out
}
