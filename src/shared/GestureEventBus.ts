import type { Gesture } from './Gesture'

export type GestureHandler = (gesture: Gesture) => void

/** Minimal pub/sub bus for gesture-change events. */
export class GestureEventBus {
  private handlers = new Set<GestureHandler>()

  /** Subscribe; returns an unsubscribe function. */
  on(handler: GestureHandler): () => void {
    this.handlers.add(handler)
    return () => {
      this.handlers.delete(handler)
    }
  }

  emit(gesture: Gesture): void {
    for (const handler of this.handlers) handler(gesture)
  }
}
