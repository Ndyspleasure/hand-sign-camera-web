import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { EFFECT_FOR_GESTURE, effectLabel, Gesture, gestureLabel } from '../../shared'
import type { Telemetry } from '../telemetry'

/** Track and toggle browser full screen. */
export function useFullscreen(): [boolean, () => void] {
  const [active, setActive] = useState(() => typeof document !== 'undefined' && !!document.fullscreenElement)
  useEffect(() => {
    const onChange = () => setActive(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])
  const toggle = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
    else void document.documentElement.requestFullscreen?.().catch(() => {})
  }, [])
  return [active, toggle]
}

export function IdeTitleBar({ fullscreen, onToggleFullscreen }: { fullscreen: boolean; onToggleFullscreen: () => void }) {
  return (
    <header className="ide-title">
      <span className="ide-logo" aria-hidden="true">✋</span>
      <nav className="ide-menu" aria-hidden="true">
        {['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help'].map((m) => (
          <span key={m}>{m}</span>
        ))}
      </nav>
      <div className="ide-title-center">hand-sign-camera — Vanillate Live</div>
      <button className="ide-title-btn" onClick={onToggleFullscreen} title="Toggle full screen (F11)">
        {fullscreen ? '⤡ Exit full screen' : '⛶ Full screen'}
      </button>
    </header>
  )
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

export function IdeActivityBar({ onOpenGuide, onOpenTutorial }: { onOpenGuide: () => void; onOpenTutorial: () => void }) {
  return (
    <nav className="ide-activity" aria-label="Activity bar">
      <button className="ab-btn is-active" title="Explorer — live source">
        <Icon>
          <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
          <path d="M14 3v5h5" />
        </Icon>
      </button>
      <button className="ab-btn" title="Search">
        <Icon>
          <circle cx="11" cy="11" r="6" />
          <path d="m20 20-4.5-4.5" />
        </Icon>
      </button>
      <button className="ab-btn" title="Source control">
        <Icon>
          <circle cx="6" cy="5" r="2" />
          <circle cx="6" cy="19" r="2" />
          <circle cx="18" cy="8" r="2" />
          <path d="M6 7v10M18 10c0 5-7 3-11 8" />
        </Icon>
      </button>
      <button className="ab-btn" title="Gesture guide" onClick={onOpenGuide}>
        <Icon>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </Icon>
      </button>
      <button className="ab-btn" title="Tutorial" onClick={onOpenTutorial}>
        <Icon>
          <path d="m2 9 10-5 10 5-10 5z" />
          <path d="M6 11v5c3 2 9 2 12 0v-5" />
        </Icon>
      </button>
      <span className="ab-spacer" />
      <button className="ab-btn" title="Settings">
        <Icon>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" />
        </Icon>
      </button>
    </nav>
  )
}

export function IdeStatusBar({
  telemetry,
  status,
  recording,
  recordingSeconds,
}: {
  telemetry: Telemetry | null
  status: 'loading' | 'ready' | 'error'
  recording: boolean
  recordingSeconds: number
}) {
  const hands = telemetry?.hands ?? []
  const twoHand = telemetry?.twoHand ?? Gesture.NONE
  const gestures =
    twoHand !== Gesture.NONE ? gestureLabel(twoHand) : hands.map((h) => gestureLabel(h.gesture)).join(' + ') || '—'
  const effects = (telemetry?.effects ?? []).map(effectLabel).join(' + ') ||
    (twoHand !== Gesture.NONE ? effectLabel(EFFECT_FOR_GESTURE[twoHand]) : '—')
  const m = Math.floor(recordingSeconds / 60)
  const s = String(recordingSeconds % 60).padStart(2, '0')

  return (
    <footer className="ide-status">
      <span className="sb-item sb-remote">⌁ LIVE</span>
      <span className="sb-item">⎇ main</span>
      <span className="sb-item">⊗ 0 ⚠ 0</span>
      <span className={`sb-item sb-state sb-${status}`}>
        {status === 'ready' ? '● Tracking' : status === 'loading' ? '◌ Starting…' : '✕ Camera error'}
      </span>
      {recording && <span className="sb-item sb-rec">● REC {m}:{s}</span>}
      <span className="sb-spacer" />
      <span className="sb-item">✋ {hands.length}</span>
      <span className="sb-item">Gesture: {gestures}</span>
      <span className="sb-item">Effect: {effects}</span>
      <span className="sb-item">{Math.round(telemetry?.fps ?? 0)} fps</span>
      <span className="sb-item sb-dim">TypeScript React</span>
      <span className="sb-item sb-dim">UTF-8</span>
    </footer>
  )
}
