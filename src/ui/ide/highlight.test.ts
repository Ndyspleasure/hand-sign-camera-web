import { describe, expect, it } from 'vitest'
import { stripComments, tokenizeJson, tokenizeTs, type Token } from './highlight'

const kinds = (tokens: Token[]) => tokens.filter((t) => t.t.trim()).map((t) => `${t.k}:${t.t}`)

describe('tokenizeTs', () => {
  it('classifies keywords, types, calls, properties and literals', () => {
    expect(kinds(tokenizeTs('const scale = handScale(lm) * 0.6 // note'))).toEqual([
      'kw:const', 'var:scale', 'op:=', 'fn:handScale', 'op:(', 'var:lm', 'op:)', 'op:*', 'num:0.6', 'com:// note',
    ])
    expect(kinds(tokenizeTs('return this.effects.map((e) => e.id)'))).toEqual([
      'ctl:return', 'lit:this', 'op:.', 'prop:effects', 'op:.', 'fn:map', 'op:(', 'op:(', 'var:e', 'op:)',
      'op:=', 'op:>', 'var:e', 'op:.', 'prop:id', 'op:)',
    ])
    expect(kinds(tokenizeTs("import { Gesture } from './Gesture'"))).toEqual([
      'ctl:import', 'op:{', 'type:Gesture', 'op:}', 'ctl:from', "str:'./Gesture'",
    ])
  })

  it('tolerates half-typed strings and comments', () => {
    expect(kinds(tokenizeTs("const s = 'unfinis"))).toEqual(['kw:const', 'var:s', 'op:=', "str:'unfinis"])
    expect(kinds(tokenizeTs('/* partial'))).toEqual(['com:/* partial'])
  })

  it('reassembles to the original text', () => {
    const line = '  if (dist(a, b) > scale * 0.4) return Gesture.OK // pinch'
    expect(tokenizeTs(line).map((t) => t.t).join('')).toBe(line)
  })
})

describe('tokenizeJson', () => {
  it('separates keys from values', () => {
    expect(kinds(tokenizeJson('  "gesture": "PEACE", "score": 0.97, "ok": true // hi'))).toEqual([
      'key:"gesture"', 'op::', 'str:"PEACE"', 'op:,', 'key:"score"', 'op::', 'num:0.97', 'op:,',
      'key:"ok"', 'op::', 'lit:true', 'com:// hi',
    ])
  })

  it('handles negative numbers in arrays', () => {
    expect(kinds(tokenizeJson('[0.512, -0.041]'))).toEqual(['op:[', 'num:0.512', 'op:,', 'num:-0.041', 'op:]'])
  })
})

describe('stripComments', () => {
  it('removes line, block and doc comments and blank lines, keeping strings', () => {
    const src = [
      '/**',
      ' * Doc comment',
      ' */',
      "import { a } from './a' // trailing",
      '',
      'const url = "http://x" /* inline */ + `//${a}`',
      '  // indented note',
      "const s = 'it\\'s // not a comment'",
    ].join('\n')
    expect(stripComments(src)).toBe(
      ["import { a } from './a'", 'const url = "http://x"  + `//${a}`', "const s = 'it\\'s // not a comment'"].join('\n'),
    )
  })

  it('leaves no comment or blank line in the bundled source files', async () => {
    const { CODE_FILES } = await import('./codeSamples')
    for (const f of CODE_FILES) {
      for (const line of f.code.split('\n')) {
        expect(line.trim(), f.name).not.toBe('')
        expect(tokenizeTs(line).some((t) => t.k === 'com'), `${f.name}: ${line}`).toBe(false)
      }
    }
  })
})
