import { useLayoutEffect, useRef } from 'react'
import type { LogLine } from '../telemetry'

/** VS Code-style bottom panel streaming the tracker's live log. */
export default function TerminalPanel({ lines }: { lines: LogLine[] }) {
  const bodyRef = useRef<HTMLDivElement>(null)
  const lastId = lines.length > 0 ? lines[lines.length - 1].id : 0

  useLayoutEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lastId])

  return (
    <section className="terminal" aria-label="Tracker log">
      <div className="term-tabs">
        <span>PROBLEMS</span>
        <span>OUTPUT</span>
        <span>DEBUG CONSOLE</span>
        <span className="is-active">TERMINAL</span>
        <span className="term-title">bash — hand-tracker</span>
      </div>
      <div className="term-body" ref={bodyRef}>
        {lines.map((l) => (
          <div key={l.id} className={`tl tl-${l.level}`}>
            <span className="tl-time">{l.time}</span>
            <span className="tl-tag">[{l.level}]</span>
            <span className="tl-text">{l.text}</span>
          </div>
        ))}
        <div className="tl tl-prompt">
          <span className="tl-user">vanillate@hsc</span>:<span className="tl-path">~/hand-sign-camera</span>$ <span className="caret" />
        </div>
      </div>
    </section>
  )
}
