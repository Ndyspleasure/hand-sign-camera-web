import { describe, expect, it } from 'vitest'
import { GUIDE_ORDER } from '../gestures/registry'
import { GESTURE_SEO } from './content'
import { fileForPath, indexablePaths, renderSite } from './pages'

const opts = { origin: 'https://example.test', production: true, buildDate: '2026-01-01' }
const files = renderSite(opts)
const byFile = new Map(files.map((f) => [f.file, f.content]))

describe('SEO content', () => {
  it('gives every gesture a unique slug, title, description and H1 of sensible length', () => {
    for (const key of ['slug', 'title', 'description', 'h1'] as const) {
      const values = GUIDE_ORDER.map((g) => GESTURE_SEO[g][key])
      expect(new Set(values).size, key).toBe(values.length)
    }
    for (const g of GUIDE_ORDER) {
      const s = GESTURE_SEO[g]
      expect(s.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
      expect(s.title.length, g).toBeLessThanOrEqual(60)
      expect(s.description.length, g).toBeGreaterThanOrEqual(90)
      expect(s.description.length, g).toBeLessThanOrEqual(155)
      expect(s.related, g).not.toContain(g)
      expect(s.tips.length, g).toBeGreaterThanOrEqual(3)
    }
  })
})

describe('static site', () => {
  it('renders one page per indexable path, plus 404 and crawl files', () => {
    for (const p of indexablePaths()) {
      if (p === '/camera/') continue
      expect(byFile.has(fileForPath(p) ?? ''), p).toBe(true)
    }
    for (const f of ['404.html', 'sitemap.xml', 'robots.txt', 'llms.txt']) expect(byFile.has(f), f).toBe(true)
  })

  it('writes canonical, Open Graph and valid JSON-LD on every indexable page', () => {
    for (const p of indexablePaths()) {
      if (p === '/camera/') continue
      const html = byFile.get(fileForPath(p)!)!
      expect(html).toContain(`<link rel="canonical" href="https://example.test${p}">`)
      expect(html).toContain('property="og:image" content="https://example.test/og/')
      expect(html).toContain('name="twitter:card" content="summary_large_image"')
      expect(html.match(/<h1[\s>]/g)).toHaveLength(1)
      const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)]
      expect(blocks.length, p).toBeGreaterThan(0)
      for (const b of blocks) expect(() => JSON.parse(b[1])).not.toThrow()
    }
  })

  it('keeps the 404 page out of the index', () => {
    expect(byFile.get('404.html')).toContain('content="noindex, follow"')
    expect(byFile.get('404.html')).not.toContain('rel="canonical"')
  })

  it('lists every indexable URL in the sitemap and points robots.txt at it', () => {
    const sitemap = byFile.get('sitemap.xml')!
    for (const p of indexablePaths()) expect(sitemap).toContain(`<loc>https://example.test${p}</loc>`)
    expect(byFile.get('robots.txt')).toContain('Sitemap: https://example.test/sitemap.xml')
    expect(byFile.get('robots.txt')).not.toMatch(/Disallow: \/\s/)
  })

  it('blocks crawling of preview builds only', () => {
    const preview = renderSite({ ...opts, production: false }).find((f) => f.file === 'robots.txt')!
    expect(preview.content).toContain('Disallow: /')
  })

  it('links every gesture page from the home page and the gesture hub', () => {
    for (const g of GUIDE_ORDER) {
      const href = `href="/gestures/${GESTURE_SEO[g].slug}/"`
      expect(byFile.get('index.html'), g).toContain(href)
      expect(byFile.get('gestures/index.html'), g).toContain(href)
    }
  })

  it('maps request paths to generated files', () => {
    expect(fileForPath('/')).toBe('index.html')
    expect(fileForPath('/gestures/heart-hands/')).toBe('gestures/heart-hands/index.html')
    expect(fileForPath('/gestures/heart-hands')).toBe('gestures/heart-hands/index.html')
    expect(fileForPath('/robots.txt')).toBe('robots.txt')
    expect(fileForPath('/camera/')).toBeNull()
  })
})
