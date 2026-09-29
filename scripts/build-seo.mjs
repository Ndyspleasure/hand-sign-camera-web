// Renders the static content pages into dist/ after `vite build`.
import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import react from '@vitejs/plugin-react'
import { createServer } from 'vite'

const server = await createServer({
  configFile: false,
  appType: 'custom',
  logLevel: 'error',
  plugins: [react()],
  server: { middlewareMode: true, hmr: false },
  optimizeDeps: { noDiscovery: true, include: [] },
})
try {
  const { siteOptions } = await server.ssrLoadModule('/scripts/seo-plugin.ts')
  const { renderSite } = await server.ssrLoadModule('/src/seo/pages.tsx')
  const opts = siteOptions()
  const files = renderSite(opts)
  for (const f of files) {
    const out = join('dist', f.file)
    await mkdir(dirname(out), { recursive: true })
    await writeFile(out, f.content)
  }
  console.log(`seo: ${files.length} files for ${opts.origin} (${opts.production ? 'indexable' : 'preview, robots disallow'})`)
} finally {
  await server.close()
}
