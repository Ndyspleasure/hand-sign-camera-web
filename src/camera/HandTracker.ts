import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult,
} from '@mediapipe/tasks-vision'
import type { Handedness, HandTrackingResult, Landmark, TrackedHand } from '../shared'

// Served from the app's own origin (see scripts/prepare-mediapipe.mjs). This
// keeps the WASM runtime in lock-step with the bundled @mediapipe/tasks-vision
// version and avoids depending on an external CDN at runtime.
const WASM_BASE = '/mediapipe/wasm'
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'

/**
 * Wraps MediaPipe Tasks Vision HandLandmarker for real-time video tracking.
 * Landmarks are returned in normalized (0..1) coordinates.
 */
export class HandTracker {
  private landmarker: HandLandmarker | null = null
  /** Which MediaPipe delegate is running (set after initialize()). */
  delegate: 'GPU' | 'CPU' | null = null

  async initialize(): Promise<void> {
    let vision: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>
    try {
      vision = await FilesetResolver.forVisionTasks(WASM_BASE)
    } catch (err) {
      throw new Error(
        `Could not load the hand-tracking runtime (WASM) from ${WASM_BASE}. ` +
          `${err instanceof Error ? err.message : String(err)}`,
      )
    }

    // Prefer the GPU delegate; fall back to CPU on devices without WebGL.
    try {
      this.landmarker = await this.create(vision, 'GPU')
      this.delegate = 'GPU'
      return
    } catch (gpuErr) {
      try {
        this.landmarker = await this.create(vision, 'CPU')
        this.delegate = 'CPU'
      } catch (cpuErr) {
        const detail = cpuErr instanceof Error ? cpuErr.message : String(cpuErr)
        const gpuDetail = gpuErr instanceof Error ? gpuErr.message : String(gpuErr)
        throw new Error(
          `Could not create the hand-tracking model. ` +
            `GPU: ${gpuDetail}. CPU: ${detail}. ` +
            `The model may be blocked by the network or failed to download.`,
        )
      }
    }
  }

  private create(
    vision: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>,
    delegate: 'GPU' | 'CPU',
  ): Promise<HandLandmarker> {
    return HandLandmarker.createFromOptions(vision, {
      baseOptions: { modelAssetPath: MODEL_URL, delegate },
      runningMode: 'VIDEO',
      numHands: 2,
    })
  }

  /** Run detection on a single video frame. Returns normalized landmarks. */
  track(video: HTMLVideoElement, timestampMs: number): HandTrackingResult {
    if (!this.landmarker) return { hands: [], inferenceMs: 0 }

    const start = performance.now()
    const result: HandLandmarkerResult = this.landmarker.detectForVideo(video, timestampMs)
    const inferenceMs = performance.now() - start

    const hands: TrackedHand[] = result.landmarks.map((points, i) => {
      const category = result.handedness[i]?.[0]
      const handedness: Handedness =
        category?.categoryName === 'Left' || category?.categoryName === 'Right'
          ? category.categoryName
          : 'Unknown'
      const landmarks: Landmark[] = points.map((p) => ({ x: p.x, y: p.y, z: p.z }))
      return { landmarks, handedness, score: category?.score ?? 0 }
    })

    return { hands, inferenceMs }
  }

  close(): void {
    this.landmarker?.close()
    this.landmarker = null
  }
}
