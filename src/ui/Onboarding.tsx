import { useEffect, useRef, useState } from 'react'
import GestureFigure from '../hand-svg/GestureFigure'
import { useGesturePlayer } from '../gestures/animation'
import { CORE_GESTURES, GESTURES, type GuideGesture } from '../gestures/registry'
import { Gesture } from '../shared/Gesture'
import { IconArrowRight, IconCheck } from './icons'
import './onboarding.css'

export interface OnboardingProps {
  open: boolean
  cameraReady: boolean
  /** Gestures currently detected live (each hand, plus any two-hand gesture). */
  liveGestures: Gesture[]
  /** Skip / dismiss. */
  onClose: () => void
  /** Completed the whole flow. */
  onFinish: () => void
  /** Finish and open the gesture guide. */
  onOpenGuide?: () => void
}

/** Looping animated figure for the intro and finish screens. */
function IntroFigure({ gesture }: { gesture: GuideGesture }) {
  const anim = useGesturePlayer(gesture)
  return (
    <div className="ob-stage">
      <GestureFigure gesture={GESTURES[gesture].pose} frame={anim.frame} pair={anim.pair} height={190} />
    </div>
  )
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
  const success = phase === 'success'
  const anim = useGesturePlayer(gesture, { success })

  return (
    <div className="ob-step">
      <p className="ob-kicker">
        Gesture {index + 1} of {count}
      </p>
      <h2>Make this gesture</h2>

      <div className={`ob-stage${success ? ' is-success' : ''}`}>
        <GestureFigure gesture={info.pose} frame={anim.frame} pair={anim.pair} height={210} detected={success} />
      </div>
      {!success && <p className="ob-variant">{anim.variants[anim.variant]}</p>}

      <h3 className="ob-name">{info.name}</h3>
      <p className="ob-desc">{info.description}</p>

      {success ? (
        <p className="ob-status is-ok">
          <IconCheck size={16} /> Detected. Effect: {info.effectLabel}
        </p>
      ) : cameraReady ? (
        <p className="ob-status">
          <span className="ob-dot" /> Make it in front of the camera
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
  liveGestures,
  onClose,
  onFinish,
  onOpenGuide,
}: OnboardingProps) {
  const total = CORE_GESTURES.length
  const [step, setStep] = useState(0) // 0 = intro, 1..total = gestures, total+1 = finish
  const [phase, setPhase] = useState<Phase>('demo')
  const holdTimer = useRef<number | null>(null)
  const advanceTimer = useRef<number | null>(null)

  const isIntro = step === 0
  const isFinish = step === total + 1
  const gesture = !isIntro && !isFinish ? CORE_GESTURES[step - 1] : null
  // A boolean (not the array) drives the effect, so frequent status updates
  // don't reset the hold timer.
  const matching = gesture !== null && liveGestures.includes(gesture)

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
    if (!open || !gesture || phase !== 'demo' || !cameraReady || !matching) return
    holdTimer.current = window.setTimeout(() => {
      holdTimer.current = null
      setPhase('success')
    }, HOLD_MS)
    return () => {
      if (holdTimer.current !== null) {
        clearTimeout(holdTimer.current)
        holdTimer.current = null
      }
    }
  }, [open, gesture, phase, cameraReady, matching])

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
          {isFinish ? 'Close' : 'Skip tutorial'}
        </button>

        {isIntro && (
          <div className="ob-step">
            <IntroFigure gesture={Gesture.WAVE} />
            <h2>Welcome to Hand Sign Camera</h2>
            <p className="ob-desc">
              Your camera reads your hands and turns each gesture into its own live effect.
              Learn {total} basic gestures in about a minute: each step moves on once the camera
              sees you make it.
            </p>
            <button className="ob-primary" onClick={() => setStep(1)}>
              Start tutorial <IconArrowRight size={16} />
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
            <IntroFigure gesture={Gesture.HEART} />
            <h2>You&apos;re all set</h2>
            <p className="ob-desc">
              There are 11 more to discover, including Wave and two-hand gestures like Heart and
              Double Palm. Open the Guide to see every gesture and its effect, and press record to
              save a clip.
            </p>
            <div className="ob-actions">
              {onOpenGuide && (
                <button className="ob-secondary" onClick={onOpenGuide}>
                  Open Guide
                </button>
              )}
              <button className="ob-primary" onClick={onFinish}>
                Start using the camera
              </button>
            </div>
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
