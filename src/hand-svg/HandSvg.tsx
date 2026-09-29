import { HAND_CONNECTIONS } from '../shared/HandTopology'
import {
  fingerOfLandmark,
  resolveLandmarks,
  VIEW_CENTER,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  type HandPose,
  type Point,
} from './handModel'

const ACCENT = 'var(--hand-accent, #00e5ff)'
const SUCCESS = 'var(--hand-success, #34d399)'
const DIM = 'var(--hand-dim, rgba(180, 220, 230, 0.28))'
const TIPS = new Set([4, 8, 12, 16, 20])

/**
 * The bones + joints of one hand as an SVG group, from 21 absolute points.
 * Fingers highlighted in `pose` use the accent color; the rest are dimmed.
 * Bones come from the shared HAND_CONNECTIONS, matching the tracker topology.
 */
export function HandSkeleton({
  points,
  pose,
  detected = false,
}: {
  points: Point[]
  pose: HandPose
  detected?: boolean
}) {
  const accent = detected ? SUCCESS : ACCENT
  const lit = (i: number): boolean => {
    const finger = fingerOfLandmark(i)
    return finger ? pose[finger].highlight === true : false
  }

  return (
    <g>
      {HAND_CONNECTIONS.map(([a, b], i) => {
        const active = lit(a) && lit(b)
        return (
          <line
            key={`bone-${i}`}
            x1={points[a].x}
            y1={points[a].y}
            x2={points[b].x}
            y2={points[b].y}
            stroke={active ? accent : DIM}
            strokeWidth={active ? 6 : 4}
            strokeLinecap="round"
            style={{
              filter: active ? `drop-shadow(0 0 5px ${accent})` : undefined,
              transition: 'stroke 0.25s ease',
            }}
          />
        )
      })}
      {points.map((p, i) => {
        const active = lit(i)
        return (
          <circle
            key={`pt-${i}`}
            cx={p.x}
            cy={p.y}
            r={i === 0 ? 6 : TIPS.has(i) ? 5 : 4}
            fill={active ? accent : DIM}
            style={{
              filter: active ? `drop-shadow(0 0 6px ${accent})` : undefined,
              transition: 'fill 0.25s ease',
            }}
          />
        )
      })}
    </g>
  )
}

export interface HandSvgProps {
  pose: HandPose
  /** Whole-hand rotation in degrees (e.g. 180 for thumbs-down). */
  rotate?: number
  /** Rendered pixel size (square box). */
  size?: number
  /** Success/detected styling. */
  detected?: boolean
  className?: string
}

/**
 * Renders a 21-landmark hand skeleton as inline SVG from a {@link HandPose}.
 * Inline SVG keeps it lightweight and offline-capable.
 */
export default function HandSvg({
  pose,
  rotate = 0,
  size = 200,
  detected = false,
  className,
}: HandSvgProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
      role="img"
      aria-label="Hand gesture diagram"
    >
      <g transform={rotate ? `rotate(${rotate} ${VIEW_CENTER.x} ${VIEW_CENTER.y})` : undefined}>
        <HandSkeleton points={resolveLandmarks(pose)} pose={pose} detected={detected} />
      </g>
    </svg>
  )
}
