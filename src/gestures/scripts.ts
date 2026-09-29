import {
  fingerOfLandmark,
  FINGER_NAMES,
  resolveLandmarks,
  type FingerName,
  type HandPose,
  type Point,
} from '../hand-svg/handModel'
import { Gesture } from '../shared/Gesture'
import { GESTURE_POSES } from './poses'
import type { GuideGesture } from './registry'

/**
 * Keyframe animation scripts for the gesture guide, tutorial and demo.
 *
 * A script is a looping list of keyframes. Each keyframe is a hand pose plus a
 * whole-hand transform; the transition into a keyframe interpolates the 21
 * landmark points (so pinch / heart overrides animate smoothly), optionally
 * staggered finger by finger.
 */

export interface Keyframe {
  pose: HandPose
  /** Transition time into this keyframe (ms). */
  dur: number
  /** Time to hold this keyframe (ms). */
  hold: number
  /** Fingers move one after another in this order during the transition. */
  order?: FingerName[]
  /** Delay between fingers when `order` is set (ms). */
  stagger?: number
  /** Whole-hand rotation (degrees), offset, scale. */
  rotate?: number
  dx?: number
  dy?: number
  scale?: number
  /** Two-hand gestures: extra separation between the hands (drawing units). */
  gap?: number
}

export interface Script {
  name: string
  frames: Keyframe[]
  /** Draw a mirrored pair of hands (both hands making the gesture). */
  pair?: boolean
  /** Pair only: the left hand's own keyframes (same total duration). */
  left?: Keyframe[]
}

/** A fully resolved frame, ready to draw. */
export interface FigureFrame {
  points: Point[]
  /** Pose whose `highlight` flags color the fingers. */
  highlight: HandPose
  rotate: number
  dx: number
  dy: number
  scale: number
  gap: number
  /** Pair scripts with independent hands: the left hand's frame. */
  left?: FigureFrame
}

// ---- Sampling -----------------------------------------------------------

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n)
const ease = (t: number): number => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

const resolved = new WeakMap<HandPose, Point[]>()
function pointsOf(pose: HandPose): Point[] {
  let pts = resolved.get(pose)
  if (!pts) {
    pts = resolveLandmarks(pose)
    resolved.set(pose, pts)
  }
  return pts
}

/** The static frame of a keyframe. */
export function frameOf(k: Keyframe): FigureFrame {
  return {
    points: pointsOf(k.pose),
    highlight: k.pose,
    rotate: k.rotate ?? 0,
    dx: k.dx ?? 0,
    dy: k.dy ?? 0,
    scale: k.scale ?? 1,
    gap: k.gap ?? 0,
  }
}

function transition(from: Keyframe, to: Keyframe, elapsed: number): FigureFrame {
  const u = clamp01(to.dur > 0 ? elapsed / to.dur : 1)
  const g = ease(u)
  const progress = {} as Record<FingerName, number>
  if (to.order && to.order.length > 1) {
    const stagger = to.stagger ?? 110
    const fingerDur = Math.max(to.dur - stagger * (to.order.length - 1), to.dur * 0.4)
    for (const f of FINGER_NAMES) {
      const i = to.order.indexOf(f)
      progress[f] = i < 0 ? g : ease(clamp01((elapsed - i * stagger) / fingerDur))
    }
  } else {
    for (const f of FINGER_NAMES) progress[f] = g
  }

  const a = pointsOf(from.pose)
  const b = pointsOf(to.pose)
  const points = a.map((p, i) => {
    const finger = fingerOfLandmark(i)
    const t = finger ? progress[finger] : g
    return { x: lerp(p.x, b[i].x, t), y: lerp(p.y, b[i].y, t) }
  })

  return {
    points,
    highlight: to.pose,
    rotate: lerp(from.rotate ?? 0, to.rotate ?? 0, g),
    dx: lerp(from.dx ?? 0, to.dx ?? 0, g),
    dy: lerp(from.dy ?? 0, to.dy ?? 0, g),
    scale: lerp(from.scale ?? 1, to.scale ?? 1, g),
    gap: lerp(from.gap ?? 0, to.gap ?? 0, g),
  }
}

function framesDuration(frames: Keyframe[]): number {
  return frames.reduce((sum, k) => sum + k.dur + k.hold, 0)
}

/** Total length of one pass through a script (ms). */
export function scriptDuration(script: Script): number {
  return framesDuration(script.frames)
}

function sampleFrames(frames: Keyframe[], t: number, loop: boolean): FigureFrame {
  const total = framesDuration(frames)
  let time = loop ? ((t % total) + total) % total : Math.min(Math.max(t, 0), total)
  for (let i = 0; i < frames.length; i++) {
    const k = frames[i]
    if (time < k.dur) {
      const prev = i > 0 ? frames[i - 1] : loop ? frames[frames.length - 1] : k
      return transition(prev, k, time)
    }
    time -= k.dur
    if (time < k.hold) return frameOf(k)
    time -= k.hold
  }
  return frameOf(frames[frames.length - 1])
}

/**
 * The frame at time `t` (ms). Looping scripts transition from the last
 * keyframe back to the first; with `loop: false` time is clamped to one pass
 * and the first keyframe simply starts in place.
 */
export function sampleScript(script: Script, t: number, loop = true): FigureFrame {
  const frame = sampleFrames(script.frames, t, loop)
  if (script.left) frame.left = sampleFrames(script.left, t, loop)
  return frame
}

// ---- Script library -------------------------------------------------------

const P = (g: Gesture): HandPose => GESTURE_POSES[g].pose

/** Same pose without highlighted fingers (a neutral starting point). */
function plain(pose: HandPose): HandPose {
  const out = { ...pose } as HandPose
  for (const f of FINGER_NAMES) out[f] = { curl: pose[f].curl }
  return out
}

/** Bend the given fingers a little (a "pulse"). */
function bend(pose: HandPose, fingers: FingerName[], amount: number): HandPose {
  const out = { ...pose } as HandPose
  for (const f of fingers) out[f] = { ...pose[f], curl: Math.min(1, pose[f].curl + amount) }
  return out
}

const OPEN = plain(P(Gesture.OPEN_PALM))
const FIST = plain(P(Gesture.FIST))
const CURL_ORDER: FingerName[] = ['pinky', 'ring', 'middle', 'index', 'thumb']
const EXTEND_ORDER: FingerName[] = ['thumb', 'index', 'middle', 'ring', 'pinky']
const COUNT = [Gesture.POINTING, Gesture.PEACE, Gesture.THREE, Gesture.FOUR, Gesture.OPEN_PALM]

/** Pinch with the tips apart, for the open/close pinch animation. */
const PINCH_OPEN: HandPose = {
  ...P(Gesture.PINCH),
  overrides: { 3: { x: 28, y: 148 }, 4: { x: 20, y: 126 }, 7: { x: 62, y: 92 }, 8: { x: 52, y: 80 } },
}

function highlightedFingers(pose: HandPose): FingerName[] {
  return FINGER_NAMES.filter((f) => pose[f].highlight)
}

const form = (g: Gesture): Script => ({
  name: 'Form',
  frames: [
    { pose: OPEN, dur: 500, hold: 450 },
    { pose: P(g), dur: 950, hold: 1100, order: CURL_ORDER, stagger: 110 },
  ],
})

const fromFist = (g: Gesture, order: FingerName[] = EXTEND_ORDER, rotate = 0): Script => ({
  name: 'From fist',
  frames: [
    { pose: FIST, dur: 500, hold: 450, rotate },
    { pose: P(g), dur: 950, hold: 1100, order, stagger: 140, rotate },
  ],
})

/** Count up finger by finger to `upTo` (1–5). */
const count = (upTo: number, name = 'Count'): Script => ({
  name,
  frames: [
    { pose: FIST, dur: 450, hold: 350 },
    ...COUNT.slice(0, upTo).map((g, i) => ({
      pose: P(g),
      dur: 380,
      hold: i === upTo - 1 ? 1200 : 380,
    })),
  ],
})

const pulse = (g: Gesture, name = 'Pulse'): Script => {
  const base = P(g)
  const soft = bend(base, highlightedFingers(base), 0.28)
  return {
    name,
    frames: [
      { pose: base, dur: 450, hold: 300 },
      { pose: soft, dur: 260, hold: 60 },
      { pose: base, dur: 260, hold: 220 },
      { pose: soft, dur: 260, hold: 60 },
      { pose: base, dur: 260, hold: 900 },
    ],
  }
}

/** Rock the whole hand side to side. */
const sway = (g: Gesture, name: string, angle: number, times = 2, rotate = 0): Script => {
  const pose = P(g)
  const frames: Keyframe[] = [{ pose, dur: 400, hold: 200, rotate }]
  for (let i = 0; i < times; i++) {
    frames.push({ pose, dur: 320, hold: 40, rotate: rotate - angle })
    frames.push({ pose, dur: 320, hold: 40, rotate: rotate + angle })
  }
  frames.push({ pose, dur: 320, hold: 700, rotate })
  return { name, frames }
}

/** Bounce the whole hand vertically. */
const bounce = (g: Gesture, name: string, lift: number, times = 2, rotate = 0): Script => {
  const pose = P(g)
  const frames: Keyframe[] = [{ pose, dur: 400, hold: 200, rotate }]
  for (let i = 0; i < times; i++) {
    frames.push({ pose, dur: 200, hold: 20, dy: lift, rotate })
    frames.push({ pose, dur: 240, hold: 80, dy: 0, rotate })
  }
  frames[frames.length - 1].hold = 800
  return { name, frames }
}

/** Count frames: fist, then 1…n fingers. */
const countFrames = (upTo: number, lastHold = 1200): Keyframe[] => [
  { pose: FIST, dur: 450, hold: 350 },
  ...COUNT.slice(0, upTo).map((g, i) => ({
    pose: P(g),
    dur: 380,
    hold: i === upTo - 1 ? lastHold : 380,
  })),
]

/** Both hands form the gesture together. */
const both = (g: Gesture, name: string, rotate = 0): Script => ({
  name,
  pair: true,
  frames: [
    { pose: FIST, dur: 450, hold: 350, rotate },
    { pose: P(g), dur: 900, hold: 1400, order: EXTEND_ORDER, stagger: 120, rotate },
  ],
})

/** The right hand plays its frames, then the left hand plays its own. */
const relay = (name: string, right: Keyframe[], left: Keyframe[]): Script => {
  const r = framesDuration(right)
  const l = framesDuration(left)
  const last = right.length - 1
  return {
    name,
    pair: true,
    frames: right.map((k, i) => (i === last ? { ...k, hold: k.hold + l } : k)),
    left: left.map((k, i) => (i === 0 ? { ...k, hold: k.hold + r } : k)),
  }
}

/** Two hands tap toward each other. */
const bump = (g: Gesture, name: string): Script => {
  const pose = P(g)
  return {
    name,
    pair: true,
    frames: [
      { pose, dur: 400, hold: 250, gap: 60 },
      { pose, dur: 260, hold: 90, gap: -20 },
      { pose, dur: 300, hold: 150, gap: 60 },
      { pose, dur: 260, hold: 90, gap: -20 },
      { pose, dur: 360, hold: 800, gap: 60 },
    ],
  }
}

export const SCRIPTS: Record<GuideGesture, Script[]> = {
  [Gesture.OPEN_PALM]: [form(Gesture.OPEN_PALM), count(5, 'Count to five'), pulse(Gesture.OPEN_PALM, 'Breathe'),
    relay('Hand to hand', [{ pose: FIST, dur: 450, hold: 300 }, { pose: P(Gesture.OPEN_PALM), dur: 800, hold: 500, order: EXTEND_ORDER, stagger: 110 }], [{ pose: FIST, dur: 450, hold: 300 }, { pose: P(Gesture.OPEN_PALM), dur: 800, hold: 1100, order: EXTEND_ORDER, stagger: 110 }]),
  ],
  [Gesture.FIST]: [
    form(Gesture.FIST),
    {
      name: 'Squeeze',
      frames: [
        { pose: P(Gesture.FIST), dur: 400, hold: 250 },
        { pose: bend(P(Gesture.FIST), ['index', 'middle', 'ring', 'pinky'], -0.3), dur: 300, hold: 80, scale: 1.04 },
        { pose: P(Gesture.FIST), dur: 220, hold: 250, scale: 0.97 },
        { pose: bend(P(Gesture.FIST), ['index', 'middle', 'ring', 'pinky'], -0.3), dur: 300, hold: 80, scale: 1.04 },
        { pose: P(Gesture.FIST), dur: 220, hold: 700 },
      ],
    },
    {
      name: 'Punch',
      frames: [
        { pose: P(Gesture.FIST), dur: 400, hold: 300 },
        { pose: P(Gesture.FIST), dur: 160, hold: 120, scale: 1.18, dy: -6 },
        { pose: P(Gesture.FIST), dur: 320, hold: 250 },
        { pose: P(Gesture.FIST), dur: 160, hold: 120, scale: 1.18, dy: -6 },
        { pose: P(Gesture.FIST), dur: 320, hold: 700 },
      ],
    },
    both(Gesture.FIST, 'Both fists'),
    bump(Gesture.FIST, 'Fist bump'),
  ],
  [Gesture.PEACE]: [fromFist(Gesture.PEACE), count(2, 'Count to two'), sway(Gesture.PEACE, 'Sway', 10),
    both(Gesture.PEACE, 'Double peace'),
    relay('Count to seven', countFrames(5, 500), countFrames(2)),
  ],
  [Gesture.POINTING]: [
    fromFist(Gesture.POINTING),
    count(1, 'Count to one'),
    {
      name: 'Aim',
      frames: [
        { pose: P(Gesture.POINTING), dur: 400, hold: 250 },
        { pose: P(Gesture.POINTING), dur: 450, hold: 250, rotate: -24 },
        { pose: P(Gesture.POINTING), dur: 650, hold: 250, rotate: 24 },
        { pose: P(Gesture.POINTING), dur: 450, hold: 700 },
      ],
    },
    both(Gesture.POINTING, 'Point with both'),
    relay('One and one', countFrames(1, 500), countFrames(1)),
  ],
  [Gesture.THUMBS_UP]: [
    fromFist(Gesture.THUMBS_UP),
    bounce(Gesture.THUMBS_UP, 'Bounce', -14),
    pulse(Gesture.THUMBS_UP, 'Like'),
    both(Gesture.THUMBS_UP, 'Double thumbs up'),
  ],
  [Gesture.THUMBS_DOWN]: [
    {
      name: 'Turn',
      frames: [
        { pose: FIST, dur: 450, hold: 350 },
        { pose: P(Gesture.THUMBS_UP), dur: 600, hold: 250, order: EXTEND_ORDER },
        { pose: P(Gesture.THUMBS_DOWN), dur: 800, hold: 1000, rotate: 180 },
      ],
    },
    fromFist(Gesture.THUMBS_DOWN, EXTEND_ORDER, 180),
    bounce(Gesture.THUMBS_DOWN, 'Drop', 12, 2, 180),
    both(Gesture.THUMBS_DOWN, 'Double thumbs down', 180),
  ],
  [Gesture.OK]: [form(Gesture.OK), fromFist(Gesture.OK, ['middle', 'ring', 'pinky', 'index', 'thumb']), pulse(Gesture.OK, 'Ring pulse'),
    both(Gesture.OK, 'Both hands'),
  ],
  [Gesture.ROCK]: [
    fromFist(Gesture.ROCK, ['index', 'pinky', 'thumb', 'middle', 'ring']),
    bounce(Gesture.ROCK, 'Headbang', 14, 3),
    pulse(Gesture.ROCK),
    both(Gesture.ROCK, 'Double rock'),
  ],
  [Gesture.PINCH]: [
    {
      name: 'Pinch',
      frames: [
        { pose: PINCH_OPEN, dur: 450, hold: 250 },
        { pose: P(Gesture.PINCH), dur: 320, hold: 250 },
        { pose: PINCH_OPEN, dur: 320, hold: 200 },
        { pose: P(Gesture.PINCH), dur: 320, hold: 900 },
      ],
    },
    fromFist(Gesture.PINCH, ['index', 'thumb', 'middle', 'ring', 'pinky']),
    form(Gesture.PINCH),
    both(Gesture.PINCH, 'Both hands'),
  ],
  [Gesture.CALL_ME]: [
    fromFist(Gesture.CALL_ME, ['thumb', 'pinky', 'index', 'middle', 'ring']),
    sway(Gesture.CALL_ME, 'Shake', 14, 3),
    pulse(Gesture.CALL_ME),
    both(Gesture.CALL_ME, 'Both hands'),
  ],
  [Gesture.THREE]: [count(3, 'Count to three'), fromFist(Gesture.THREE), pulse(Gesture.THREE),
    relay('Three and three', countFrames(3, 500), countFrames(3)),
    relay('Count to eight', countFrames(5, 500), countFrames(3)),
  ],
  [Gesture.FOUR]: [count(4, 'Count to four'), form(Gesture.FOUR), pulse(Gesture.FOUR),
    both(Gesture.FOUR, 'Both hands'),
    relay('Count to nine', countFrames(5, 500), countFrames(4)),
  ],
  [Gesture.ILY]: [
    fromFist(Gesture.ILY, ['index', 'pinky', 'thumb', 'middle', 'ring']),
    form(Gesture.ILY),
    sway(Gesture.ILY, 'Sway', 10),
    both(Gesture.ILY, 'Both hands'),
  ],
  [Gesture.WAVE]: [
    sway(Gesture.OPEN_PALM, 'Wave', 18, 3),
    {
      name: 'Hello',
      frames: [
        { pose: OPEN, dur: 400, hold: 150 },
        { pose: P(Gesture.OPEN_PALM), dur: 300, hold: 40, dx: -16, rotate: -14 },
        { pose: P(Gesture.OPEN_PALM), dur: 360, hold: 40, dx: 16, rotate: 14 },
        { pose: P(Gesture.OPEN_PALM), dur: 360, hold: 40, dx: -16, rotate: -14 },
        { pose: P(Gesture.OPEN_PALM), dur: 360, hold: 40, dx: 16, rotate: 14 },
        { pose: P(Gesture.OPEN_PALM), dur: 320, hold: 600 },
      ],
    },
    {
      name: 'Finger wave',
      frames: [
        { pose: P(Gesture.OPEN_PALM), dur: 400, hold: 200 },
        { pose: bend(P(Gesture.OPEN_PALM), ['index', 'middle', 'ring', 'pinky'], 0.55), dur: 600, hold: 60, order: ['index', 'middle', 'ring', 'pinky'], stagger: 90 },
        { pose: P(Gesture.OPEN_PALM), dur: 600, hold: 60, order: ['index', 'middle', 'ring', 'pinky'], stagger: 90 },
        { pose: bend(P(Gesture.OPEN_PALM), ['index', 'middle', 'ring', 'pinky'], 0.55), dur: 600, hold: 60, order: ['index', 'middle', 'ring', 'pinky'], stagger: 90 },
        { pose: P(Gesture.OPEN_PALM), dur: 600, hold: 700, order: ['index', 'middle', 'ring', 'pinky'], stagger: 90 },
      ],
    },
    { ...sway(Gesture.OPEN_PALM, 'Wave both hands', 18, 3), pair: true },
  ],
  [Gesture.HEART]: [
    {
      name: 'Join',
      frames: [
        { pose: OPEN, dur: 450, hold: 350, gap: 120 },
        { pose: P(Gesture.HEART), dur: 750, hold: 250, gap: 120, order: CURL_ORDER, stagger: 90 },
        { pose: P(Gesture.HEART), dur: 750, hold: 1300, gap: 0 },
      ],
    },
    {
      name: 'From fists',
      frames: [
        { pose: FIST, dur: 450, hold: 350, gap: 60 },
        { pose: P(Gesture.HEART), dur: 900, hold: 1200, gap: 0, order: ['index', 'thumb', 'middle', 'ring', 'pinky'], stagger: 110 },
      ],
    },
    {
      name: 'Beat',
      frames: [
        { pose: P(Gesture.HEART), dur: 400, hold: 250 },
        { pose: P(Gesture.HEART), dur: 160, hold: 60, scale: 1.1 },
        { pose: P(Gesture.HEART), dur: 200, hold: 80 },
        { pose: P(Gesture.HEART), dur: 160, hold: 60, scale: 1.08 },
        { pose: P(Gesture.HEART), dur: 240, hold: 800 },
      ],
    },
    {
      name: 'Open and close',
      frames: [
        { pose: P(Gesture.HEART), dur: 400, hold: 350, gap: 0 },
        { pose: P(Gesture.HEART), dur: 450, hold: 150, gap: 50 },
        { pose: P(Gesture.HEART), dur: 450, hold: 350, gap: 0 },
        { pose: P(Gesture.HEART), dur: 450, hold: 150, gap: 50 },
        { pose: P(Gesture.HEART), dur: 450, hold: 900, gap: 0 },
      ],
    },
  ],
  [Gesture.DOUBLE_PALM]: [
    {
      name: 'Open up',
      frames: [
        { pose: FIST, dur: 450, hold: 350, gap: -40 },
        { pose: P(Gesture.DOUBLE_PALM), dur: 900, hold: 1100, gap: 0, order: EXTEND_ORDER, stagger: 120 },
      ],
    },
    {
      name: 'Charge',
      frames: [
        { pose: P(Gesture.DOUBLE_PALM), dur: 400, hold: 200, gap: 0 },
        { pose: P(Gesture.DOUBLE_PALM), dur: 600, hold: 120, gap: -45, scale: 0.96 },
        { pose: P(Gesture.DOUBLE_PALM), dur: 380, hold: 120, gap: 30, scale: 1.04 },
        { pose: P(Gesture.DOUBLE_PALM), dur: 600, hold: 120, gap: -45, scale: 0.96 },
        { pose: P(Gesture.DOUBLE_PALM), dur: 380, hold: 800, gap: 0 },
      ],
    },
    relay('Count to ten', countFrames(5, 500), countFrames(5)),
    bump(Gesture.DOUBLE_PALM, 'High five')
  ],
}
