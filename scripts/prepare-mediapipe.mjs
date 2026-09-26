// Copies the MediaPipe Tasks-Vision WASM runtime out of node_modules into
// public/mediapipe/wasm so it is served from the app's own origin.
//
// Why: the WASM runtime MUST match the version of @mediapipe/tasks-vision that
// is bundled into the JS. Loading the WASM from a CDN with a hard-coded version
// drifts out of sync on every dependency bump and makes HandLandmarker fail to
// initialize. Serving the exact installed version from same-origin also removes
// the runtime dependency on an external CDN (which some networks/ISPs block).
//
// Runs automatically before `dev` and `build` (see package.json). The output is
// git-ignored and regenerated on every build.

import { cp, mkdir, readdir } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(here, '..')
const src = path.resolve(root, 'node_modules/@mediapipe/tasks-vision/wasm')
const dest = path.resolve(root, 'public/mediapipe/wasm')

if (!existsSync(src)) {
  console.error(
    `[prepare-mediapipe] MediaPipe WASM not found at ${src}. ` +
      `Run "npm install" first.`,
  )
  process.exit(1)
}

await mkdir(dest, { recursive: true })
await cp(src, dest, { recursive: true })

const files = await readdir(dest)
console.log(
  `[prepare-mediapipe] Copied ${files.length} MediaPipe WASM files to public/mediapipe/wasm`,
)
