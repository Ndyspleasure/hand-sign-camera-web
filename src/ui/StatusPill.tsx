import { EFFECT_FOR_GESTURE, effectLabel } from '../shared/effectMap'
import { Gesture, gestureLabel } from '../shared/Gesture'

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export interface StatusPillProps {
  /** Stabilized gesture of each tracked hand. */
  gestures: Gesture[]
  /** Two-hand gesture, or NONE. */
  twoHand: Gesture
  recording: boolean
  recordingSeconds: number
  /** Demo mode: synthetic hands instead of the camera. */
  demo?: boolean
}

/**
 * Compact status indicator at the top of the camera view: whether hands are
 * seen, the gesture of each hand (or the two-hand gesture), and the effects
 * they trigger. Shows a REC badge + timer while recording. The label pops on
 * each change for lightweight feedback.
 */
export default function StatusPill({ gestures, twoHand, recording, recordingSeconds, demo = false }: StatusPillProps) {
  let tone: 'idle' | 'tracking' | 'active' = 'idle'
  let label = 'Show your hand'
  let sub = ''

  if (twoHand !== Gesture.NONE) {
    tone = 'active'
    label = gestureLabel(twoHand)
    sub = effectLabel(EFFECT_FOR_GESTURE[twoHand])
  } else if (gestures.length > 0) {
    const recognized = gestures.filter((g) => g !== Gesture.NONE)
    if (recognized.length === 0) {
      tone = 'tracking'
      label = gestures.length > 1 ? 'Reading 2 hands…' : 'Reading gesture…'
    } else {
      tone = 'active'
      label = gestures
        .map((g) => (g === Gesture.NONE ? '…' : gestureLabel(g)))
        .join('  +  ')
      sub = [...new Set(recognized.map((g) => effectLabel(EFFECT_FOR_GESTURE[g])))].join(' + ')
    }
  }

  return (
    <div className="status-pill" role="status" aria-live="polite">
      {demo && <span className="sp-demo">Demo</span>}
      {recording && (
        <span className="sp-rec">
          REC <span className="sp-time">{formatTime(recordingSeconds)}</span>
        </span>
      )}
      <span className={`sp-dot sp-${tone}`} aria-hidden="true" />
      {/* key remounts the label so the pop animation replays on each change */}
      <span className="sp-label" key={label}>
        {label}
      </span>
      {sub && <span className="sp-sub">{sub}</span>}
    </div>
  )
}
