import { memo, useEffect, useLayoutEffect, useMemo, useReducer, useRef } from 'react'
import { CODE_FILES, type CodeFile } from './codeSamples'
import { tokenizeTs, type TokenKind } from './highlight'

const TICK_MS = 40
const HOLD_MS = 1800

interface TypingState {
  file: number
  chars: number
  hold: number
}

/** Pure reducer: advance typing by `step` chars, then hold and move to the next file. */
function typingReducer(s: TypingState, step: number): TypingState {
  const code = CODE_FILES[s.file].code
  if (s.chars >= code.length) {
    if (s.hold + TICK_MS < HOLD_MS) return { ...s, hold: s.hold + TICK_MS }
    return { file: (s.file + 1) % CODE_FILES.length, chars: 0, hold: 0 }
  }
  let next = Math.min(code.length, s.chars + step)
  // Indentation appears instantly, like an editor auto-indenting.
  while (next < code.length && code[next] === ' ') next++
  return { ...s, chars: next }
}

const CodeLine = memo(function CodeLine({ n, text, active }: { n: number; text: string; active: boolean }) {
  const tokens = useMemo(() => tokenizeTs(text), [text])
  return (
    <div className={`cl${active ? ' cl-active' : ''}`}>
      <span className="cl-n">{n}</span>
      <span className="cl-code">
        {tokens.map((t, i) => (
          <span key={i} className={`tk-${t.k}`}>
            {t.t}
          </span>
        ))}
        {active && <span className="caret" />}
      </span>
    </div>
  )
})

interface MiniLine {
  indent: number
  len: number
  kind: TokenKind
}

function minimapOf(file: CodeFile): MiniLine[] {
  return file.code.split('\n').map((line) => {
    const trimmed = line.trimStart()
    const first = tokenizeTs(trimmed).find((t) => t.t.trim())
    return { indent: line.length - trimmed.length, len: trimmed.length, kind: first?.k ?? 'op' }
  })
}

const Minimap = memo(function Minimap({ file, typed }: { file: CodeFile; typed: number }) {
  const lines = useMemo(() => minimapOf(file), [file])
  return (
    <div className="minimap" aria-hidden="true">
      {lines.map((l, i) => (
        <div
          key={i}
          className={`mm-line tkbg-${l.kind}`}
          style={{ marginLeft: l.indent * 0.9, width: Math.min(l.len * 0.9, 60), opacity: i < typed ? 0.85 : 0.18 }}
        />
      ))}
    </div>
  )
})

/**
 * Auto-typing code editor: types the app's real source files one after
 * another with syntax highlighting, line numbers, a caret and a minimap.
 */
export default function CodeEditor() {
  const [state, advance] = useReducer(typingReducer, { file: 0, chars: 0, hold: 0 })
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const id = window.setInterval(() => advance(3 + Math.floor(Math.random() * 5)), TICK_MS)
    return () => window.clearInterval(id)
  }, [])

  const file = CODE_FILES[state.file]
  const lines = file.code.slice(0, state.chars).split('\n')

  // Keep the line being typed in view.
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [lines.length, state.file])

  return (
    <section className="ce">
      <div className="ce-tabs" role="tablist">
        {CODE_FILES.map((f, i) => (
          <div key={f.name} className={`ce-tab${i === state.file ? ' is-active' : ''}`} role="tab" aria-selected={i === state.file}>
            <span className="ts-badge">TS</span>
            {f.name}
          </div>
        ))}
      </div>
      <div className="ce-crumbs">
        {file.path.split('/').join('  ›  ')}
        <span className="ce-typing">● typing</span>
      </div>
      <div className="ce-body">
        <div className="ce-scroll" ref={scrollRef}>
          {lines.map((text, i) => (
            <CodeLine key={i} n={i + 1} text={text} active={i === lines.length - 1} />
          ))}
        </div>
        <Minimap file={file} typed={lines.length} />
      </div>
    </section>
  )
}
