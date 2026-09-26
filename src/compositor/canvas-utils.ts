import type { ARGB, DrawCommand } from '../shared'

/** Convert a 0xAARRGGBB integer to a CSS `rgba()` string. */
export function argbToRgba(argb: ARGB): string {
  const a = ((argb >>> 24) & 0xff) / 255
  const r = (argb >>> 16) & 0xff
  const g = (argb >>> 8) & 0xff
  const b = argb & 0xff
  return `rgba(${r}, ${g}, ${b}, ${a})`
}

/** Render a list of draw commands to a Canvas 2D context. */
export function renderCommands(
  ctx: CanvasRenderingContext2D,
  commands: DrawCommand[],
): void {
  for (const c of commands) {
    ctx.save()
    ctx.lineCap = 'round'
    if (c.glow) {
      ctx.shadowBlur = c.glow
      ctx.shadowColor = argbToRgba(c.color)
    }

    if (c.kind === 'line') {
      ctx.strokeStyle = argbToRgba(c.color)
      ctx.lineWidth = c.width
      ctx.beginPath()
      ctx.moveTo(c.x1, c.y1)
      ctx.lineTo(c.x2, c.y2)
      ctx.stroke()
    } else {
      ctx.beginPath()
      ctx.arc(c.x, c.y, c.radius, 0, Math.PI * 2)
      if (c.fill) {
        ctx.fillStyle = argbToRgba(c.color)
        ctx.fill()
      } else {
        ctx.strokeStyle = argbToRgba(c.color)
        ctx.lineWidth = 2
        ctx.stroke()
      }
    }

    ctx.restore()
  }
}

/** Draw a video frame to the canvas, mirrored horizontally (selfie view). */
export function drawMirroredVideo(
  ctx: CanvasRenderingContext2D,
  video: HTMLVideoElement,
  width: number,
  height: number,
): void {
  ctx.save()
  ctx.translate(width, 0)
  ctx.scale(-1, 1)
  ctx.drawImage(video, 0, 0, width, height)
  ctx.restore()
}
