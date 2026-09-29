import { memo, useEffect, useLayoutEffect, useMemo, useReducer, useRef } from 'react'
import { IconPause, IconPlay } from '../icons'
import { CODE_FILES, type CodeFile } from './codeSamples'
import { tokenizeTs, type TokenKind } from './highlight'

const TICK_MS = 40
const HOLD_MS = 1800

interface TypingState {
  file: number
  chars: number
  hold: number
}

type TypingAction = { type: 'tick'; step: number } | { type: 'open'; file: number }

/** Pure reducer: advance typing by `step` chars, then hold and move to the next file. */
function typingReducer(s: TypingState, action: TypingAction): TypingState {
  if (action.type === 'open') return { file: action.file, chars: 0, hold: 0 }
  const step = action.step
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

const Minimap = memo(function Minimap({
  file,
  typed,
  onJump,
}: {
  file: CodeFile
  typed: number
  onJump: (ratio: number) => void
}) {
  const lines = useMemo(() => minimapOf(file), [file])
  return (
    <div
      className="minimap"
      aria-hidden="true"
      onClick={(e) => {
        const r = e.currentTarget.getBoundingClientRect()
        onJump(Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)))
      }}
    >
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
export default function CodeEditor({ typing, onToggleTyping }: { typing: boolean; onToggleTyping: () => void }) {
  const [state, dispatch] = useReducer(typingReducer, { file: 0, chars: 0, hold: 0 })
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!typing) return
    const id = window.setInterval(() => dispatch({ type: 'tick', step: 3 + Math.floor(Math.random() * 5) }), TICK_MS)
    return () => window.clearInterval(id)
  }, [typing])

  const file = CODE_FILES[state.file]
  // Paused: show the whole file so it can be read and scrolled.
  const lines = (typing ? file.code.slice(0, state.chars) : file.code).split('\n')

  // Keep the line being typed in view.
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (el && typing) el.scrollTop = el.scrollHeight
  }, [lines.length, state.file, typing])

  return (
    <section className="ce">
      <div className="ce-tabs" role="tablist">
        {CODE_FILES.map((f, i) => (
          <button
            key={f.name}
            className={`ce-tab${i === state.file ? ' is-active' : ''}`}
            role="tab"
            aria-selected={i === state.file}
            onClick={() => dispatch({ type: 'open', file: i })}
            title={f.path}
          >
            <span className="ts-badge">TS</span>
            {f.name}
          </button>
        ))}
      </div>
      <div className="ce-crumbs">
        {file.path.split('/').join('  ›  ')}
        <button className={`ce-typing${typing ? ' is-on' : ''}`} onClick={onToggleTyping} title={typing ? 'Pause typing and show the whole file' : 'Resume typing'}>
          {typing ? <IconPause size={11} /> : <IconPlay size={11} />}
          {typing ? 'Typing' : 'Paused'}
        </button>
      </div>
      <div className="ce-body">
        <div className="ce-scroll" ref={scrollRef}>
          {lines.map((text, i) => (
            <CodeLine key={i} n={i + 1} text={text} active={typing && i === lines.length - 1} />
          ))}
        </div>
        <Minimap
          file={file}
          typed={lines.length}
          onJump={(ratio) => {
            const el = scrollRef.current
            if (el) el.scrollTop = ratio * (el.scrollHeight - el.clientHeight)
          }}
        />
      </div>
    </section>
  )
}
