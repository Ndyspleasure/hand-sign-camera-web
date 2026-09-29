import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  attachStreamToVideo,
  HandTracker,
  requestCamera,
  stopStream,
} from './camera'
import { drawMirroredVideo, renderCommands } from './compositor/canvas-utils'
import { isGuideGesture, type GuideGesture } from './gestures/registry'
import {
  EFFECT_FOR_GESTURE,
  EffectEngine,
  Gesture,
  gestureEmoji,
  gestureLabel,
  GeometricGestureRecognizer,
  GestureStabilizer,
  LANDMARK_NAMES,
  WaveDetector,
  type Landmark,
  type TrackedHand,
} from './shared'
import ControlBar from './ui/ControlBar'
import GestureGuide from './ui/GestureGuide'
import CodeEditor from './ui/ide/CodeEditor'
import { IdeActivityBar, IdeStatusBar, IdeTitleBar, useFullscreen } from './ui/ide/IdeChrome'
import LandmarksView from './ui/ide/LandmarksView'
import TerminalPanel from './ui/ide/TerminalPanel'
import Onboarding from './ui/Onboarding'
import StatusPill from './ui/StatusPill'
import { LogBuffer, type LogLevel, type LogLine, type Telemetry } from './ui/telemetry'
import { useDesktopLayout } from './ui/useMediaQuery'
import './ui/shell.css'
import './ui/ide/ide.css'

type Status = 'loading' | 'ready' | 'error'

interface LiveGestures {
  /** Stabilized gesture of each hand, ordered left → right on screen. */
  gestures: Gesture[]
  twoHand: Gesture
}

const NO_HANDS: LiveGestures = { gestures: [], twoHand: Gesture.NONE }

/** Project normalized MediaPipe landmarks into mirrored canvas pixel space. */
function projectHand(hand: TrackedHand, width: number, height: number): TrackedHand {
  return {
    ...hand,
    landmarks: hand.landmarks.map<Landmark>((lm) => ({
      x: (1 - lm.x) * width,
      y: lm.y * height,
      z: lm.z * width,
    })),
  }
}

/** Stable per-hand keys: MediaPipe's handedness when unambiguous, else screen order. */
function handKeys(hands: TrackedHand[]): string[] {
  const labels = hands.map((h) => h.handedness)
  const unique = new Set(labels).size === labels.length && !labels.includes('Unknown')
  return unique ? labels : hands.map((_, i) => `hand${i}`)
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

const round3 = (n: number): number => Math.round(n * 1000) / 1000
const describe = (g: Gesture): string => `${gestureEmoji(g)} ${gestureLabel(g)}`

export default function App() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const trackerRef = useRef<HandTracker | null>(null)
  const engineRef = useRef(new EffectEngine())
  const recognizerRef = useRef(new GeometricGestureRecognizer())
  const stabilizerRef = useRef(new GestureStabilizer())
  const waveRef = useRef(new WaveDetector())

  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastTsRef = useRef(0)
  const liveRef = useRef<LiveGestures>(NO_HANDS)
  const tickRef = useRef(0)
  const fpsRef = useRef(0)
  const fpsFramesRef = useRef(0)
  const inferRef = useRef(0)
  const frameRef = useRef(0)
  const lastPerfRef = useRef(0)
  const lastTraceRef = useRef(0)
  const traceIdxRef = useRef(0)
  const logRef = useRef(new LogBuffer())

  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const recordTimerRef = useRef<number | null>(null)
  const recordStartRef = useRef(0)

  const desktop = useDesktopLayout()
  const desktopRef = useRef(desktop)
  const [fullscreen, toggleFullscreen] = useFullscreen()

  const [status, setStatus] = useState<Status>('loading')
  const [errorMsg, setErrorMsg] = useState('')
  const [videoSize, setVideoSize] = useState('')
  const [live, setLive] = useState<LiveGestures>(NO_HANDS)
  const [telemetry, setTelemetry] = useState<Telemetry | null>(null)
  const [logs, setLogs] = useState<LogLine[]>([])
  const [recording, setRecording] = useState(false)
  const [recordSeconds, setRecordSeconds] = useState(0)
  const [initToken, setInitToken] = useState(0)
  const [onboardingOpen, setOnboardingOpen] = useState(false)

  // `?guide` or `?guide=HEART` opens the gesture guide directly.
  const [guideGesture] = useState<GuideGesture | undefined>(() => {
    const value = new URLSearchParams(window.location.search).get('guide')
    return isGuideGesture(value) ? value : undefined
  })
  const [guideOpen, setGuideOpen] = useState(() =>
    new URLSearchParams(window.location.search).has('guide'),
  )
  const deepLinkedRef = useRef(guideOpen)

  useEffect(() => {
    desktopRef.current = desktop
  }, [desktop])

  const log = useCallback((level: LogLevel, text: string) => logRef.current.push(level, text), [])
  const flushLogs = useCallback(() => {
    if (!desktopRef.current) return
    const lines = logRef.current.takeIfDirty()
    if (lines) setLogs(lines)
  }, [])

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

  const closeGuide = useCallback(() => setGuideOpen(false), [])

  // Auto-open the tutorial on the first successful start (not when the user
  // arrived via a guide deep link).
  useEffect(() => {
    if (status !== 'ready' || deepLinkedRef.current) return
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
        log('boot', 'hand-sign-camera · PWA · offline-ready')
        log('boot', 'requesting camera (facingMode=user, ideal 1280×720)…')
        flushLogs()
        const stream = await requestCamera()
        if (cancelled) {
          stopStream(stream)
          return
        }
        streamRef.current = stream
        await attachStreamToVideo(video, stream)

        canvas.width = video.videoWidth || 1280
        canvas.height = video.videoHeight || 720
        setVideoSize(`${canvas.width}×${canvas.height}`)
        log('boot', `camera ready · ${canvas.width}×${canvas.height}`)
        log('boot', 'loading hand-tracking runtime from /mediapipe/wasm…')
        flushLogs()

        const tracker = new HandTracker()
        await tracker.initialize()
        if (cancelled) {
          tracker.close()
          return
        }
        trackerRef.current = tracker
        log('boot', `HandLandmarker ready · delegate=${tracker.delegate} · numHands=2`)
        log('boot', 'tracking loop started — show your hand ✋')
        flushLogs()

        setStatus('ready')
        lastTsRef.current = performance.now()
        lastPerfRef.current = lastTsRef.current
        fpsFramesRef.current = 0
        rafRef.current = requestAnimationFrame(loop)
      } catch (err) {
        if (cancelled) return
        const message = err instanceof Error ? err.message : String(err)
        log('error', message)
        flushLogs()
        setErrorMsg(message)
        setStatus('error')
      }
    }

    function logChanges(prev: LiveGestures, next: LiveGestures, keys: string[]) {
      if (prev.gestures.length !== next.gestures.length) {
        log('hand', `hands ${prev.gestures.length} → ${next.gestures.length}${keys.length ? ` (${keys.join(', ')})` : ''}`)
      }
      if (next.twoHand !== prev.twoHand && next.twoHand !== Gesture.NONE) {
        log('gesture', `two-hand ${describe(next.twoHand)} → ${EFFECT_FOR_GESTURE[next.twoHand]}`)
      }
      next.gestures.forEach((g, i) => {
        if (g !== Gesture.NONE && g !== prev.gestures[i]) {
          log('gesture', `${keys[i]}: ${describe(g)} → ${EFFECT_FOR_GESTURE[g]}`)
        }
      })
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
      frameRef.current++
      fpsFramesRef.current++

      const size = { width: canvas.width, height: canvas.height }

      // Detect (normalized), project to mirrored pixel space, order left → right.
      const result = tracker.track(video, ts)
      inferRef.current = inferRef.current
        ? inferRef.current * 0.9 + result.inferenceMs * 0.1
        : result.inferenceMs
      const pairs = result.hands
        .map((norm) => ({ norm, px: projectHand(norm, size.width, size.height) }))
        .sort((a, b) => a.px.landmarks[0].x - b.px.landmarks[0].x)
      const hands = pairs.map((p) => p.px)
      const keys = handKeys(hands)

      // Per-hand gesture: static pose → wave motion → debounce.
      const recognizer = recognizerRef.current
      const stabilizer = stabilizerRef.current
      const wave = waveRef.current
      const gestures = hands.map((hand, i) => {
        let raw = recognizer.recognize(hand)
        if (wave.update(keys[i], hand, raw, ts)) raw = Gesture.WAVE
        return stabilizer.update(keys[i], raw, ts)
      })
      const rawPair =
        hands.length >= 2
          ? recognizer.recognizeTwoHands(hands[0], hands[1], gestures[0], gestures[1])
          : Gesture.NONE
      const twoHand = stabilizer.update('pair', rawPair, ts)
      wave.prune(keys)
      stabilizer.prune([...keys, 'pair'])

      // React state only changes when the gestures do.
      const prev = liveRef.current
      if (prev.twoHand !== twoHand || prev.gestures.join() !== gestures.join()) {
        const next = { gestures, twoHand }
        logChanges(prev, next, keys)
        liveRef.current = next
        setLive(next)
      }

      // Draw mirrored camera frame, then each hand's effect.
      drawMirroredVideo(ctx, video, size.width, size.height)
      const commands = engineRef.current.step({ hands, gestures, twoHand }, size, dt)
      renderCommands(ctx, commands)

      // Real frame rate: frames counted over the last ~1 s window.
      if (ts - lastPerfRef.current >= 1000) {
        fpsRef.current = (fpsFramesRef.current * 1000) / (ts - lastPerfRef.current)
        fpsFramesRef.current = 0
        lastPerfRef.current = ts
        log('perf', `${fpsRef.current.toFixed(1)} fps · infer ${inferRef.current.toFixed(1)} ms · ${hands.length} hand(s) · ${commands.length} draw cmds`)
      }
      if (pairs.length > 0 && ts - lastTraceRef.current > 220) {
        lastTraceRef.current = ts
        const i = traceIdxRef.current++ % 21
        const p = pairs[0].norm.landmarks[i]
        log('trace', `lm[${i}] ${LANDMARK_NAMES[i].toLowerCase()} x=${p.x.toFixed(3)} y=${p.y.toFixed(3)} z=${p.z.toFixed(3)}`)
      }

      // Throttled telemetry for the desktop code panels (~10 Hz).
      tickRef.current += dt
      if (tickRef.current >= 100) {
        tickRef.current = 0
        if (desktopRef.current) {
          setTelemetry({
            hands: pairs.map((p, i) => ({
              handedness: keys[i] ?? p.norm.handedness,
              score: p.norm.score,
              gesture: gestures[i],
              landmarks: p.norm.landmarks.map((l) => [round3(l.x), round3(l.y), round3(l.z)] as [number, number, number]),
            })),
            twoHand,
            effects: [...engineRef.current.activeEffects],
            fps: fpsRef.current,
            inferMs: inferRef.current,
            frame: frameRef.current,
          })
          flushLogs()
        }
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
      const name = `hand-sign-${Date.now()}.webm`
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = name
      a.click()
      URL.revokeObjectURL(url)
      logRef.current.push('rec', `■ saved ${name} (${(blob.size / 1e6).toFixed(1)} MB)`)
    }
    recorder.start()
    recorderRef.current = recorder
    logRef.current.push('rec', `● recording started (${mimeType})`)
    setRecording(true)
    setRecordSeconds(0)
    recordStartRef.current = performance.now()
    recordTimerRef.current = window.setInterval(() => {
      setRecordSeconds(Math.floor((performance.now() - recordStartRef.current) / 1000))
    }, 500)
  }, [])

  const stopRecording = useCallback(() => {
    recorderRef.current?.stop()
    recorderRef.current = null
    if (recordTimerRef.current !== null) {
      clearInterval(recordTimerRef.current)
      recordTimerRef.current = null
    }
    setRecording(false)
    setRecordSeconds(0)
  }, [])

  // Clear the recording timer if the component unmounts mid-recording.
  useEffect(
    () => () => {
      if (recordTimerRef.current !== null) clearInterval(recordTimerRef.current)
    },
    [],
  )

  const liveGestures = useMemo(
    () => [...live.gestures, live.twoHand].filter((g) => g !== Gesture.NONE),
    [live],
  )

  // Layout note: the <canvas> keeps the same position in the tree in both
  // layouts (conditional siblings leave their slots in place), so switching
  // between desktop and mobile never remounts it.
  return (
    <div className={`app ${desktop ? 'layout-ide' : 'layout-mobile'}`}>
      <video ref={videoRef} className="source-video" playsInline muted />

      {desktop && <IdeTitleBar fullscreen={fullscreen} onToggleFullscreen={toggleFullscreen} />}
      {desktop && (
        <IdeActivityBar onOpenGuide={() => setGuideOpen(true)} onOpenTutorial={() => setOnboardingOpen(true)} />
      )}
      {desktop && (
        <aside className="ide-side">
          <CodeEditor />
          <LandmarksView telemetry={telemetry} />
        </aside>
      )}

      <div className="work-col">
        {desktop && (
          <div className="ce-tabs preview-tabs">
            <div className="ce-tab is-active">
              <span className="preview-dot" /> camera.live
              <span className="preview-meta">{videoSize ? `— ${videoSize} · mirrored` : '— starting…'}</span>
            </div>
          </div>
        )}

        <main className="stage-wrap">
          <canvas ref={canvasRef} className="stage" />

          {status === 'ready' && (
            <StatusPill
              gestures={live.gestures}
              twoHand={live.twoHand}
              recording={recording}
              recordingSeconds={recordSeconds}
            />
          )}

          {status === 'ready' && live.gestures.length === 0 && !onboardingOpen && !guideOpen && (
            <div className="hand-hint">✋ Show your hand to the camera</div>
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
        </main>

        {desktop && <TerminalPanel lines={logs} />}
      </div>

      {desktop && (
        <IdeStatusBar
          telemetry={telemetry}
          status={status}
          recording={recording}
          recordingSeconds={recordSeconds}
        />
      )}

      <GestureGuide
        open={guideOpen}
        initialGesture={guideGesture}
        onClose={closeGuide}
        onTryGesture={closeGuide}
      />

      <Onboarding
        open={onboardingOpen}
        cameraReady={status === 'ready'}
        liveGestures={liveGestures}
        onClose={closeOnboarding}
        onFinish={closeOnboarding}
      />
    </div>
  )
}
