import { useEffect, useRef, useState } from 'react'
import { blendPose, type FingerName, type HandPose } from '../hand-svg/handModel'
import type { GesturePose } from './poses'

/**
 * Animation states a gesture demo can be in. `demonstrating` and `idle` are
 * motion loops; the rest hold the target pose and expose visual flags
 * (detected / shake / pulse) for the renderer to style.
 */
export type GestureAnimationState =
  | 'idle'
  | 'demonstrating'
  | 'waiting'
  | 'detected'
  | 'success'
  | 'error'

export interface AnimatedHand {
  pose: HandPose
  rotate?: number
  /** Success / detected styling. */
  detected: boolean
  /** Error shake. */
  shake: boolean
  /** Gentle "your turn" invite pulse. */
  pulse: boolean
}

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n)
const easeInOut = (t: number): number => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

const OPEN_POSE: HandPose = {
  thumb: { curl: 0 },
  index: { curl: 0 },
  middle: { curl: 0 },
  ring: { curl: 0 },
  pinky: { curl: 0 },
}

/** Fingers form the shape in this order for a natural staggered motion. */
const FORM_ORDER: FingerName[] = ['pinky', 'ring', 'middle', 'index', 'thumb']

function fullProgress(value: number): Record<FingerName, number> {
  return { thumb: value, index: value, middle: value, ring: value, pinky: value }
}

// Demonstration timeline (ms).
const FORM = 950
const HOLD = 900
const RELEASE = 550
const REST = 650
const STAGGER = 120
const FINGER_DURATION = 480
const CYCLE = FORM + HOLD + RELEASE + REST

const STATIC_STATES: GestureAnimationState[] = ['waiting', 'detected', 'success', 'error']

/**
 * Drives a live {@link AnimatedHand} for a gesture in a given state:
 * - demonstrating → fingers form the shape one by one, hold, release, loop
 * - idle          → gentle breathing around the shape
 * - waiting       → holds the shape with an invite pulse
 * - detected/success → holds the shape with success styling
 * - error         → holds the shape with a shake
 * Lightweight: one rAF only while actually animating.
 */
export function useGestureAnimation(
  target: GesturePose,
  state: GestureAnimationState = 'demonstrating',
): AnimatedHand {
  const [pose, setPose] = useState<HandPose>(target.pose)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const to = target.pose

    if (STATIC_STATES.includes(state)) {
      setPose(to)
      return
    }

    const start = performance.now()

    const tick = (now: number): void => {
      const elapsed = now - start

      if (state === 'idle') {
        // Breathe: ease slightly out of the shape and back, forever.
        const s = (Math.sin(elapsed / 900) + 1) / 2 // 0..1
        setPose(blendPose(OPEN_POSE, to, fullProgress(1 - 0.12 * s)))
      } else {
        // demonstrating
        const e = elapsed % CYCLE
        if (e < FORM) {
          const progress = fullProgress(0)
          FORM_ORDER.forEach((finger, i) => {
            progress[finger] = easeInOut(clamp01((e - i * STAGGER) / FINGER_DURATION))
          })
          setPose(blendPose(OPEN_POSE, to, progress))
        } else if (e < FORM + HOLD) {
          setPose(to)
        } else if (e < FORM + HOLD + RELEASE) {
          const rt = easeInOut((e - FORM - HOLD) / RELEASE)
          setPose(blendPose(OPEN_POSE, to, fullProgress(1 - rt)))
        } else {
          setPose(OPEN_POSE)
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [target, state])

  return {
    pose,
    rotate: target.rotate,
    detected: state === 'detected' || state === 'success',
    shake: state === 'error',
    pulse: state === 'waiting',
  }
}
