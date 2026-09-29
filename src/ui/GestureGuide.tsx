import { useEffect, useMemo, useState } from 'react'
import GestureFigure from '../hand-svg/GestureFigure'
import { restFrame, useGesturePlayer } from '../gestures/animation'
import { GESTURES, GUIDE_ORDER, type GuideGesture } from '../gestures/registry'
import { GESTURE_SEO } from '../seo/content'
import type { GestureKind } from '../shared/Gesture'
import EffectPreview from './EffectPreview'
import { IconArrowRight, IconBook, IconClose, IconPause, IconPlay } from './icons'
import './gesture-guide.css'

export interface GestureGuideProps {
  open: boolean
  onClose: () => void
  /** Called when the user taps "Try it on camera". */
  onTryGesture?: (gesture: GuideGesture) => void
  /** Gesture to show when opened (e.g. from a `?guide=HEART` link). */
  initialGesture?: GuideGesture
}

const KIND_LABEL: Record<GestureKind, string> = {
  static: 'One hand',
  motion: 'Motion',
  'two-hand': 'Two hands',
}

type Filter = 'all' | GestureKind
const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'static', label: 'One hand' },
  { id: 'motion', label: 'Motion' },
  { id: 'two-hand', label: 'Two hands' },
]

/**
 * Gesture library: an animated hand demo with several variants per gesture
 * (auto-cycling, or pick one to loop), the steps to make it, a live preview of
 * its effect, and a filterable picker. Arrow keys move between gestures.
 */
export default function GestureGuide({ open, onClose, onTryGesture, initialGesture }: GestureGuideProps) {
  const [selected, setSelected] = useState<GuideGesture>(initialGesture ?? GUIDE_ORDER[0])
  const [filter, setFilter] = useState<Filter>('all')
  const info = GESTURES[selected]
  const [paused, setPaused] = useState(false)
  const p = useGesturePlayer(selected, { playing: open && !paused })

  const list = useMemo(
    () => GUIDE_ORDER.filter((g) => filter === 'all' || GESTURES[g].kind === filter),
    [filter],
  )

  useEffect(() => {
    if (open && initialGesture) setSelected(initialGesture)
  }, [open, initialGesture])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const order = list.includes(selected) ? list : GUIDE_ORDER
        const i = order.indexOf(selected)
        const next = order[(i + (e.key === 'ArrowRight' ? 1 : order.length - 1)) % order.length]
        setSelected(next)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose, list, selected])

  if (!open) return null

  return (
    <div className="gg-overlay" role="dialog" aria-modal="true" aria-label="Gesture guide" onClick={onClose}>
      <div className="gg-panel" onClick={(e) => e.stopPropagation()}>
        <header className="gg-header">
          <IconBook size={20} className="gg-head-icon" />
          <h2>Gesture Guide</h2>
          <a className="gg-all" href="/gestures/">All gestures</a>
          <div className="gg-filters" role="tablist" aria-label="Filter gestures">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                role="tab"
                aria-selected={filter === f.id}
                className={`gg-filter${filter === f.id ? ' is-active' : ''}`}
                onClick={() => setFilter(f.id)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button className="gg-close" onClick={onClose} aria-label="Close guide" title="Close (Esc)">
            <IconClose size={16} />
          </button>
        </header>

        <div className="gg-body">
          <div className="gg-demo">
            <div className="gg-stage">
              <GestureFigure gesture={info.pose} frame={p.frame} pair={p.pair} height={230} />
            </div>
            <div className="gg-player">
              <button
                className="gg-play"
                onClick={() => setPaused((v) => !v)}
                aria-label={paused ? 'Play animation' : 'Pause animation'}
                title={paused ? 'Play' : 'Pause'}
              >
                {paused ? <IconPlay size={14} /> : <IconPause size={14} />}
              </button>
              <div className="gg-progress" aria-hidden="true">
                <span style={{ transform: `scaleX(${paused ? 0 : p.progress})` }} />
              </div>
              <button
                className={`gg-auto${p.auto ? ' is-active' : ''}`}
                onClick={p.autoplay}
                aria-pressed={p.auto}
                title="Cycle through every variant"
              >
                Auto
              </button>
            </div>
            <div className="gg-variants" role="radiogroup" aria-label="Animation variant">
              {p.variants.map((name, i) => (
                <button
                  key={name + i}
                  role="radio"
                  aria-checked={i === p.variant}
                  className={`gg-variant${i === p.variant ? ' is-active' : ''}`}
                  onClick={() => {
                    setPaused(false)
                    p.select(i)
                  }}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          <div className="gg-info">
            <div className="gg-title-row">
              <h3>{info.name}</h3>
              <span className="gg-kind" data-kind={info.kind}>
                {KIND_LABEL[info.kind]}
              </span>
              {info.number !== undefined && <span className="gg-kind gg-number">Number {info.number}</span>}
            </div>
            <p className="gg-desc">{info.description}</p>

            <h4>How to make it</h4>
            <ol className="gg-steps">
              {info.howTo.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>

            <h4>
              Effect <span className="gg-effect-name">{info.effectLabel}</span>
            </h4>
            <EffectPreview gesture={selected} width={520} height={230} />

            <div className="gg-actions">
            {onTryGesture && (
              <button
                className="gg-try"
                onClick={() => {
                  onTryGesture(selected)
                  onClose()
                }}
              >
                Try it on camera <IconArrowRight size={16} />
              </button>
            )}
            <a className="gg-more" href={`/gestures/${GESTURE_SEO[selected].slug}/`}>
              Full guide: {GESTURE_SEO[selected].name}
            </a>
            </div>
          </div>
        </div>

        <div className="gg-picker" role="listbox" aria-label="Choose a gesture">
          {list.map((g) => {
            const item = GESTURES[g]
            const active = g === selected
            return (
              <button
                key={g}
                className={`gg-chip${active ? ' is-active' : ''}`}
                onClick={() => setSelected(g)}
                role="option"
                aria-selected={active}
                title={`${item.name}: ${item.effectLabel}`}
              >
                <GestureFigure gesture={item.pose} frame={restFrame(g)} height={52} />
                <span>{item.name}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
