import type { Plugin, ViteDevServer } from 'vite'

/** Production origin for canonical URLs, sitemap and Open Graph tags. */
export function siteOptions() {
  const raw = process.env.SITE_URL || process.env.URL || 'https://handsign.vanillate.id'
  const origin = raw.replace(/^http:\/\//, 'https://').replace(/\/+$/, '')
  // Netlify sets CONTEXT; local builds count as production so `vite preview` mirrors the live site.
  const production = (process.env.CONTEXT ?? 'production') === 'production'
  return { origin, production, buildDate: new Date().toISOString().slice(0, 10) }
}

type SeoModule = typeof import('../src/seo/pages')

/**
 * Static content pages (home, gesture guide, privacy, sitemap, robots…):
 * served on the fly in dev, written into dist by scripts/build-seo.mjs.
 * Also fills %SITE_ORIGIN% in the app's HTML.
 */
export function seoPages(): Plugin {
  return {
    name: 'hsc-seo-pages',
    transformIndexHtml: {
      order: 'pre',
      handler: (html) => html.replaceAll('%SITE_ORIGIN%', siteOptions().origin),
    },
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        try {
          const url = new URL(req.url ?? '/', 'http://localhost')
          const mod = (await server.ssrLoadModule('/src/seo/pages.tsx')) as SeoModule
          const og = url.pathname.match(/^\/__og\/([a-z0-9-]+)$/)
          if (og) {
            const html = mod.ogTemplate(og[1])
            if (!html) return next()
            res.setHeader('Content-Type', 'text/html; charset=utf-8')
            return res.end(html)
          }
          const file = mod.fileForPath(url.pathname)
          if (!file) return next()
          const found = mod.renderSite(siteOptions()).find((f) => f.file === file)
          if (!found) return next()
          const type = file.endsWith('.xml') ? 'application/xml' : file.endsWith('.txt') ? 'text/plain' : 'text/html'
          res.setHeader('Content-Type', `${type}; charset=utf-8`)
          res.end(found.content)
        } catch (err) {
          next(err)
        }
      })
    },
  }
}
