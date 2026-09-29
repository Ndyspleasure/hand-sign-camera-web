import { useEffect, useState } from 'react'
import GestureFigure from '../hand-svg/GestureFigure'
import { useGestureAnimation } from '../gestures/animation'
import { GESTURES, GUIDE_ORDER, type GuideGesture } from '../gestures/registry'
import type { GestureKind } from '../shared/Gesture'
import EffectPreview from './EffectPreview'
import './gesture-guide.css'

export interface GestureGuideProps {
  open: boolean
  onClose: () => void
  /** Called when the user taps "Try this gesture" (e.g. to close and go live). */
  onTryGesture?: (gesture: GuideGesture) => void
  /** Gesture to show when opened (e.g. from a `?guide=HEART` link). */
  initialGesture?: GuideGesture
}

const KIND_LABEL: Record<GestureKind, string> = {
  static: '1 hand',
  motion: 'Motion',
  'two-hand': '2 hands',
}

/**
 * Openable gesture library: a large animated hand demo, name, description,
 * "How to make it" steps, and a live preview of the gesture's effect, with a
 * picker for every gesture. Everything comes from the shared registry.
 */
export default function GestureGuide({ open, onClose, onTryGesture, initialGesture }: GestureGuideProps) {
  const [selected, setSelected] = useState<GuideGesture>(initialGesture ?? GUIDE_ORDER[0])
  const info = GESTURES[selected]
  const anim = useGestureAnimation(info.pose, open ? 'demonstrating' : 'waiting')

  useEffect(() => {
    if (open && initialGesture) setSelected(initialGesture)
  }, [open, initialGesture])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="gg-overlay" role="dialog" aria-modal="true" aria-label="Gesture guide">
      <div className="gg-panel">
        <header className="gg-header">
          <h2>Gesture Guide</h2>
          <span className="gg-count">{GUIDE_ORDER.length} gestures</span>
          <button className="gg-close" onClick={onClose} aria-label="Close guide">
            ✕
          </button>
        </header>

        <div className="gg-body">
          <div className="gg-stage">
            <GestureFigure gesture={info.pose} pose={anim.pose} height={230} detected={anim.detected} />
          </div>

          <div className="gg-info">
            <div className="gg-title-row">
              <h3>
                <span className="gg-emoji" aria-hidden="true">{info.emoji}</span> {info.name}
              </h3>
              <span className="gg-kind" data-kind={info.kind}>
                {KIND_LABEL[info.kind]}
              </span>
            </div>
            <p className="gg-desc">{info.description}</p>

            <h4>How to make it</h4>
            <ol className="gg-steps">
              {info.howTo.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>

            <h4>
              Effect · <span className="gg-effect-name">{info.effectLabel}</span>
            </h4>
            <EffectPreview gesture={selected} width={520} height={250} />

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
                title={`${item.name} — ${item.effectLabel}`}
              >
                <GestureFigure gesture={{ ...item.pose, motion: undefined }} pose={item.pose.pose} height={52} />
                <span>{item.name}</span>
                {item.kind !== 'static' && <em className="gg-chip-kind">{KIND_LABEL[item.kind]}</em>}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
