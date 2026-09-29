import { useEffect, useRef } from 'react'
import { renderCommands } from '../compositor/canvas-utils'
import { GESTURE_POSES } from '../gestures/poses'
import {
  composeTwoHands,
  resolveLandmarks,
  rotatePoints,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  type Point,
} from '../hand-svg/handModel'
import { EffectEngine, Gesture, gestureKind, type TrackedHand } from '../shared'

export interface EffectPreviewProps {
  gesture: Gesture
  width?: number
  height?: number
}

/** Gentle idle motion so motion-based effects (trails, ripples) animate. */
function idleMotion(gesture: Gesture, t: number): Point {
  if (gesture === Gesture.WAVE) return { x: Math.sin(t * 0.009) * 40, y: 0 }
  if (gesture === Gesture.PEACE) return { x: Math.cos(t * 0.004) * 26, y: Math.sin(t * 0.004) * 12 }
  return { x: Math.sin(t * 0.0021) * 8, y: Math.cos(t * 0.0017) * 5 }
}

/**
 * Live preview of a gesture's effect: runs the real EffectEngine on synthetic
 * hands built from the guide pose, so what you see is exactly what the camera
 * view will draw. Only animates while mounted (i.e. while the guide is open).
 */
export default function EffectPreview({ gesture, width = 320, height = 220 }: EffectPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(width * dpr)
    canvas.height = Math.round(height * dpr)
    const size = { width: canvas.width, height: canvas.height }

    const gp = GESTURE_POSES[gesture]
    const two = gestureKind(gesture) === 'two-hand'
    let sets: Point[][]
    let drawWidth = VIEW_WIDTH
    if (gp.twoHand) {
      const { left, right } = composeTwoHands(resolveLandmarks(gp.pose), gp.twoHand)
      sets = [left, right]
      drawWidth = gp.twoHand.width
    } else {
      sets = [rotatePoints(resolveLandmarks(gp.pose), gp.rotate ?? 0)]
    }

    // Keep the hand in the lower part so effects that rise (stars, hearts,
    // rain clouds) have room above it.
    const scale = Math.min((size.width * 0.88) / drawWidth, (size.height * 0.62) / VIEW_HEIGHT)
    const ox = (size.width - drawWidth * scale) / 2
    const oy = size.height - VIEW_HEIGHT * scale - size.height * 0.05

    const engine = new EffectEngine()
    let raf = 0
    let last = performance.now()
    let t = 0

    const tick = (now: number) => {
      const dt = Math.min(64, now - last)
      last = now
      t += dt

      const m = idleMotion(gesture, t)
      const hands: TrackedHand[] = sets.map((pts) => ({
        landmarks: pts.map((p) => ({ x: ox + p.x * scale + m.x * dpr, y: oy + p.y * scale + m.y * dpr, z: 0 })),
        handedness: 'Right',
        score: 1,
      }))

      ctx.fillStyle = '#081014'
      ctx.fillRect(0, 0, size.width, size.height)
      ctx.strokeStyle = 'rgba(0, 229, 255, 0.06)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let x = 0; x < size.width; x += 24 * dpr) {
        ctx.moveTo(x, 0)
        ctx.lineTo(x, size.height)
      }
      for (let y = 0; y < size.height; y += 24 * dpr) {
        ctx.moveTo(0, y)
        ctx.lineTo(size.width, y)
      }
      ctx.stroke()

      const frame = {
        hands,
        gestures: hands.map(() => (two ? Gesture.NONE : gesture)),
        twoHand: two ? gesture : Gesture.NONE,
      }
      renderCommands(ctx, engine.step(frame, size, dt))
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [gesture, width, height])

  return (
    <canvas
      ref={canvasRef}
      className="effect-preview"
      style={{ width: '100%', maxWidth: width, aspectRatio: `${width} / ${height}` }}
      aria-label="Live effect preview"
    />
  )
}
