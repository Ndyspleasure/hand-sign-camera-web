/**
 * Audio system (MVP skeleton).
 *
 * A minimal timeline placeholder. Production would wire this into the Web Audio
 * API to mix a soundtrack and bake it into recordings; for the MVP it only
 * tracks loaded clips and playback position.
 */

export interface AudioClip {
  name: string
  buffer: ArrayBuffer
  durationMs: number
}

export class AudioTimeline {
  private clips: AudioClip[] = []
  private positionMs = 0

  add(clip: AudioClip): void {
    this.clips.push(clip)
  }

  get totalDurationMs(): number {
    return this.clips.reduce((sum, c) => sum + c.durationMs, 0)
  }

  seek(ms: number): void {
    this.positionMs = Math.max(0, Math.min(ms, this.totalDurationMs))
  }

  get position(): number {
    return this.positionMs
  }

  clear(): void {
    this.clips = []
    this.positionMs = 0
  }
}

/** Load an audio file into an ArrayBuffer clip (metadata duration left to caller). */
export async function loadAudioFile(file: File): Promise<AudioClip> {
  const buffer = await file.arrayBuffer()
  return { name: file.name, buffer, durationMs: 0 }
}
