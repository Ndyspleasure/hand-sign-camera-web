import { Gesture, gestureLabel } from '../shared/Gesture'

const EFFECT_LABEL: Record<string, string> = {
  'neon-skeleton': 'Neon Skeleton',
  laser: 'Laser',
  'particle-spark': 'Particle Spark',
}

export interface StatusPillProps {
  tracking: boolean
  gesture: Gesture
  effectId: string
  recording: boolean
}

/**
 * Compact status indicator at the top of the screen. Replaces the raw technical
 * HUD with a friendly, single-glance state: whether a hand is seen, the current
 * gesture, and the active effect. Shows a REC badge while recording.
 */
export default function StatusPill({ tracking, gesture, effectId, recording }: StatusPillProps) {
  let tone: 'idle' | 'tracking' | 'active' = 'idle'
  let label = 'Show your hand'
  let sub = ''

  if (tracking) {
    if (gesture === Gesture.NONE) {
      tone = 'tracking'
      label = 'Reading gesture…'
    } else {
      tone = 'active'
      label = gestureLabel(gesture)
      sub = EFFECT_LABEL[effectId] ?? ''
    }
  }

  return (
    <div className="status-pill" role="status" aria-live="polite">
      {recording && <span className="sp-rec">REC</span>}
      <span className={`sp-dot sp-${tone}`} aria-hidden="true" />
      <span className="sp-label">{label}</span>
      {sub && <span className="sp-sub">{sub}</span>}
    </div>
  )
}
