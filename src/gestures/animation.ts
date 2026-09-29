import { useCallback, useEffect, useRef, useState } from 'react'
import { GESTURE_POSES } from './poses'
import type { GuideGesture } from './registry'
import { frameOf, sampleScript, scriptDuration, SCRIPTS, type FigureFrame } from './scripts'
import type { Gesture } from '../shared/Gesture'

/** The gesture's target pose as a still frame (picker chips, success state). */
export function restFrame(gesture: Gesture): FigureFrame {
  const g = GESTURE_POSES[gesture]
  return frameOf({ pose: g.pose, rotate: g.rotate, dur: 0, hold: 0 })
}

export interface GesturePlayerOptions {
  /** Run the animation (false = hold the rest frame). */
  playing?: boolean
  /** Hold the target pose with success styling. */
  success?: boolean
  /** Move on to the next variant after this many passes (0 = never). */
  passes?: number
}

export interface GesturePlayer {
  frame: FigureFrame
  /** Index of the variant being played. */
  variant: number
  /** Variant names, in order. */
  variants: string[]
  /** Whether the current variant draws two hands. */
  pair: boolean
  /** Progress through the current variant (0..1), for a progress bar. */
  progress: number
  /** Pick a variant; it then loops until another is picked. */
  select: (index: number) => void
  /** Go back to cycling through every variant. */
  autoplay: () => void
  auto: boolean
}

const reducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true

/**
 * Plays a gesture's keyframe scripts: cycles through every variant (each
 * repeated `passes` times) until the user picks one, which then loops. One
 * requestAnimationFrame loop, only while playing.
 */
export function useGesturePlayer(gesture: GuideGesture, options: GesturePlayerOptions = {}): GesturePlayer {
  const { playing = true, success = false, passes = 2 } = options
  const scripts = SCRIPTS[gesture]
  const [variant, setVariant] = useState(0)
  const [auto, setAuto] = useState(true)
  const [frame, setFrame] = useState<FigureFrame>(() => restFrame(gesture))
  const [progress, setProgress] = useState(0)
  const startRef = useRef(0)

  // A new gesture starts at its first variant in autoplay.
  useEffect(() => {
    setVariant(0)
    setAuto(true)
  }, [gesture])

  const animate = playing && !success && !reducedMotion()
  const script = scripts[Math.min(variant, scripts.length - 1)]

  useEffect(() => {
    if (!animate) {
      setFrame(success || !playing ? restFrame(gesture) : sampleScript(script, scriptDuration(script), false))
      setProgress(0)
      return
    }
    startRef.current = performance.now()
    const total = scriptDuration(script)
    let raf = 0
    const tick = (now: number): void => {
      const t = now - startRef.current
      if (auto && passes > 0 && scripts.length > 1 && t >= total * passes) {
        setVariant((v) => (v + 1) % scripts.length)
        return
      }
      setFrame(sampleScript(script, t))
      setProgress((t % total) / total)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [animate, script, scripts, auto, passes, gesture, success, playing])

  const select = useCallback((index: number) => {
    setAuto(false)
    setVariant(index)
  }, [])
  const autoplay = useCallback(() => setAuto(true), [])

  return {
    frame,
    variant,
    variants: scripts.map((s) => s.name),
    pair: script.pair === true,
    progress,
    select,
    autoplay,
    auto,
  }
}
