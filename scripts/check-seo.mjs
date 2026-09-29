// Validates the built site's SEO basics. Run after `npm run build`.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const DIST = 'dist'
const errors = []
const fail = (page, msg) => errors.push(`${page}: ${msg}`)

function walk(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f)
    return statSync(p).isDirectory() ? walk(p) : [p]
  })
}

const pages = walk(DIST).filter((f) => f.endsWith('.html') && !f.includes('mediapipe'))
const origin = (readFileSync(join(DIST, 'sitemap.xml'), 'utf8').match(/<loc>(https:\/\/[^/<]+)/) || [])[1]
const titles = new Map()
const descriptions = new Map()

for (const file of pages) {
  const page = '/' + file.slice(DIST.length + 1).replace(/index\.html$/, '')
  const html = readFileSync(file, 'utf8')
  const noindex = /name="robots" content="noindex/.test(html)
  const title = (html.match(/<title>([^<]*)<\/title>/) || [])[1]
  const desc = (html.match(/name="description" content="([^"]*)"/) || [])[1]
  if (!title) fail(page, 'missing <title>')
  else if (title.length > 70) fail(page, `title too long (${title.length})`)
  if (!desc) fail(page, 'missing meta description')
  else if (!noindex && (desc.length < 70 || desc.length > 160)) fail(page, `description length ${desc.length}`)
  if (!/<html lang="en">/.test(html)) fail(page, 'missing lang')
  if (!noindex) {
    const canonical = (html.match(/rel="canonical" href="([^"]*)"/) || [])[1]
    if (canonical !== origin + page) fail(page, `canonical ${canonical}`)
    for (const p of ['og:title', 'og:description', 'og:image', 'og:url', 'twitter:card']) {
      if (!html.includes(`"${p}"`)) fail(page, `missing ${p}`)
    }
    const img = (html.match(/property="og:image" content="([^"]*)"/) || [])[1] ?? ''
    if (!existsSync(join(DIST, img.replace(origin, '')))) fail(page, `og:image not found ${img}`)
    if (titles.has(title)) fail(page, `duplicate title with ${titles.get(title)}`)
    if (descriptions.has(desc)) fail(page, `duplicate description with ${descriptions.get(desc)}`)
    titles.set(title, page)
    descriptions.set(desc, page)
  }
  // Rendered by JS: only the app page is allowed a visually hidden H1.
  const h1s = html.match(/<h1[\s>]/g) || []
  if (h1s.length !== 1) fail(page, `${h1s.length} <h1>`)
  let last = 0
  const body = html.slice(html.indexOf('<body'))
  for (const m of body.matchAll(/<h([1-6])[\s>]/g)) {
    const level = Number(m[1])
    if (last && level > last + 1 && !/<footer/.test(body.slice(0, m.index))) fail(page, `heading jumps h${last} → h${level}`)
    last = level
  }
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      JSON.parse(m[1])
    } catch {
      fail(page, 'invalid JSON-LD')
    }
  }
  for (const m of html.matchAll(/<svg[^>]*role="img"[^>]*>/g)) {
    if (!/aria-label="[^"]+"/.test(m[0])) fail(page, 'svg image without label')
  }
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\balt="/.test(m[0])) fail(page, 'img without alt')
  for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) {
    const target = m[1]
    const f = target.endsWith('/') ? join(DIST, target, 'index.html') : join(DIST, target)
    if (!existsSync(f)) fail(page, `broken internal link ${target}`)
  }
}

const sitemap = readFileSync(join(DIST, 'sitemap.xml'), 'utf8')
for (const m of sitemap.matchAll(/<loc>([^<]*)<\/loc>/g)) {
  const p = m[1].replace(origin, '')
  const f = join(DIST, p, 'index.html')
  if (!existsSync(f)) fail('sitemap', `missing page ${p}`)
  else if (/content="noindex/.test(readFileSync(f, 'utf8'))) fail('sitemap', `noindex page listed ${p}`)
}
const robots = readFileSync(join(DIST, 'robots.txt'), 'utf8')
if (!/Sitemap: https:\/\//.test(robots) && process.env.CONTEXT === undefined) fail('robots.txt', 'no Sitemap line')

console.log(`checked ${pages.length} pages, ${[...sitemap.matchAll(/<loc>/g)].length} sitemap URLs`)
if (errors.length) {
  console.log(errors.join('\n'))
  process.exit(1)
}
console.log('SEO checks passed')
