import { useEffect, useRef, useState } from 'react'
import HandSvg from '../hand-svg/HandSvg'
import { useGestureAnimation } from '../gestures/animation'
import { CORE_GESTURES, GESTURES, type GuideGesture } from '../gestures/registry'
import { Gesture } from '../shared/Gesture'
import './onboarding.css'

export interface OnboardingProps {
  open: boolean
  cameraReady: boolean
  /** Latest gesture detected by the live tracker. */
  liveGesture: Gesture
  /** Skip / dismiss. */
  onClose: () => void
  /** Completed the whole flow. */
  onFinish: () => void
}

const HOLD_MS = 700 // how long the gesture must be held to count
const SUCCESS_MS = 1400 // pause on the success screen before advancing

type Phase = 'demo' | 'success'

/** One interactive gesture step. */
function GestureStep({
  gesture,
  index,
  count,
  phase,
  cameraReady,
}: {
  gesture: GuideGesture
  index: number
  count: number
  phase: Phase
  cameraReady: boolean
}) {
  const info = GESTURES[gesture]
  const anim = useGestureAnimation(info.pose, phase === 'success' ? 'success' : 'demonstrating')

  return (
    <div className="ob-step">
      <p className="ob-kicker">
        Gesture {index + 1} of {count}
      </p>
      <h2>Make this gesture</h2>

      <div className={`ob-stage${anim.detected ? ' is-success' : ''}`}>
        <HandSvg pose={anim.pose} rotate={anim.rotate} detected={anim.detected} size={220} />
      </div>

      <h3 className="ob-name">{info.name}</h3>
      <p className="ob-desc">{info.description}</p>

      {phase === 'success' ? (
        <p className="ob-status is-ok">✓ Gesture detected!</p>
      ) : cameraReady ? (
        <p className="ob-status">
          <span className="ob-dot" /> Show your hand to the camera…
        </p>
      ) : (
        <p className="ob-status">Waiting for the camera…</p>
      )}
    </div>
  )
}

/**
 * First-run (and re-openable) interactive tutorial. Walks through the core
 * gestures: each is demonstrated with the animated hand, and the step advances
 * automatically once the live tracker detects the user actually making it.
 */
export default function Onboarding({
  open,
  cameraReady,
  liveGesture,
  onClose,
  onFinish,
}: OnboardingProps) {
  const total = CORE_GESTURES.length
  const [step, setStep] = useState(0) // 0 = intro, 1..total = gestures, total+1 = finish
  const [phase, setPhase] = useState<Phase>('demo')
  const holdTimer = useRef<number | null>(null)
  const advanceTimer = useRef<number | null>(null)

  const isIntro = step === 0
  const isFinish = step === total + 1
  const gesture = !isIntro && !isFinish ? CORE_GESTURES[step - 1] : null

  // Restart when (re)opened.
  useEffect(() => {
    if (open) {
      setStep(0)
      setPhase('demo')
    }
  }, [open])

  // Reset the phase whenever the step changes.
  useEffect(() => {
    setPhase('demo')
  }, [step])

  // Live detection on gesture steps: hold the gesture for HOLD_MS to pass.
  useEffect(() => {
    if (!open || !gesture || phase !== 'demo' || !cameraReady) return
    if (liveGesture === gesture) {
      if (holdTimer.current === null) {
        holdTimer.current = window.setTimeout(() => {
          holdTimer.current = null
          setPhase('success')
        }, HOLD_MS)
      }
    } else if (holdTimer.current !== null) {
      clearTimeout(holdTimer.current)
      holdTimer.current = null
    }
    return () => {
      if (holdTimer.current !== null) {
        clearTimeout(holdTimer.current)
        holdTimer.current = null
      }
    }
  }, [open, gesture, phase, cameraReady, liveGesture])

  // After success, advance to the next step.
  useEffect(() => {
    if (phase !== 'success') return
    advanceTimer.current = window.setTimeout(() => {
      advanceTimer.current = null
      setStep((s) => s + 1)
    }, SUCCESS_MS)
    return () => {
      if (advanceTimer.current !== null) {
        clearTimeout(advanceTimer.current)
        advanceTimer.current = null
      }
    }
  }, [phase])

  if (!open) return null

  return (
    <div className="ob-overlay" role="dialog" aria-modal="true" aria-label="Tutorial">
      <div className="ob-panel">
        <button className="ob-skip" onClick={onClose}>
          Skip
        </button>

        {isIntro && (
          <div className="ob-step">
            <div className="ob-stage">
              <HandSvg pose={GESTURES[CORE_GESTURES[0]].pose.pose} size={200} />
            </div>
            <h2>Welcome 👋</h2>
            <p className="ob-desc">
              This app reads your hand with the camera and turns gestures into live visual
              effects. Let&apos;s learn a few gestures — you&apos;ll try each one on camera.
            </p>
            <button className="ob-primary" onClick={() => setStep(1)}>
              Start
            </button>
          </div>
        )}

        {gesture && (
          <GestureStep
            gesture={gesture}
            index={step - 1}
            count={total}
            phase={phase}
            cameraReady={cameraReady}
          />
        )}

        {isFinish && (
          <div className="ob-step">
            <div className="ob-stage is-success">
              <HandSvg pose={GESTURES[Gesture.OPEN_PALM].pose.pose} detected size={200} />
            </div>
            <h2>You&apos;re ready! 🎉</h2>
            <p className="ob-desc">
              Make gestures anytime to trigger effects, and hit record to save a clip. Open the
              Guide to see all gestures.
            </p>
            <button className="ob-primary" onClick={onFinish}>
              Enter camera
            </button>
          </div>
        )}

        {!isIntro && (
          <div className="ob-progress" aria-hidden="true">
            {CORE_GESTURES.map((g, i) => (
              <span key={g} className={`ob-tick${step - 1 > i || isFinish ? ' done' : ''}${step - 1 === i ? ' current' : ''}`} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
