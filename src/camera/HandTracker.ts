import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult,
} from '@mediapipe/tasks-vision'
import type { Handedness, HandTrackingResult, Landmark, TrackedHand } from '../shared'

const WASM_BASE = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.29/wasm'
const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'

/**
 * Wraps MediaPipe Tasks Vision HandLandmarker for real-time video tracking.
 * Landmarks are returned in normalized (0..1) coordinates.
 */
export class HandTracker {
  private landmarker: HandLandmarker | null = null

  async initialize(): Promise<void> {
    const vision = await FilesetResolver.forVisionTasks(WASM_BASE)
    try {
      this.landmarker = await this.create(vision, 'GPU')
    } catch {
      // Fall back to CPU delegate on devices without WebGL/GPU support.
      this.landmarker = await this.create(vision, 'CPU')
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
