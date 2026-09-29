/**
 * HandTopology — MediaPipe 21-point hand landmark indices & connections.
 *
 * Landmark layout (per MediaPipe Hands standard):
 *   0: wrist
 *   1-4:   thumb  (CMC, MCP, IP, TIP)
 *   5-8:   index  (MCP, PIP, DIP, TIP)
 *   9-12:  middle (MCP, PIP, DIP, TIP)
 *   13-16: ring   (MCP, PIP, DIP, TIP)
 *   17-20: pinky  (MCP, PIP, DIP, TIP)
 */

export const HandLandmark = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_MCP: 5,
  INDEX_PIP: 6,
  INDEX_DIP: 7,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
  MIDDLE_PIP: 10,
  MIDDLE_DIP: 11,
  MIDDLE_TIP: 12,
  RING_MCP: 13,
  RING_PIP: 14,
  RING_DIP: 15,
  RING_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20,
} as const

/** Landmark names by index (e.g. LANDMARK_NAMES[8] === 'INDEX_TIP'). */
export const LANDMARK_NAMES: readonly string[] = Object.keys(HandLandmark)

/** Fingertip landmark indices (thumb → pinky). */
export const FINGERTIPS = [4, 8, 12, 16, 20] as const

/** Bone connections used to draw the hand skeleton. */
export const HAND_CONNECTIONS: ReadonlyArray<readonly [number, number]> = [
  // Thumb
  [0, 1], [1, 2], [2, 3], [3, 4],
  // Index
  [0, 5], [5, 6], [6, 7], [7, 8],
  // Middle
  [5, 9], [9, 10], [10, 11], [11, 12],
  // Ring
  [9, 13], [13, 14], [14, 15], [15, 16],
  // Pinky
  [13, 17], [17, 18], [18, 19], [19, 20],
  // Palm base
  [0, 17],
]

/**
 * Per-finger tip + reference joint used by the gesture recognizer.
 * `ref` is the joint the tip is compared against to decide "extended".
 */
export const FINGERS = {
  thumb: { tip: HandLandmark.THUMB_TIP, ref: HandLandmark.THUMB_IP },
  index: { tip: HandLandmark.INDEX_TIP, ref: HandLandmark.INDEX_PIP },
  middle: { tip: HandLandmark.MIDDLE_TIP, ref: HandLandmark.MIDDLE_PIP },
  ring: { tip: HandLandmark.RING_TIP, ref: HandLandmark.RING_PIP },
  pinky: { tip: HandLandmark.PINKY_TIP, ref: HandLandmark.PINKY_PIP },
} as const
