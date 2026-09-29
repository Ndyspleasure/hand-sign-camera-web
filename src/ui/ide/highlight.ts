/**
 * Tiny line-based syntax highlighter for the code panels (TypeScript and
 * JSON-with-comments). Deliberately simple and fast: it runs on every typing
 * tick, and tolerates half-typed lines (unterminated strings/comments).
 */

export type TokenKind =
  | 'kw' // declaration keywords: const, class, function…
  | 'ctl' // control keywords: import, return, if…
  | 'lit' // true, false, null, this…
  | 'str'
  | 'num'
  | 'com'
  | 'type'
  | 'fn'
  | 'var'
  | 'prop'
  | 'key' // JSON key
  | 'op'

export interface Token {
  k: TokenKind
  t: string
}

const DECL = new Set([
  'const', 'let', 'var', 'function', 'new', 'class', 'extends', 'implements', 'interface',
  'type', 'enum', 'private', 'public', 'protected', 'readonly', 'static', 'async', 'of', 'in',
  'as', 'void', 'typeof', 'keyof', 'declare', 'get', 'set', 'instanceof',
])
const CONTROL = new Set([
  'import', 'export', 'from', 'return', 'if', 'else', 'for', 'while', 'switch', 'case',
  'default', 'break', 'continue', 'throw', 'try', 'catch', 'finally', 'do', 'await',
])
const LITERALS = new Set(['true', 'false', 'null', 'undefined', 'this', 'super'])

// comment | string (possibly unterminated) | number | identifier | spaces | other
const TS_TOKEN =
  /(\/\/.*$|\/\*.*?(?:\*\/|$))|('(?:[^'\\]|\\.)*'?|"(?:[^"\\]|\\.)*"?|`(?:[^`\\]|\\.)*`?)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(\s+)|(.)/g

/** Tokenize one line of TypeScript. */
export function tokenizeTs(line: string): Token[] {
  const out: Token[] = []
  TS_TOKEN.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = TS_TOKEN.exec(line)) !== null) {
    const [text, com, str, num, ident] = m
    if (com) out.push({ k: 'com', t: text })
    else if (str) out.push({ k: 'str', t: text })
    else if (num) out.push({ k: 'num', t: text })
    else if (ident) {
      const prev = out.length > 0 ? out[out.length - 1].t : ''
      const next = line[TS_TOKEN.lastIndex]
      let k: TokenKind = 'var'
      if (CONTROL.has(ident)) k = 'ctl'
      else if (DECL.has(ident)) k = 'kw'
      else if (LITERALS.has(ident)) k = 'lit'
      else if (next === '(') k = 'fn'
      else if (prev.endsWith('.')) k = 'prop'
      else if (/^[A-Z]/.test(ident)) k = 'type'
      out.push({ k, t: text })
    } else out.push({ k: 'op', t: text })
  }
  return out
}

// comment | string | number | literal | spaces | other
const JSON_TOKEN =
  /(\/\/.*$)|("(?:[^"\\]|\\.)*"?)|(-?\b\d+(?:\.\d+)?(?:e[+-]?\d+)?\b)|(\btrue\b|\bfalse\b|\bnull\b)|(\s+)|(.)/g

/** Tokenize one line of JSON (with `//` comments). Keys are strings followed by ':'. */
export function tokenizeJson(line: string): Token[] {
  const out: Token[] = []
  JSON_TOKEN.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = JSON_TOKEN.exec(line)) !== null) {
    const [text, com, str, num, lit] = m
    if (com) out.push({ k: 'com', t: text })
    else if (str) {
      const rest = line.slice(JSON_TOKEN.lastIndex).trimStart()
      out.push({ k: rest.startsWith(':') ? 'key' : 'str', t: text })
    } else if (num) out.push({ k: 'num', t: text })
    else if (lit) out.push({ k: 'lit', t: text })
    else out.push({ k: 'op', t: text })
  }
  return out
}

/**
 * Remove every comment from TypeScript source and drop the lines left blank,
 * so the editor shows only lines of code. String and template literals are
 * respected (a `//` inside a string stays).
 */
export function stripComments(source: string): string {
  let out = ''
  let i = 0
  const n = source.length
  while (i < n) {
    const c = source[i]
    const next = source[i + 1]
    if (c === '/' && next === '/') {
      while (i < n && source[i] !== '\n') i++
    } else if (c === '/' && next === '*') {
      const end = source.indexOf('*/', i + 2)
      i = end < 0 ? n : end + 2
    } else if (c === "'" || c === '"' || c === '`') {
      let j = i + 1
      while (j < n && source[j] !== c) {
        if (source[j] === '\\') j++
        else if (c !== '`' && source[j] === '\n') break
        j++
      }
      out += source.slice(i, j + 1)
      i = j + 1
    } else {
      out += c
      i++
    }
  }
  return out
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .filter((line) => line.trim() !== '')
    .join('\n')
}
