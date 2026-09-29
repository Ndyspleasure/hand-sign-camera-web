import { restFrame } from '../gestures/animation'
import { GESTURES, type GuideGesture } from '../gestures/registry'
import {
  composeTwoHands,
  fingerOfLandmark,
  resolveLandmarks,
  rotatePoints,
  VIEW_HEIGHT,
  VIEW_WIDTH,
  type HandPose,
  type Point,
} from '../hand-svg/handModel'
import { heartBetween } from '../shared/effects/fx'
import { HAND_CONNECTIONS } from '../shared/HandTopology'

const r1 = (n: number): string => String(Math.round(n * 10) / 10)

function lit(pose: HandPose, i: number): boolean {
  const f = fingerOfLandmark(i)
  return f ? pose[f].highlight === true : false
}

/** Bones and joints of one hand as four compact paths (dim/lit × bones/joints). */
function handPaths(points: Point[], pose: HandPose) {
  const bones = { dim: '', lit: '' }
  for (const [a, b] of HAND_CONNECTIONS) {
    const key = lit(pose, a) && lit(pose, b) ? 'lit' : 'dim'
    bones[key] += `M${r1(points[a].x)} ${r1(points[a].y)}L${r1(points[b].x)} ${r1(points[b].y)}`
  }
  const joints = { dim: '', lit: '' }
  points.forEach((p, i) => {
    joints[lit(pose, i) ? 'lit' : 'dim'] += `M${r1(p.x)} ${r1(p.y)}h0`
  })
  return { bones, joints }
}

/**
 * Lightweight static hand diagram for the content pages: the same 21-point
 * model as the app's animated figures, drawn with a handful of paths and a
 * single glow, so pages stay small and cheap to paint.
 */
export default function HandSprite({ g, height, label }: { g: GuideGesture; height: number; label: string }) {
  const info = GESTURES[g]
  const frame = restFrame(g)
  const pts = frame.rotate ? rotatePoints(frame.points, frame.rotate) : frame.points
  const layout = info.pose.twoHand
  let hands: Point[][]
  let width: number = VIEW_WIDTH
  let glyph = ''
  if (layout) {
    const { left, right } = composeTwoHands(pts, layout)
    hands = [left, right]
    width = layout.width
    if (layout.glyph === 'heart') {
      const ref = composeTwoHands(resolveLandmarks(info.pose.pose), layout).right
      glyph = heartBetween({ x: width / 2, y: ref[8].y }, { x: width / 2, y: ref[4].y }, 40)
        .map((p, i) => `${i ? 'L' : 'M'}${r1(p.x)} ${r1(p.y)}`)
        .join('')
    }
  } else {
    hands = [pts]
  }
  const paths = hands.map((h) => handPaths(h, frame.highlight))
  const join = (k: 'bones' | 'joints', v: 'dim' | 'lit') => paths.map((p) => p[k][v]).join('')

  return (
    <svg
      className="hand"
      viewBox={`0 0 ${width} ${VIEW_HEIGHT}`}
      height={height}
      width={Math.round((height * width) / VIEW_HEIGHT)}
      role="img"
      aria-label={label}
    >
      <title>{label}</title>
      {glyph && <path className="hg" d={`${glyph}Z`} />}
      <path className="hb" d={join('bones', 'dim')} />
      <path className="hj" d={join('joints', 'dim')} />
      <g className="hl">
        <path className="hb" d={join('bones', 'lit')} />
        <path className="hj" d={join('joints', 'lit')} />
      </g>
    </svg>
  )
}
