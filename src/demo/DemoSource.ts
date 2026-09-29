import { SCRIPTS, sampleScript, scriptDuration, type FigureFrame, type Script } from '../gestures/scripts'
import { GESTURE_POSES } from '../gestures/poses'
import {
  composeTwoHands,
  rotatePoints,
  VIEW_CENTER,
  VIEW_HEIGHT,
  type Point,
  type TwoHandLayout,
} from '../hand-svg/handModel'
import { Gesture } from '../shared/Gesture'
import type { TrackedHand } from '../shared/TrackingTypes'
import type { GuideGesture } from '../gestures/registry'

/**
 * Demo mode: synthetic hands for the whole pipeline, played from the same
 * keyframe scripts as the guide. Hands come out like MediaPipe's (normalized,
 * un-mirrored), so they go through the real recognizer, stabilizer, wave
 * detector and effects exactly like camera input.
 */

interface Segment {
  gesture: GuideGesture
  script: Script
  /** Horizontal swing (in hand-model units) for the wave detector. */
  swing?: number
  /** How long to stay on this segment (ms). */
  ms: number
}

const PAIR_LAYOUT: TwoHandLayout = { width: 440, dx: 230 }

const pick = (g: GuideGesture, name?: string): Script =>
  SCRIPTS[g].find((s) => s.name === name) ?? SCRIPTS[g][0]

const seg = (gesture: GuideGesture, name?: string, extra: Partial<Segment> = {}): Segment => {
  const script = pick(gesture, name)
  return { gesture, script, ms: Math.max(2600, scriptDuration(script) + 400), ...extra }
}

/** One hand FIST and the other PEACE at the same time: two independent effects. */
const MIXED: Script = {
  name: 'Mixed',
  pair: true,
  frames: [
    { pose: GESTURE_POSES[Gesture.OPEN_PALM].pose, dur: 400, hold: 300 },
    { pose: GESTURE_POSES[Gesture.PEACE].pose, dur: 700, hold: 2600 },
  ],
  left: [
    { pose: GESTURE_POSES[Gesture.OPEN_PALM].pose, dur: 400, hold: 300 },
    { pose: GESTURE_POSES[Gesture.FIST].pose, dur: 700, hold: 2600 },
  ],
}

export const DEMO_SEGMENTS: Segment[] = [
  seg(Gesture.OPEN_PALM, 'Form'),
  seg(Gesture.FIST, 'Squeeze'),
  seg(Gesture.PEACE, 'From fist'),
  seg(Gesture.POINTING, 'Aim'),
  seg(Gesture.THUMBS_UP, 'Bounce'),
  seg(Gesture.THUMBS_DOWN, 'Turn'),
  seg(Gesture.OK, 'Form'),
  seg(Gesture.ROCK, 'Headbang'),
  seg(Gesture.PINCH, 'Pinch'),
  seg(Gesture.CALL_ME, 'Shake'),
  seg(Gesture.THREE, 'Count to three'),
  seg(Gesture.FOUR, 'Count to four'),
  seg(Gesture.ILY, 'Form'),
  seg(Gesture.WAVE, 'Hello', { swing: 60, ms: 4200 }),
  seg(Gesture.PEACE, 'Double peace'),
  { gesture: Gesture.FIST, script: MIXED, ms: 3800 },
  seg(Gesture.HEART, 'Join'),
  seg(Gesture.DOUBLE_PALM, 'Charge'),
]

export const DEMO_LENGTH_MS = DEMO_SEGMENTS.reduce((s, x) => s + x.ms, 0)

function place(frame: FigureFrame): Point[] {
  let pts = frame.points
  if (frame.rotate) pts = rotatePoints(pts, frame.rotate)
  return pts.map((p) => ({
    x: VIEW_CENTER.x + (p.x - VIEW_CENTER.x) * frame.scale + frame.dx,
    y: VIEW_CENTER.y + (p.y - VIEW_CENTER.y) * frame.scale + frame.dy,
  }))
}

export interface DemoState {
  hands: TrackedHand[]
  gesture: GuideGesture
  variant: string
  index: number
}

/**
 * Hands at time `t` (ms since demo start) for a `width`×`height` canvas, as
 * normalized, un-mirrored landmarks (MediaPipe convention).
 */
export function demoHands(t: number, width: number, height: number): DemoState {
  let time = ((t % DEMO_LENGTH_MS) + DEMO_LENGTH_MS) % DEMO_LENGTH_MS
  let index = 0
  while (time >= DEMO_SEGMENTS[index].ms) {
    time -= DEMO_SEGMENTS[index].ms
    index++
  }
  const s = DEMO_SEGMENTS[index]
  const frame = sampleScript(s.script, time)
  const twoHand = GESTURE_POSES[s.gesture].twoHand
  const pair = s.script.pair === true || twoHand !== undefined

  // Model units → canvas pixels: the hand is about 74% of the frame's height.
  // Same scale for every segment; narrow (portrait) frames fit the widest pair.
  const k = Math.min((height * 0.74) / VIEW_HEIGHT, (width * 0.9) / (PAIR_LAYOUT.width + 40))
  const swing = s.swing ? Math.sin((time / 620) * Math.PI * 2) * s.swing : 0
  const drift = Math.sin(t / 2300) * 10

  let groups: Point[][]
  let modelWidth: number
  if (pair) {
    const layout = twoHand ?? PAIR_LAYOUT
    const spread = { ...layout, dx: layout.dx + frame.gap / 2 }
    const right = composeTwoHands(place({ ...frame, scale: 1 }), spread).right
    const left = composeTwoHands(place({ ...(frame.left ?? frame), scale: 1 }), spread).left
    const cx = layout.width / 2
    const scaled = (pts: Point[]) =>
      pts.map((p) => ({ x: cx + (p.x - cx) * frame.scale, y: VIEW_CENTER.y + (p.y - VIEW_CENTER.y) * frame.scale }))
    groups = [scaled(left), scaled(right)]
    modelWidth = layout.width
  } else {
    groups = [place(frame)]
    modelWidth = VIEW_CENTER.x * 2
  }

  const originX = width / 2 - (modelWidth / 2) * k
  const originY = height * 0.5 - VIEW_CENTER.y * k + height * 0.02
  const hands: TrackedHand[] = groups.map((pts, i) => ({
    handedness: pair ? (i === 0 ? 'Right' : 'Left') : 'Right',
    score: 0.97,
    landmarks: pts.map((p) => {
      const sx = originX + (p.x + swing + drift) * k
      const sy = originY + p.y * k
      // Un-mirror: the app projects x → (1 − x)·width.
      return { x: 1 - sx / width, y: sy / height, z: 0 }
    }),
  }))

  return { hands, gesture: s.gesture, variant: s.script.name, index }
}
