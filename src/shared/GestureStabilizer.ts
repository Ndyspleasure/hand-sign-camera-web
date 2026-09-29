import { Gesture } from './Gesture'

interface Slot {
  current: Gesture
  candidate: Gesture
  since: number
}

/** A new gesture must persist this long before it is accepted. */
const SWITCH_MS = 90
/** Dropping back to NONE waits a little longer (bridges brief misreads). */
const RELEASE_MS = 250

/**
 * Debounces per-frame recognition so effects and labels don't flicker: a
 * change is only accepted once the new raw gesture has been stable for a short
 * time. Each hand (and the two-hand pair) is tracked under its own key.
 */
export class GestureStabilizer {
  private slots = new Map<string, Slot>()

  update(key: string, raw: Gesture, now: number): Gesture {
    const slot = this.slots.get(key)
    if (!slot) {
      this.slots.set(key, { current: raw, candidate: raw, since: now })
      return raw
    }

    if (raw === slot.current) {
      slot.candidate = raw
      slot.since = now
      return slot.current
    }

    if (raw !== slot.candidate) {
      slot.candidate = raw
      slot.since = now
    }

    const needed = raw === Gesture.NONE ? RELEASE_MS : SWITCH_MS
    if (now - slot.since >= needed) slot.current = raw
    return slot.current
  }

  /** Forget keys that are no longer present. */
  prune(activeKeys: string[]): void {
    for (const key of this.slots.keys()) {
      if (!activeKeys.includes(key)) this.slots.delete(key)
    }
  }
}
