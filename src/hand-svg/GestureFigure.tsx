import type { GesturePose } from '../gestures/poses'
import { heartBetween } from '../shared/effects/fx'
import { HandSkeleton } from './HandSvg'
import {
  composeTwoHands,
  resolveLandmarks,
  VIEW_CENTER,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  type HandPose,
} from './handModel'
import './gesture-figure.css'

export interface GestureFigureProps {
  /** Static presentation info (rotation, motion, two-hand layout). */
  gesture: GesturePose
  /** Pose to draw — usually animated from gesture.pose. */
  pose: HandPose
  /** Rendered height in px; width follows the drawing's aspect ratio. */
  height?: number
  detected?: boolean
  className?: string
}

/**
 * Draws any gesture: one hand (optionally rotated), a waving hand, or a
 * mirrored pair of hands for two-hand gestures with a glyph showing the shape
 * they make together.
 */
export default function GestureFigure({
  gesture,
  pose,
  height = 200,
  detected = false,
  className,
}: GestureFigureProps) {
  const points = resolveLandmarks(pose)

  if (gesture.twoHand) {
    const layout = gesture.twoHand
    const { left, right } = composeTwoHands(points, layout)
    const glyphColor = detected ? 'var(--hand-success, #34d399)' : 'var(--hand-glyph, #ff5c8a)'
    let glyph = null
    if (layout.glyph === 'heart') {
      // The heart's top dip sits where the index tips meet; its point at the thumbs.
      const dip = { x: layout.width / 2, y: right[8].y }
      const tip = { x: layout.width / 2, y: right[4].y }
      const d = heartBetween(dip, tip, 40)
        .map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
        .join(' ')
      glyph = <path d={`${d} Z`} fill={glyphColor} opacity={0.22} stroke={glyphColor} strokeWidth={2} />
    } else {
      const y = (right[0].y + right[9].y) / 2
      const x0 = layout.width / 2 - 30
      const zig = [0, 1, 2, 3, 4, 5, 6].map((i) => `${x0 + i * 10} ${y + (i % 2 ? -9 : 9)}`).join(' L')
      glyph = <path d={`M${zig}`} fill="none" stroke={detected ? glyphColor : '#a78bfa'} strokeWidth={3} strokeLinejoin="round" />
    }

    return (
      <svg
        className={className}
        height={height}
        width={(height * layout.width) / VIEW_HEIGHT}
        viewBox={`0 0 ${layout.width} ${VIEW_HEIGHT}`}
        role="img"
        aria-label="Two-hand gesture diagram"
      >
        {glyph}
        <HandSkeleton points={left} pose={pose} detected={detected} />
        <HandSkeleton points={right} pose={pose} detected={detected} />
      </svg>
    )
  }

  const svg = (
    <svg
      className={gesture.motion ? undefined : className}
      height={height}
      width={(height * VIEW_WIDTH) / VIEW_HEIGHT}
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label="Hand gesture diagram"
    >
      <g transform={gesture.rotate ? `rotate(${gesture.rotate} ${VIEW_CENTER.x} ${VIEW_CENTER.y})` : undefined}>
        <HandSkeleton points={points} pose={pose} detected={detected} />
      </g>
    </svg>
  )

  // Motion gestures swing the whole hand (CSS animation, pivoting at the wrist).
  return gesture.motion ? <span className={`gesture-motion-${gesture.motion} ${className ?? ''}`}>{svg}</span> : svg
}
