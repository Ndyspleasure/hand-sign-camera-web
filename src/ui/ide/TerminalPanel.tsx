import { useLayoutEffect, useRef, useState } from 'react'
import { GESTURES, GUIDE_ORDER, type GuideGesture } from '../../gestures/registry'
import type { Gesture } from '../../shared'
import { IconClose, IconTrash } from '../icons'
import type { LogLevel, LogLine } from '../telemetry'

type Tab = 'log' | 'gestures'
const LEVELS: (LogLevel | 'all')[] = ['all', 'gesture', 'hand', 'perf', 'trace', 'rec', 'boot', 'error']

export interface TerminalPanelProps {
  lines: LogLine[]
  /** Gestures detected right now, to highlight in the reference table. */
  active: Gesture[]
  onClear: () => void
  onHide: () => void
  onOpenGesture: (gesture: GuideGesture) => void
}

/** Bottom panel: the tracker's live log (filterable) and a gesture → effect reference. */
export default function TerminalPanel({ lines, active, onClear, onHide, onOpenGesture }: TerminalPanelProps) {
  const [tab, setTab] = useState<Tab>('log')
  const [level, setLevel] = useState<LogLevel | 'all'>('all')
  const bodyRef = useRef<HTMLDivElement>(null)
  const shown = level === 'all' ? lines : lines.filter((l) => l.level === level)
  const lastId = shown.length > 0 ? shown[shown.length - 1].id : 0

  useLayoutEffect(() => {
    const el = bodyRef.current
    if (el && tab === 'log') el.scrollTop = el.scrollHeight
  }, [lastId, tab])

  return (
    <section className="terminal" aria-label="Tracker panel">
      <div className="term-tabs" role="tablist">
        <button role="tab" aria-selected={tab === 'log'} className={tab === 'log' ? 'is-active' : ''} onClick={() => setTab('log')}>
          Tracker log
        </button>
        <button
          role="tab"
          aria-selected={tab === 'gestures'}
          className={tab === 'gestures' ? 'is-active' : ''}
          onClick={() => setTab('gestures')}
        >
          Gestures
        </button>
        <span className="term-spacer" />
        {tab === 'log' && (
          <>
            <label className="term-filter">
              <span className="sr-only">Filter log</span>
              <select value={level} onChange={(e) => setLevel(e.target.value as LogLevel | 'all')}>
                {LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l === 'all' ? 'All events' : l}
                  </option>
                ))}
              </select>
            </label>
            <button className="term-icon" onClick={onClear} title="Clear log" aria-label="Clear log">
              <IconTrash size={14} />
            </button>
          </>
        )}
        <button className="term-icon" onClick={onHide} title="Hide panel" aria-label="Hide panel">
          <IconClose size={14} />
        </button>
      </div>

      {tab === 'log' ? (
        <div className="term-body" ref={bodyRef}>
          {shown.map((l) => (
            <div key={l.id} className={`tl tl-${l.level}`}>
              <span className="tl-time">{l.time}</span>
              <span className="tl-tag">[{l.level}]</span>
              <span className="tl-text">{l.text}</span>
            </div>
          ))}
          {shown.length === 0 && <div className="tl tl-empty">No events yet.</div>}
        </div>
      ) : (
        <div className="term-body term-grid">
          {GUIDE_ORDER.map((g) => {
            const info = GESTURES[g]
            const on = active.includes(g)
            return (
              <button key={g} className={`tg-row${on ? ' is-on' : ''}`} onClick={() => onOpenGesture(g)} title="Open in the Guide">
                <span className="tg-dot" />
                <span className="tg-name">{info.name}</span>
                <span className="tg-effect">{info.effectLabel}</span>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
