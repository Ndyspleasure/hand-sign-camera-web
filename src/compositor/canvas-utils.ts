import type { ARGB, DrawCommand } from '../shared'

/** Convert a 0xAARRGGBB integer to a CSS `rgba()` string. */
export function argbToRgba(argb: ARGB): string {
  const a = ((argb >>> 24) & 0xff) / 255
  const r = (argb >>> 16) & 0xff
  const g = (argb >>> 8) & 0xff
  const b = argb & 0xff
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

const FONTS = {
  mono: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
  sans: 'ui-sans-serif, system-ui, sans-serif',
} as const

/**
 * Render draw commands to a Canvas 2D context.
 *
 * Avoids a save()/restore() per command (hundreds of particles per frame) by
 * only touching context state when it changes, and always resets shadow and
 * blend state at the end — a leftover shadowBlur would make the next frame's
 * video drawImage extremely slow.
 */
export function renderCommands(ctx: CanvasRenderingContext2D, commands: DrawCommand[]): void {
  let blend: GlobalCompositeOperation = 'source-over'
  let glow = 0
  let font = ''

  ctx.globalCompositeOperation = blend
  ctx.shadowBlur = 0
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'

  for (const c of commands) {
    const nextBlend: GlobalCompositeOperation = c.blend === 'add' ? 'lighter' : 'source-over'
    if (nextBlend !== blend) {
      ctx.globalCompositeOperation = nextBlend
      blend = nextBlend
    }
    const color = argbToRgba(c.color)
    const nextGlow = c.glow ?? 0
    if (nextGlow !== glow) {
      ctx.shadowBlur = nextGlow
      glow = nextGlow
    }
    if (glow) ctx.shadowColor = color

    switch (c.kind) {
      case 'line':
        ctx.strokeStyle = color
        ctx.lineWidth = c.width
        ctx.beginPath()
        ctx.moveTo(c.x1, c.y1)
        ctx.lineTo(c.x2, c.y2)
        ctx.stroke()
        break
      case 'circle':
        ctx.beginPath()
        ctx.arc(c.x, c.y, Math.max(0, c.radius), 0, Math.PI * 2)
        if (c.fill) {
          ctx.fillStyle = color
          ctx.fill()
        } else {
          ctx.strokeStyle = color
          ctx.lineWidth = c.width ?? 2
          ctx.stroke()
        }
        break
      case 'arc':
        ctx.strokeStyle = color
        ctx.lineWidth = c.width
        ctx.beginPath()
        ctx.arc(c.x, c.y, Math.max(0, c.radius), c.start, c.end)
        ctx.stroke()
        break
      case 'path': {
        if (c.points.length < 2) break
        ctx.beginPath()
        ctx.moveTo(c.points[0].x, c.points[0].y)
        for (let i = 1; i < c.points.length; i++) ctx.lineTo(c.points[i].x, c.points[i].y)
        if (c.closed) ctx.closePath()
        if (c.fill) {
          ctx.fillStyle = color
          ctx.fill()
        } else {
          ctx.strokeStyle = color
          ctx.lineWidth = c.width ?? 2
          ctx.stroke()
        }
        break
      }
      case 'text': {
        const nextFont = `${Math.round(c.size)}px ${FONTS[c.font ?? 'sans']}`
        if (nextFont !== font) {
          ctx.font = nextFont
          font = nextFont
        }
        ctx.fillStyle = color
        ctx.fillText(c.text, c.x, c.y)
        break
      }
    }
  }

  ctx.globalCompositeOperation = 'source-over'
  ctx.shadowBlur = 0
}

/** Draw a video frame to the canvas, mirrored horizontally (selfie view). */
export function drawMirroredVideo(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  width: number,
  height: number,
): void {
  ctx.save()
  ctx.shadowBlur = 0
  ctx.globalCompositeOperation = 'source-over'
  ctx.translate(width, 0)
  ctx.scale(-1, 1)
  ctx.drawImage(video, 0, 0, width, height)
  ctx.restore()
}

/** Demo-mode backdrop: a dark gradient with a slowly drifting grid. */
export function drawDemoBackground(ctx: CanvasRenderingContext2D, width: number, height: number, ts: number): void {
  ctx.save()
  ctx.shadowBlur = 0
  ctx.globalCompositeOperation = 'source-over'
  ctx.globalAlpha = 1
  const g = ctx.createRadialGradient(width / 2, height * 0.45, 0, width / 2, height * 0.45, Math.max(width, height) * 0.75)
  g.addColorStop(0, '#0f1d24')
  g.addColorStop(1, '#05090c')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, width, height)

  const step = 48
  const offset = (ts / 60) % step
  ctx.strokeStyle = 'rgba(0, 229, 255, 0.06)'
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let x = -step + offset; x < width + step; x += step) {
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
  }
  for (let y = -step + offset; y < height + step; y += step) {
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
  }
  ctx.stroke()
  ctx.restore()
}
