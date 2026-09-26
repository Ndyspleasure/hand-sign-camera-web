import { useCallback, useEffect, useRef, useState } from 'react'
import {
  attachStreamToVideo,
  HandTracker,
  requestCamera,
  stopStream,
} from './camera'
import { drawMirroredVideo, renderCommands } from './compositor/canvas-utils'
import {
  EffectEngine,
  Gesture,
  GeometricGestureRecognizer,
  type Landmark,
  type TrackedHand,
} from './shared'
import GestureGuide from './ui/GestureGuide'
import Onboarding from './ui/Onboarding'
import StatusPill from './ui/StatusPill'
import ControlBar from './ui/ControlBar'
import './ui/shell.css'

type Status = 'loading' | 'ready' | 'error'

interface HudState {
  tracking: boolean
  gesture: Gesture
  effectId: string
}

/** Project normalized MediaPipe landmarks into mirrored canvas pixel space. */
function projectHands(hands: TrackedHand[], width: number, height: number): TrackedHand[] {
  return hands.map((hand) => ({
    ...hand,
    landmarks: hand.landmarks.map<Landmark>((lm) => ({
      x: (1 - lm.x) * width,
      y: lm.y * height,
      z: lm.z * width,
    })),
  }))
}

/** Pick the best-supported WebM MIME type for MediaRecorder. */
function pickMimeType(): string {
  const candidates = ['video/webm;codecs=vp9', 'video/webm;codecs=vp8', 'video/webm']
  for (const type of candidates) {
    if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(type)) {
      return type
    }
  }
  return 'video/webm'
}

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const trackerRef = useRef<HandTracker | null>(null)
  const engineRef = useRef(new EffectEngine())
  const recognizerRef = useRef(new GeometricGestureRecognizer())

  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef(0)
  const lastGestureRef = useRef<Gesture>(Gesture.NONE)
  const hudTickRef = useRef(0)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const [status, setStatus] = useState<Status>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [hud, setHud] = useState<HudState>({
    tracking: false,
    gesture: Gesture.NONE,
    effectId: 'neon-skeleton',
  })
  const [recording, setRecording] = useState(false)
  const [initToken, setInitToken] = useState(0)
  const [guideOpen, setGuideOpen] = useState(false)
  const [onboardingOpen, setOnboardingOpen] = useState(false)
  const [liveGesture, setLiveGesture] = useState<Gesture>(Gesture.NONE)

  const retry = useCallback(() => {
    setStatus('loading')
    setErrorMsg('')
    setInitToken((n) => n + 1)
  }, [])

  const closeOnboarding = useCallback(() => {
    setOnboardingOpen(false)
    try {
      localStorage.setItem('hsc.onboarded', '1')
    } catch {
      // ignore blocked/unavailable storage (private mode)
    }
  }, [])

  // Auto-open the tutorial on the first successful start.
  useEffect(() => {
    if (status !== 'ready') return
    let done = false
    try {
      done = localStorage.getItem('hsc.onboarded') === '1'
    } catch {
      done = false
    }
    if (!done) setOnboardingOpen(true)
  }, [status])

  useEffect(() => {
    let cancelled = false

    async function init() {
      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas) return

      try {
        const stream = await requestCamera()
        if (cancelled) {
          stopStream(stream)
          return
        }
        streamRef.current = stream
        await attachStreamToVideo(video, stream)

        canvas.width = video.videoWidth || 1280
        canvas.height = video.videoHeight || 720

        const tracker = new HandTracker()
        await tracker.initialize()
        if (cancelled) {
          tracker.close()
          return
        }
        trackerRef.current = tracker

        setStatus('ready')
        lastTsRef.current = performance.now()
        rafRef.current = requestAnimationFrame(loop)
      } catch (err) {
        if (cancelled) return
        setErrorMsg(err instanceof Error ? err.message : String(err))
        setStatus('error')
      }
    }

    function loop(ts: number) {
      const video = videoRef.current
      const canvas = canvasRef.current
      const tracker = trackerRef.current
      if (!video || !canvas || !tracker) return

      const ctx = canvas.getContext('2d')
      if (!ctx) return

      const dt = Math.max(1, ts - lastTsRef.current)
      lastTsRef.current = ts

      const size = { width: canvas.width, height: canvas.height }

      // Detect (normalized) then project to mirrored pixel space.
      const result = tracker.track(video, ts)
      const hands = projectHands(result.hands, size.width, size.height)

      const gesture = recognizerRef.current.recognize(hands[0])
      if (gesture !== lastGestureRef.current) {
        lastGestureRef.current = gesture
        setLiveGesture(gesture)
      }

      // Draw mirrored camera frame, then effect overlay.
      drawMirroredVideo(ctx, video, size.width, size.height)
      const commands = engineRef.current.step(hands, gesture, size, dt)
      renderCommands(ctx, commands)

      // Throttle status updates to ~10 fps.
      hudTickRef.current += dt
      if (hudTickRef.current >= 100) {
        hudTickRef.current = 0
        setHud({
          tracking: hands.length > 0,
          gesture,
          effectId: engineRef.current.activeEffectId,
        })
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    void init()

    return () => {
      cancelled = true
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
      if (recorderRef.current?.state === 'recording') recorderRef.current.stop()
      trackerRef.current?.close()
      trackerRef.current = null
      stopStream(streamRef.current)
      streamRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initToken])

  const startRecording = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const stream = canvas.captureStream(30)
    const mimeType = pickMimeType()
    const recorder = new MediaRecorder(stream, { mimeType })
    chunksRef.current = []
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: mimeType })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `hand-sign-${Date.now()}.webm`
      a.click()
      URL.revokeObjectURL(url)
    }
    recorder.start()
    recorderRef.current = recorder
    setRecording(true)
  }, [])

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop()
    recorderRef.current = null
    setRecording(false)
  }, [])

  return (
    <div className="app">
      <video ref={videoRef} className="source-video" playsInline muted />
      <canvas ref={canvasRef} className="stage" />

      {status === 'ready' && (
        <StatusPill
          tracking={hud.tracking}
          gesture={hud.gesture}
          effectId={hud.effectId}
          recording={recording}
        />
      )}

      {status === 'loading' && (
        <div className="overlay center">
          <div className="spinner" />
          <p>Starting camera &amp; hand tracking…</p>
          <p className="hint">First load downloads the model (~20&nbsp;MB); later loads are instant.</p>
        </div>
      )}

      {status === 'error' && (
        <div className="overlay center">
          <h2>Can&apos;t start the camera</h2>
          <p className="error">{errorMsg}</p>
          <p className="hint">Allow camera access and make sure you&apos;re on HTTPS, then retry.</p>
          <button className="btn-primary" onClick={retry}>
            Retry
          </button>
        </div>
      )}

      {status === 'ready' && (
        <ControlBar
          recording={recording}
          onToggleRecord={recording ? stopRecording : startRecording}
          onOpenTutorial={() => setOnboardingOpen(true)}
          onOpenGuide={() => setGuideOpen(true)}
        />
      )}

      <GestureGuide
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        onTryGesture={() => setGuideOpen(false)}
      />

      <Onboarding
        open={onboardingOpen}
        cameraReady={status === 'ready'}
        liveGesture={liveGesture}
        onClose={closeOnboarding}
        onFinish={closeOnboarding}
      />
    </div>
  )
}
