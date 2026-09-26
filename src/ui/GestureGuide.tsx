import { useState } from 'react'
import HandSvg from '../hand-svg/HandSvg'
import { useGestureAnimation } from '../gestures/animation'
import { GESTURES, GUIDE_ORDER, type GuideGesture } from '../gestures/registry'
import './gesture-guide.css'

export interface GestureGuideProps {
  open: boolean
  onClose: () => void
  /** Called when the user taps "Try this gesture" (e.g. to close and go live). */
  onTryGesture?: (gesture: GuideGesture) => void
}

/**
 * Openable gesture library: a large animated hand demo plus name, description,
 * "How to make it" steps and the linked effect, with a picker for all gestures.
 * All gestures come from the shared registry (single source of truth).
 */
export default function GestureGuide({ open, onClose, onTryGesture }: GestureGuideProps) {
  const [selected, setSelected] = useState<GuideGesture>(GUIDE_ORDER[0])
  const info = GESTURES[selected]
  const anim = useGestureAnimation(info.pose, open ? 'demonstrating' : 'waiting')

  if (!open) return null

  return (
    <div className="gg-overlay" role="dialog" aria-modal="true" aria-label="Gesture guide">
      <div className="gg-panel">
        <header className="gg-header">
          <h2>Gesture Guide</h2>
          <button className="gg-close" onClick={onClose} aria-label="Close guide">
            ✕
          </button>
        </header>

        <div className="gg-body">
          <div className="gg-stage">
            <HandSvg pose={anim.pose} rotate={anim.rotate} detected={anim.detected} size={240} />
          </div>

          <div className="gg-info">
            <div className="gg-title-row">
              <h3>{info.name}</h3>
              <span className="gg-effect" data-effect={info.effectId}>
                {info.effectLabel}
              </span>
            </div>
            <p className="gg-desc">{info.description}</p>

            <h4>How to make it</h4>
            <ol className="gg-steps">
              {info.howTo.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>

            {onTryGesture && (
              <button
                className="gg-try"
                onClick={() => {
                  onTryGesture(selected)
                  onClose()
                }}
              >
                Try this gesture →
              </button>
            )}
          </div>
        </div>

        <div className="gg-picker" role="listbox" aria-label="Choose a gesture">
          {GUIDE_ORDER.map((g) => {
            const item = GESTURES[g]
            const active = g === selected
            return (
              <button
                key={g}
                className={`gg-chip${active ? ' is-active' : ''}`}
                onClick={() => setSelected(g)}
                role="option"
                aria-selected={active}
              >
                <HandSvg pose={item.pose.pose} rotate={item.pose.rotate} size={56} />
                <span>{item.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
