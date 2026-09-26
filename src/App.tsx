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
  GestureEventBus,
  HudRenderer,
  type Landmark,
  type TrackedHand,
} from './shared'
import GestureGuide from './ui/GestureGuide'

type Status = 'loading' | 'ready' | 'error'

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
  const candidates = [
    'video/webm;codecs=vp9',
    'video/webm;codecs=vp8',
    'video/webm',
  ]
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
  const busRef = useRef(new GestureEventBus())
  const hudRef = useRef(new HudRenderer())

  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef(0)
  const lastGestureRef = useRef<Gesture>(Gesture.NONE)
  const lastEventRef = useRef<Gesture>(Gesture.NONE)
  const fpsRef = useRef(0)
  const hudTickRef = useRef(0)

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const [status, setStatus] = useState<Status>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [hudLines, setHudLines] = useState<string[]>([])
  const [recording, setRecording] = useState(false)
  const [initToken, setInitToken] = useState(0)
  const [guideOpen, setGuideOpen] = useState(false)

  const retry = useCallback(() => {
    setStatus('loading')
    setErrorMsg('')
    setInitToken((n) => n + 1)
  }, [])

  useEffect(() => {
    let cancelled = false

    const bus = busRef.current
    const unsubscribe = bus.on((g) => {
      lastEventRef.current = g
    })

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
      fpsRef.current = fpsRef.current * 0.9 + (1000 / dt) * 0.1

      const size = { width: canvas.width, height: canvas.height }

      // Detect (normalized) then project to mirrored pixel space.
      const result = tracker.track(video, ts)
      const hands = projectHands(result.hands, size.width, size.height)

      const gesture = recognizerRef.current.recognize(hands[0])
      if (gesture !== lastGestureRef.current) {
        lastGestureRef.current = gesture
        busRef.current.emit(gesture)
      }

      // Draw mirrored camera frame, then effect overlay.
      drawMirroredVideo(ctx, video, size.width, size.height)
      const commands = engineRef.current.step(hands, gesture, size, dt)
      renderCommands(ctx, commands)

      // Throttle HUD state updates to ~10fps.
      hudTickRef.current += dt
      if (hudTickRef.current >= 100) {
        hudTickRef.current = 0
        setHudLines(
          hudRef.current.render({
            tracking: hands.length > 0,
            handCount: hands.length,
            gesture,
            activeEffectId: engineRef.current.activeEffectId,
            inferenceMs: result.inferenceMs,
            fps: fpsRef.current,
            lastEvent: lastEventRef.current,
          }),
        )
      }

      rafRef.current = requestAnimationFrame(loop)
    }

    void init()

    return () => {
      cancelled = true
      unsubscribe()
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

      <button className="guide-fab" onClick={() => setGuideOpen(true)}>
        📖 Guide
      </button>

      {status === 'loading' && (
        <div className="overlay center">
          <div className="spinner" />
          <p>Initializing camera &amp; hand-tracking model…</p>
          <p className="hint">First load downloads the model (~20&nbsp;MB); later loads are instant.</p>
        </div>
      )}

      {status === 'error' && (
        <div className="overlay center">
          <h2>Can&apos;t start the camera</h2>
          <p className="error">{errorMsg}</p>
          <p className="hint">Allow camera access and make sure you&apos;re on HTTPS, then retry.</p>
          <button onClick={retry}>Retry</button>
        </div>
      )}

      {status === 'ready' && (
        <>
          <pre className="hud">{hudLines.join('\n')}</pre>
          <div className="controls">
            {recording ? (
              <button className="rec active" onClick={stopRecording}>
                ■ Stop Recording
              </button>
            ) : (
              <button className="rec" onClick={startRecording}>
                ● Start Recording
              </button>
            )}
          </div>
          <div className="legend">
            <span>✋ / ✊ / ✌️ → Neon skeleton</span>
            <span>👉 Pointing → Laser</span>
            <span>🤏 Pinch → Sparks</span>
          </div>
        </>
      )}

      <GestureGuide
        open={guideOpen}
        onClose={() => setGuideOpen(false)}
        onTryGesture={() => setGuideOpen(false)}
      />
    </div>
  )
}
