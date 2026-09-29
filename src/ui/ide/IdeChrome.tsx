import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { isGuideGesture, type GuideGesture } from '../../gestures/registry'
import { EFFECT_FOR_GESTURE, effectLabel, Gesture, gestureLabel } from '../../shared'
import {
  IconBook,
  IconCollapse,
  IconExpand,
  IconExternal,
  IconFiles,
  IconGraduation,
  IconLogo,
  IconPlay,
  IconRecord,
  IconSettings,
  IconStop,
  IconTerminal,
} from '../icons'
import type { Telemetry } from '../telemetry'

export const VANILLATE_URL = 'https://vanillate.id'

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

/** Workspace panels and preferences (persisted per browser). */
export interface IdeSettings {
  side: boolean
  editor: boolean
  landmarks: boolean
  terminal: boolean
  typing: boolean
}

const DEFAULT_SETTINGS: IdeSettings = { side: true, editor: true, landmarks: true, terminal: true, typing: true }
const SETTINGS_KEY = 'hsc.ide'

export function useIdeSettings(): [IdeSettings, (patch: Partial<IdeSettings>) => void] {
  const [settings, setSettings] = useState<IdeSettings>(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY)
      return raw ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<IdeSettings>) } : DEFAULT_SETTINGS
    } catch {
      return DEFAULT_SETTINGS
    }
  })
  const update = useCallback((patch: Partial<IdeSettings>) => {
    setSettings((s) => {
      const next = { ...s, ...patch }
      try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
      } catch {
        // storage unavailable: keep the setting for this session only
      }
      return next
    })
  }, [])
  return [settings, update]
}

export interface IdeActions {
  openGuide: (gesture?: GuideGesture) => void
  openTutorial: () => void
  demo: boolean
  toggleDemo: () => void
  recording: boolean
  canRecord: boolean
  toggleRecord: () => void
}

export function IdeTitleBar({
  fullscreen,
  onToggleFullscreen,
  actions,
}: {
  fullscreen: boolean
  onToggleFullscreen: () => void
  actions: IdeActions
}) {
  return (
    <header className="ide-title">
      <a className="ide-brand" href="/" title="Hand Sign Camera home" aria-label="Hand Sign Camera home">
        <span className="ide-logo">
          <IconLogo size={14} />
        </span>
      </a>
      <nav className="ide-menu" aria-label="Main">
        <button onClick={() => actions.openGuide()}>Guide</button>
        <button onClick={actions.openTutorial}>Tutorial</button>
        <button className={actions.demo ? 'is-on' : ''} onClick={actions.toggleDemo} aria-pressed={actions.demo}>
          {actions.demo ? 'Exit demo' : 'Demo'}
        </button>
        <button onClick={actions.toggleRecord} disabled={!actions.canRecord} className={actions.recording ? 'is-rec' : ''}>
          {actions.recording ? 'Stop recording' : 'Record'}
        </button>
      </nav>
      <div className="ide-title-center">Hand Sign Camera · Vanillate</div>
      <a className="ide-title-link" href={VANILLATE_URL} target="_blank" rel="noreferrer">
        vanillate.id <IconExternal size={12} />
      </a>
      <button
        className="ide-title-btn"
        onClick={onToggleFullscreen}
        title={fullscreen ? 'Exit full screen' : 'Full screen'}
        aria-label={fullscreen ? 'Exit full screen' : 'Full screen'}
      >
        {fullscreen ? <IconCollapse size={14} /> : <IconExpand size={14} />}
      </button>
    </header>
  )
}

function ActivityButton({
  title,
  active = false,
  onClick,
  children,
}: {
  title: string
  active?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button className={`ab-btn${active ? ' is-active' : ''}`} title={title} aria-label={title} aria-pressed={active} onClick={onClick}>
      {children}
    </button>
  )
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="st-row">
      <span>
        <span className="st-label">{label}</span>
        <span className="st-hint">{hint}</span>
      </span>
      <input type="checkbox" className="st-switch" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  )
}

function SettingsPopover({
  settings,
  onChange,
  onClose,
}: {
  settings: IdeSettings
  onChange: (patch: Partial<IdeSettings>) => void
  onClose: () => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) && !(e.target as Element).closest('.ab-settings')) onClose()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div className="ide-settings" ref={ref} role="dialog" aria-label="Workspace settings">
      <h3>Workspace</h3>
      <Toggle label="Source code" hint="The app's source, typed live" checked={settings.editor} onChange={(v) => onChange({ editor: v, side: v || settings.landmarks })} />
      <Toggle label="Live landmarks" hint="21 points per hand as JSON" checked={settings.landmarks} onChange={(v) => onChange({ landmarks: v, side: v || settings.editor })} />
      <Toggle label="Tracker panel" hint="Log and gesture list" checked={settings.terminal} onChange={(v) => onChange({ terminal: v })} />
      <Toggle label="Typing animation" hint="Off shows the whole file" checked={settings.typing} onChange={(v) => onChange({ typing: v })} />
      <p className="st-about">
        Hand Sign Camera by <a href={VANILLATE_URL} target="_blank" rel="noreferrer">Vanillate</a>. Runs fully in your
        browser: video never leaves your device.
      </p>
    </div>
  )
}

export function IdeActivityBar({
  settings,
  onSettings,
  actions,
}: {
  settings: IdeSettings
  onSettings: (patch: Partial<IdeSettings>) => void
  actions: IdeActions
}) {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  const sideVisible = settings.side && (settings.editor || settings.landmarks)
  return (
    <nav className="ide-activity" aria-label="Activity bar">
      <ActivityButton
        title={sideVisible ? 'Hide source panel' : 'Show source panel'}
        active={sideVisible}
        onClick={() =>
          sideVisible ? onSettings({ side: false }) : onSettings({ side: true, editor: true, landmarks: settings.landmarks || !settings.editor })
        }
      >
        <IconFiles size={22} />
      </ActivityButton>
      <ActivityButton title="Gesture guide" onClick={() => actions.openGuide()}>
        <IconBook size={22} />
      </ActivityButton>
      <ActivityButton title="Tutorial" onClick={actions.openTutorial}>
        <IconGraduation size={22} />
      </ActivityButton>
      <ActivityButton title={actions.demo ? 'Exit demo' : 'Play demo'} active={actions.demo} onClick={actions.toggleDemo}>
        <IconPlay size={20} />
      </ActivityButton>
      <ActivityButton
        title={settings.terminal ? 'Hide tracker panel' : 'Show tracker panel'}
        active={settings.terminal}
        onClick={() => onSettings({ terminal: !settings.terminal })}
      >
        <IconTerminal size={22} />
      </ActivityButton>
      <span className="ab-spacer" />
      <span className="ab-settings">
        <ActivityButton title="Settings" active={open} onClick={() => setOpen((v) => !v)}>
          <IconSettings size={22} />
        </ActivityButton>
      </span>
      {open && <SettingsPopover settings={settings} onChange={onSettings} onClose={close} />}
    </nav>
  )
}

export function IdeStatusBar({
  telemetry,
  status,
  recording,
  recordingSeconds,
  actions,
  onRetry,
}: {
  telemetry: Telemetry | null
  status: 'loading' | 'ready' | 'error'
  recording: boolean
  recordingSeconds: number
  actions: IdeActions
  onRetry: () => void
}) {
  const hands = telemetry?.hands ?? []
  const twoHand = telemetry?.twoHand ?? Gesture.NONE
  const current = twoHand !== Gesture.NONE ? twoHand : hands.map((h) => h.gesture).find((g) => g !== Gesture.NONE)
  const gestures =
    twoHand !== Gesture.NONE ? gestureLabel(twoHand) : hands.map((h) => gestureLabel(h.gesture)).join(' + ') || 'None'
  const effects =
    (telemetry?.effects ?? []).map(effectLabel).join(' + ') ||
    (twoHand !== Gesture.NONE ? effectLabel(EFFECT_FOR_GESTURE[twoHand]) : 'None')
  const m = Math.floor(recordingSeconds / 60)
  const s = String(recordingSeconds % 60).padStart(2, '0')

  return (
    <footer className="ide-status">
      <button className={`sb-item sb-remote${actions.demo ? ' is-demo' : ''}`} onClick={actions.toggleDemo} title={actions.demo ? 'Switch to camera' : 'Play the demo'}>
        {actions.demo ? 'Demo' : 'Camera'}
      </button>
      {status === 'error' ? (
        <button className="sb-item sb-state sb-error" onClick={onRetry} title="Try the camera again">
          Camera error · Retry
        </button>
      ) : (
        <span className={`sb-item sb-state sb-${status}`}>{status === 'ready' ? 'Tracking' : 'Starting…'}</span>
      )}
      {recording && (
        <button className="sb-item sb-rec" onClick={actions.toggleRecord} title="Stop recording">
          <IconStop size={10} /> REC {m}:{s}
        </button>
      )}
      {!recording && actions.canRecord && (
        <button className="sb-item" onClick={actions.toggleRecord} title="Record a clip">
          <IconRecord size={10} /> Record
        </button>
      )}
      <span className="sb-spacer" />
      <span className="sb-item">Hands {hands.length}</span>
      <button
        className="sb-item"
        disabled={!current}
        onClick={() => current && isGuideGesture(current) && actions.openGuide(current)}
        title={current ? 'Open this gesture in the Guide' : undefined}
      >
        Gesture: {gestures}
      </button>
      <span className="sb-item">Effect: {effects}</span>
      <span className="sb-item">{Math.round(telemetry?.fps ?? 0)} fps</span>
    </footer>
  )
}
