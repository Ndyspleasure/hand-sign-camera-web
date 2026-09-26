import { useEffect, useRef, useState } from 'react'
import { blendPose, type FingerName, type HandPose } from '../hand-svg/handModel'
import type { GesturePose } from './poses'

const clamp01 = (n: number): number => (n < 0 ? 0 : n > 1 ? 1 : n)
const easeInOut = (t: number): number => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2)

const OPEN_POSE: HandPose = {
  thumb: { curl: 0 },
  index: { curl: 0 },
  middle: { curl: 0 },
  ring: { curl: 0 },
  pinky: { curl: 0 },
}

/** Fingers animate in this order for a natural, staggered "forming" motion. */
const FORM_ORDER: FingerName[] = ['pinky', 'ring', 'middle', 'index', 'thumb']

function fullProgress(value: number): Record<FingerName, number> {
  return { thumb: value, index: value, middle: value, ring: value, pinky: value }
}

// Timeline (ms) for one demonstration cycle.
const FORM = 950
const HOLD = 900
const RELEASE = 550
const REST = 650
const STAGGER = 120
const FINGER_DURATION = 480
const CYCLE = FORM + HOLD + RELEASE + REST

export interface GestureAnimationOptions {
  /** When false, the static target pose is shown (no animation). */
  play?: boolean
  /** Loop the demonstration (default true). */
  loop?: boolean
}

/**
 * Drives a live {@link HandPose} that demonstrates a gesture: fingers curl into
 * the shape one after another, hold, then release back to an open hand and
 * repeat. Lightweight (one rAF per animated hand); pass `play: false` to render
 * the final pose statically.
 */
export function useGestureAnimation(
  target: GesturePose,
  options: GestureAnimationOptions = {},
): HandPose {
  const { play = true, loop = true } = options
  const [pose, setPose] = useState<HandPose>(target.pose)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (!play) {
      setPose(target.pose)
      return
    }

    const start = performance.now()
    const to = target.pose

    const tick = (now: number): void => {
      let e = now - start
      if (loop) e %= CYCLE
      else if (e > CYCLE) e = CYCLE

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

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [target, play, loop])

  return pose
}
