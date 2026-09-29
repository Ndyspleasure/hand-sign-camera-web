// Renders Open Graph images (1200×630 JPEG) and app icons from the dev server.
// Usage: start `npm run dev`, then `npm run og:images` (needs Playwright + Chromium).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const { chromium } = require(process.env.PLAYWRIGHT_PATH || 'playwright')
const DEV = process.env.DEV_URL || 'http://localhost:3000'
const content = readFileSync('src/seo/content.ts', 'utf8')
const slugs = ['home', 'gestures', ...[...content.matchAll(/slug: '([a-z0-9-]+)'/g)].map((m) => m[1])]

const browser = await chromium.launch({ args: ['--no-proxy-server'] })
const page = await (await browser.newContext({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })).newPage()
mkdirSync('public/og', { recursive: true })
for (const slug of slugs) {
  await page.goto(`${DEV}/__og/${slug}`)
  await page.screenshot({ path: `public/og/${slug}.jpg`, type: 'jpeg', quality: 82 })
  console.log('og', slug)
}

const svg = readFileSync('public/favicon.svg', 'utf8')
async function icon(size, file, pad = 0, bg = 'transparent') {
  await page.setViewportSize({ width: size, height: size })
  await page.setContent(
    `<html><body style="margin:0;background:${bg};display:grid;place-items:center;width:${size}px;height:${size}px">` +
      `<div style="width:${size - pad * 2}px;height:${size - pad * 2}px">${svg.replace('<svg ', '<svg width="100%" height="100%" ')}</div></body></html>`,
  )
  const buf = await page.screenshot({ type: 'png', omitBackground: bg === 'transparent' })
  writeFileSync(file, buf)
  return buf
}
await icon(192, 'public/icons/icon-192.png')
await icon(512, 'public/icons/icon-512.png')
await icon(512, 'public/icons/icon-maskable-512.png', 64, '#071014')
await icon(180, 'public/apple-touch-icon.png', 14, '#071014')
const png32 = await icon(32, '/tmp/favicon-32.png')

// favicon.ico: a single 32×32 PNG in an ICO container.
const header = Buffer.alloc(22)
header.writeUInt16LE(0, 0)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(1, 4)
header.writeUInt8(32, 6)
header.writeUInt8(32, 7)
header.writeUInt16LE(1, 10)
header.writeUInt16LE(32, 12)
header.writeUInt32LE(png32.length, 14)
header.writeUInt32LE(22, 18)
writeFileSync('public/favicon.ico', Buffer.concat([header, png32]))
await browser.close()
console.log('icons done')
