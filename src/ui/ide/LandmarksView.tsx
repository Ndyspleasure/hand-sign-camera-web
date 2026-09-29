import { memo, useMemo, useState } from 'react'
import { EFFECT_FOR_GESTURE, Gesture } from '../../shared'
import { IconCheck, IconFiles } from '../icons'
import type { Telemetry } from '../telemetry'
import { tokenizeJson } from './highlight'

const f3 = (n: number): string => (n < 0 ? '' : ' ') + n.toFixed(3)

/** Render the live telemetry as JSON lines (valid JSON, no comments). */
export function telemetryJson(t: Telemetry | null): string[] {
  const lines = [
    '{',
    `  "frame": ${t?.frame ?? 0},`,
    `  "fps": ${(t?.fps ?? 0).toFixed(1)},`,
    `  "inferenceMs": ${(t?.inferMs ?? 0).toFixed(2)},`,
    `  "twoHand": "${t?.twoHand ?? Gesture.NONE}",`,
  ]
  const hands = t?.hands ?? []
  if (hands.length === 0) {
    lines.push('  "hands": []', '}')
    return lines
  }
  lines.push('  "hands": [')
  hands.forEach((h, i) => {
    lines.push(
      '    {',
      `      "handedness": "${h.handedness}",`,
      `      "score": ${h.score.toFixed(2)},`,
      `      "gesture": "${h.gesture}",`,
      `      "effect": "${EFFECT_FOR_GESTURE[h.gesture]}",`,
      '      "landmarks": [',
    )
    h.landmarks.forEach(([x, y, z], j) => {
      const comma = j < h.landmarks.length - 1 ? ',' : ' '
      lines.push(`        [${f3(x)}, ${f3(y)}, ${f3(z)}]${comma}`)
    })
    lines.push('      ]', `    }${i < hands.length - 1 ? ',' : ''}`)
  })
  lines.push('  ]', '}')
  return lines
}

const JsonLine = memo(function JsonLine({ n, text }: { n: number; text: string }) {
  const tokens = useMemo(() => tokenizeJson(text), [text])
  return (
    <div className="cl">
      <span className="cl-n">{n}</span>
      <span className="cl-code">
        {tokens.map((t, i) => (
          <span key={i} className={`tk-${t.k}`}>
            {t.t}
          </span>
        ))}
      </span>
    </div>
  )
})

/** Live-updating JSON view of the tracked hands' landmarks. */
export default function LandmarksView({ telemetry }: { telemetry: Telemetry | null }) {
  const lines = telemetryJson(telemetry)
  const live = (telemetry?.hands.length ?? 0) > 0
  const [copied, setCopied] = useState(false)
  const copy = () => {
    void navigator.clipboard
      ?.writeText(lines.join('\n'))
      .then(() => {
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1500)
      })
      .catch(() => {})
  }
  return (
    <section className="lv">
      <div className="ce-tabs">
        <div className="ce-tab is-active">
          <span className="json-badge">{'{}'}</span>
          landmarks.live.json
          <span className={`lv-live${live ? ' on' : ''}`}>{live ? 'Live' : 'Idle'}</span>
        </div>
        <button className="lv-copy" onClick={copy} title="Copy the current snapshot as JSON">
          {copied ? <IconCheck size={13} /> : <IconFiles size={13} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="ce-body">
        <div className="ce-scroll lv-scroll">
          {lines.map((text, i) => (
            <JsonLine key={i} n={i + 1} text={text} />
          ))}
        </div>
      </div>
    </section>
  )
}
