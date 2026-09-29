import type { GesturePose } from '../gestures/poses'
import type { FigureFrame } from '../gestures/scripts'
import { heartBetween } from '../shared/effects/fx'
import { HandSkeleton } from './HandSvg'
import {
  composeTwoHands,
  resolveLandmarks,
  rotatePoints,
  VIEW_CENTER,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  type Point,
  type TwoHandLayout,
} from './handModel'

export interface GestureFigureProps {
  /** Static presentation info (two-hand layout and glyph). */
  gesture: GesturePose
  /** The frame to draw (from a script player or a rest frame). */
  frame: FigureFrame
  /** Draw a mirrored pair even for a one-hand gesture. */
  pair?: boolean
  /** Rendered height in px; width follows the drawing's aspect ratio. */
  height?: number
  detected?: boolean
  className?: string
}

/** Layout for "both hands" variants of one-hand gestures. */
const PAIR_LAYOUT: TwoHandLayout = { width: 440, dx: 230 }
/** Room on each side for hands that move apart. */
const MARGIN = 40

function transformHand(frame: FigureFrame, withScale = true): Point[] {
  let pts = frame.points
  if (frame.rotate) pts = rotatePoints(pts, frame.rotate)
  const scale = withScale ? frame.scale : 1
  if (scale !== 1 || frame.dx || frame.dy) {
    pts = pts.map((p) => ({
      x: VIEW_CENTER.x + (p.x - VIEW_CENTER.x) * scale + frame.dx,
      y: VIEW_CENTER.y + (p.y - VIEW_CENTER.y) * scale + frame.dy,
    }))
  }
  return pts
}

/** Mean distance between two point sets (how close a frame is to a pose). */
function meanDist(a: Point[], b: Point[]): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) sum += Math.hypot(a[i].x - b[i].x, a[i].y - b[i].y)
  return sum / a.length
}

/**
 * Draws any gesture frame: one hand, or a mirrored pair of hands (two-hand
 * gestures, and "both hands" variants) with an optional glyph showing the
 * shape two-hand gestures make together. The glyph fades in as the hands
 * reach the pose.
 */
export default function GestureFigure({
  gesture,
  frame,
  pair = false,
  height = 200,
  detected = false,
  className,
}: GestureFigureProps) {
  if (gesture.twoHand || pair) {
    const layout = gesture.twoHand ?? PAIR_LAYOUT
    const spread = { ...layout, dx: layout.dx + frame.gap / 2 }
    const right = composeTwoHands(transformHand(frame, false), spread).right
    const left = composeTwoHands(transformHand(frame.left ?? frame, false), spread).left
    const leftPose = frame.left?.highlight ?? frame.highlight

    let glyph = null
    if (gesture.twoHand) {
      const target = resolveLandmarks(gesture.pose)
      const near = Math.max(0, 1 - meanDist(frame.points, target) / 12)
      const joined = Math.max(0, 1 - Math.abs(frame.gap) / 60)
      const alpha = near * joined
      const color = detected ? 'var(--hand-success, #34d399)' : gesture.twoHand.glyph === 'heart' ? '#ff5c8a' : '#a78bfa'
      const ref = composeTwoHands(target, layout).right
      if (alpha > 0.02 && gesture.twoHand.glyph === 'heart') {
        const dip = { x: layout.width / 2, y: ref[8].y }
        const tip = { x: layout.width / 2, y: ref[4].y }
        const d = heartBetween(dip, tip, 40)
          .map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
          .join(' ')
        glyph = <path d={`${d} Z`} fill={color} fillOpacity={0.22} stroke={color} strokeWidth={2} opacity={alpha} />
      } else if (alpha > 0.02) {
        const y = (ref[0].y + ref[9].y) / 2
        const x0 = layout.width / 2 - 30
        const zig = [0, 1, 2, 3, 4, 5, 6].map((i) => `${x0 + i * 10} ${y + (i % 2 ? -9 : 9)}`).join(' L')
        glyph = <path d={`M${zig}`} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" opacity={alpha} />
      }
    }

    const cx = layout.width / 2
    const width = layout.width + MARGIN * 2
    return (
      <svg
        className={className}
        height={height}
        width={(height * width) / VIEW_HEIGHT}
        viewBox={`${-MARGIN} 0 ${width} ${VIEW_HEIGHT}`}
        role="img"
        aria-label="Two-hand gesture diagram"
      >
        <g transform={frame.scale !== 1 ? `translate(${cx} ${VIEW_CENTER.y}) scale(${frame.scale}) translate(${-cx} ${-VIEW_CENTER.y})` : undefined}>
          {glyph}
          <HandSkeleton points={left} pose={leftPose} detected={detected} />
          <HandSkeleton points={right} pose={frame.highlight} detected={detected} />
        </g>
      </svg>
    )
  }

  return (
    <svg
      className={className}
      height={height}
      width={(height * VIEW_WIDTH) / VIEW_HEIGHT}
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label="Hand gesture diagram"
    >
      <HandSkeleton points={transformHand(frame)} pose={frame.highlight} detected={detected} />
    </svg>
  )
}
