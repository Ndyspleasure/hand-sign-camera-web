import { hsla, type DrawCommand } from '../DrawCommand'
import type { HandEffect } from '../Effect'
import { handScale } from '../handGeometry'
import { HandLandmark } from '../HandTopology'
import type { CanvasSize, TrackedHand } from '../TrackingTypes'
import { clampDt, rand } from './fx'

interface Glyph {
  x: number
  y: number
  vy: number
  char: string
  size: number
  life: number
  max: number
  flip: number
}

const CHARS = '01{}<>=;/*+アイウエオカキクケコサシスセソﾊﾋﾌﾍﾎ'
const TIPS = [HandLandmark.INDEX_TIP, HandLandmark.MIDDLE_TIP, HandLandmark.RING_TIP, HandLandmark.PINKY_TIP]
const EMIT_MS = 35
const MAX_GLYPHS = 260

const pick = (): string => CHARS[Math.floor(Math.random() * CHARS.length)]

/**
 * FOUR — "digital rain": green code glyphs stream down from the four raised
 * fingertips, flickering like a terminal Matrix. Fits the code-editor theme.
 */
export class CodeRainEffect implements HandEffect {
  readonly id = 'code-rain'
  private glyphs: Glyph[] = []
  private emitTimer = 0

  step(hands: TrackedHand[], size: CanvasSize, dtMs: number): DrawCommand[] {
    const dt = clampDt(dtMs)
    this.emitTimer += dt
    const emit = this.emitTimer >= EMIT_MS
    if (emit) this.emitTimer = 0

    for (const hand of hands) {
      const lm = hand.landmarks
      if (lm.length < 21 || !emit) continue
      const s = handScale(lm)
      for (const tip of TIPS) {
        if (this.glyphs.length >= MAX_GLYPHS) break
        const life = rand(900, 1400)
        this.glyphs.push({
          x: lm[tip].x + rand(-0.06, 0.06) * s,
          y: lm[tip].y,
          vy: rand(0.12, 0.22),
          char: pick(),
          size: s * rand(0.2, 0.28),
          life,
          max: life,
          flip: rand(60, 160),
        })
      }
    }

    const cmds: DrawCommand[] = []
    const alive: Glyph[] = []
    for (const g of this.glyphs) {
      g.life -= dt
      if (g.life <= 0 || g.y > size.height) continue
      g.y += g.vy * dt
      g.flip -= dt
      if (g.flip <= 0) {
        g.char = pick()
        g.flip = rand(60, 160)
      }
      alive.push(g)
      const t = g.life / g.max
      const fresh = t > 0.85
      cmds.push({
        kind: 'text', x: g.x, y: g.y, text: g.char, size: g.size, font: 'mono',
        color: fresh ? hsla(135, 100, 88, 1) : hsla(135, 100, 55, Math.min(1, t * 1.2)),
        blend: 'add',
      })
    }
    this.glyphs = alive
    return cmds
  }
}
