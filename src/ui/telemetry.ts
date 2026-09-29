import type { EffectId, Gesture } from '../shared'

export type LogLevel = 'boot' | 'hand' | 'gesture' | 'effect' | 'rec' | 'perf' | 'trace' | 'warn' | 'error'

export interface LogLine {
  id: number
  time: string
  level: LogLevel
  text: string
}

/** Live data about one tracked hand (normalized 0..1 landmark coordinates). */
export interface HandTelemetry {
  handedness: string
  score: number
  gesture: Gesture
  landmarks: [number, number, number][]
}

/** A throttled snapshot of the tracking pipeline for the UI. */
export interface Telemetry {
  hands: HandTelemetry[]
  twoHand: Gesture
  effects: EffectId[]
  fps: number
  inferMs: number
  frame: number
}

function clock(d: Date): string {
  const p = (n: number, w = 2) => String(n).padStart(w, '0')
  return `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}.${p(d.getMilliseconds(), 3)}`
}

/**
 * Ring buffer of log lines written from the render loop. The UI pulls a copy
 * only when something changed, so logging never forces a React render per frame.
 */
export class LogBuffer {
  private lines: LogLine[] = []
  private nextId = 1
  private dirty = false

  constructor(private readonly capacity = 240) {}

  push(level: LogLevel, text: string): void {
    this.lines.push({ id: this.nextId++, time: clock(new Date()), level, text })
    if (this.lines.length > this.capacity) this.lines.splice(0, this.lines.length - this.capacity)
    this.dirty = true
  }

  clear(): void {
    this.lines = []
    this.dirty = true
  }

  /** A copy of the lines if anything was pushed since the last call, else null. */
  takeIfDirty(): LogLine[] | null {
    if (!this.dirty) return null
    this.dirty = false
    return this.lines.slice()
  }
}
