import { HAND_CONNECTIONS } from '../shared/HandTopology'
import {
  fingerOfLandmark,
  resolveLandmarks,
  VIEW_CENTER,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  type HandPose,
} from './handModel'

export interface HandSvgProps {
  pose: HandPose
  /** Whole-hand rotation in degrees (e.g. 180 for thumbs-down). */
  rotate?: number
  /** Rendered pixel size (square). */
  size?: number
  /** Success/detected styling. */
  detected?: boolean
  className?: string
}

/**
 * Renders a 21-landmark hand skeleton as inline SVG from a {@link HandPose}.
 * Bones come from the shared HAND_CONNECTIONS so the guide stays in lock-step
 * with the tracker topology. Highlighted fingers are drawn in the accent color;
 * the rest are dimmed. Inline SVG keeps it lightweight and offline-capable.
 */
export default function HandSvg({
  pose,
  rotate = 0,
  size = 200,
  detected = false,
  className,
}: HandSvgProps) {
  const pts = resolveLandmarks(pose)

  const accent = detected ? 'var(--hand-success, #34d399)' : 'var(--hand-accent, #00e5ff)'
  const dim = 'var(--hand-dim, rgba(180, 220, 230, 0.28))'

  const isHighlighted = (landmark: number): boolean => {
    const finger = fingerOfLandmark(landmark)
    return finger ? pose[finger].highlight === true : false
  }

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
        {/* Bones */}
        {HAND_CONNECTIONS.map(([a, b], i) => {
          const active = isHighlighted(a) && isHighlighted(b)
          const pa = pts[a]
          const pb = pts[b]
          return (
            <line
              key={`bone-${i}`}
              x1={pa.x}
              y1={pa.y}
              x2={pb.x}
              y2={pb.y}
              stroke={active ? accent : dim}
              strokeWidth={active ? 6 : 4}
              strokeLinecap="round"
              style={{
                filter: active ? 'drop-shadow(0 0 5px var(--hand-accent, #00e5ff))' : undefined,
                transition: 'stroke 0.25s ease',
              }}
            />
          )
        })}

        {/* Joints */}
        {pts.map((p, i) => {
          const active = isHighlighted(i)
          const isTip = i === 4 || i === 8 || i === 12 || i === 16 || i === 20
          return (
            <circle
              key={`pt-${i}`}
              cx={p.x}
              cy={p.y}
              r={i === 0 ? 6 : isTip ? 5 : 4}
              fill={active ? accent : dim}
              style={{
                filter: active ? 'drop-shadow(0 0 6px var(--hand-accent, #00e5ff))' : undefined,
                transition: 'fill 0.25s ease',
              }}
            />
          )
        })}
      </g>
    </svg>
  )
}
