import { GUIDE_ORDER, type GuideGesture } from '../gestures/registry'
import { GESTURE_SEO } from './content'

export const SITE = {
  name: 'Hand Sign Camera',
  brand: 'Vanillate',
  brandLegal: 'Vanillate Studio',
  brandUrl: 'https://vanillate.id',
  /** This app's page in the Vanillate Studio product catalog. */
  productUrl: 'https://vanillate.id/products/hand-sign-camera',
  sameAs: ['https://discord.gg/A7n88d6uRW'],
  locale: 'en_US',
  lang: 'en',
  themeColor: '#071014',
  /** Used when the build has no URL (Netlify sets `URL` to the production address). */
  defaultOrigin: 'https://vanillate-hand-sign-camera.netlify.app',
} as const

export interface SiteOptions {
  /** Production origin, no trailing slash. */
  origin: string
  /** Only production allows indexing (deploy previews are blocked in robots.txt). */
  production: boolean
  /** ISO date of the build, for sitemap lastmod. */
  buildDate: string
}

export const PATHS = {
  home: '/',
  camera: '/camera/',
  gestures: '/gestures/',
  privacy: '/privacy/',
  gesture: (g: GuideGesture) => `/gestures/${GESTURE_SEO[g].slug}/`,
  og: (name: string) => `/og/${name}.jpg`,
} as const

export const GESTURE_BY_SLUG: Record<string, GuideGesture> = Object.fromEntries(
  GUIDE_ORDER.map((g) => [GESTURE_SEO[g].slug, g]),
)

export function absolute(opts: SiteOptions, path: string): string {
  return opts.origin + path
}

/** "Page title | Hand Sign Camera", unless that would get truncated in results. */
export function fullTitle(title: string): string {
  const withBrand = `${title} | ${SITE.name}`
  return withBrand.length <= 65 ? withBrand : title
}
