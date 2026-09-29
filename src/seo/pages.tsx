import type { ReactNode } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { GESTURES, GUIDE_ORDER, type GuideGesture } from '../gestures/registry'
import { SCRIPTS } from '../gestures/scripts'
import { Gesture } from '../shared/Gesture'
import { GESTURE_SEO, HOME_FAQ } from './content'
import HandSprite from './HandSprite'
import { absolute, fullTitle, PATHS, SITE, type SiteOptions } from './site'
import { SITE_CSS } from './styles'

// ---- Head --------------------------------------------------------------

interface Meta {
  path: string
  title: string
  description: string
  ogImage: string
  ogImageAlt: string
  ogType?: 'website' | 'article'
  noindex?: boolean
  jsonLd?: object[]
}

const esc = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** JSON for a <script> tag: `<` escaped so content can never close the tag. */
const json = (data: unknown): string => JSON.stringify(data).replace(/</g, '\\u003c')

function head(opts: SiteOptions, m: Meta): string {
  const url = absolute(opts, m.path)
  const image = absolute(opts, m.ogImage)
  const title = fullTitle(m.title)
  const tags = [
    `<meta charset="utf-8">`,
    `<meta name="viewport" content="width=device-width, initial-scale=1">`,
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(m.description)}">`,
    m.noindex
      ? `<meta name="robots" content="noindex, follow">`
      : `<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">`,
    m.noindex ? '' : `<link rel="canonical" href="${url}">`,
    `<meta name="theme-color" content="${SITE.themeColor}">`,
    `<meta name="color-scheme" content="dark">`,
    `<meta name="author" content="${SITE.brandLegal}">`,
    `<link rel="icon" href="/favicon.ico" sizes="32x32">`,
    `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`,
    `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`,
    `<link rel="manifest" href="/manifest.webmanifest">`,
    `<meta property="og:type" content="${m.ogType ?? 'website'}">`,
    `<meta property="og:site_name" content="${SITE.name}">`,
    `<meta property="og:locale" content="${SITE.locale}">`,
    `<meta property="og:url" content="${url}">`,
    `<meta property="og:title" content="${esc(m.title)}">`,
    `<meta property="og:description" content="${esc(m.description)}">`,
    `<meta property="og:image" content="${image}">`,
    `<meta property="og:image:type" content="image/jpeg">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${esc(m.ogImageAlt)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${esc(m.title)}">`,
    `<meta name="twitter:description" content="${esc(m.description)}">`,
    `<meta name="twitter:image" content="${image}">`,
    `<meta name="twitter:image:alt" content="${esc(m.ogImageAlt)}">`,
    `<style>${SITE_CSS.replace(/\n/g, '')}</style>`,
    ...(m.jsonLd ?? []).map((d) => `<script type="application/ld+json">${json(d)}</script>`),
  ]
  return tags.filter(Boolean).join('\n')
}

function page(opts: SiteOptions, m: Meta, body: ReactNode, extraHead = ''): string {
  return `<!doctype html>\n<html lang="${SITE.lang}">\n<head>\n${head(opts, m)}${extraHead}\n</head>\n<body>\n${renderToStaticMarkup(<>{body}</>)}\n</body>\n</html>\n`
}

// ---- Shared pieces -----------------------------------------------------

function Logo() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <path d="M12 21V11M12 11 8 4M12 11l1-8M12 11l4-6M12 11l6-3M12 21 6 14" />
    </svg>
  )
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  )
}

type Section = 'home' | 'gestures' | 'privacy' | null

function Header({ current }: { current: Section }) {
  const cur = (s: Section) => (s === current ? ('page' as const) : undefined)
  return (
    <header className="site">
      <div className="wrap">
        <a className="logo" href={PATHS.home} aria-label={`${SITE.name} home`}>
          <span className="logo-mark">
            <Logo />
          </span>
          {SITE.name}
        </a>
        <nav className="main" aria-label="Main">
          <a href={PATHS.home} aria-current={cur('home')}>
            Home
          </a>
          <a href={PATHS.gestures} aria-current={cur('gestures')}>
            Gestures
          </a>
          <a href={PATHS.privacy} aria-current={cur('privacy')}>
            Privacy
          </a>
          <a className="btn btn-primary" href={PATHS.camera}>
            Open camera
          </a>
        </nav>
      </div>
    </header>
  )
}

function Footer() {
  return (
    <footer className="site">
      <div className="wrap cols">
        <div>
          <a className="logo" href={PATHS.home}>
            <span className="logo-mark">
              <Logo />
            </span>
            {SITE.name}
          </a>
          <p>
            A free, private hand gesture camera that runs in your browser. Made by{' '}
            <a href={SITE.brandUrl}>{SITE.brandLegal}</a>.
          </p>
        </div>
        <div>
          <h2>Gestures</h2>
          <ul>
            {GUIDE_ORDER.map((g) => (
              <li key={g}>
                <a href={PATHS.gesture(g)}>{GESTURE_SEO[g].name}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2>App</h2>
          <ul>
            <li>
              <a href={PATHS.camera}>Open the camera</a>
            </li>
            <li>
              <a href={`${PATHS.camera}?demo`}>Watch the demo</a>
            </li>
            <li>
              <a href={PATHS.gestures}>Gesture guide</a>
            </li>
            <li>
              <a href={PATHS.privacy}>Privacy</a>
            </li>
            <li>
              <a href={SITE.productUrl}>On vanillate.id</a>
            </li>
            <li>
              <a href={SITE.brandUrl}>Vanillate Studio</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="wrap">
        <p>
          © {new Date().getFullYear()} {SITE.brandLegal}. Hand tracking runs on your device.
        </p>
      </div>
    </footer>
  )
}

function Shell({ current, children }: { current: Section; children: ReactNode }) {
  return (
    <>
      <a className="skip" href="#content">
        Skip to content
      </a>
      <Header current={current} />
      <main id="content">{children}</main>
      <Footer />
    </>
  )
}

function Figure({ g, height }: { g: GuideGesture; height: number }) {
  return <HandSprite g={g} height={height} label={`${GESTURE_SEO[g].name} hand gesture diagram`} />
}

const KIND_TAG = { static: 'One hand', motion: 'Motion', 'two-hand': 'Two hands' } as const

function GestureCard({ g, level = 3 }: { g: GuideGesture; level?: 2 | 3 }) {
  const info = GESTURES[g]
  const seo = GESTURE_SEO[g]
  const H = level === 2 ? 'h2' : 'h3'
  return (
    <a className="card" href={PATHS.gesture(g)}>
      <span className="card-fig" aria-hidden="true">
        <Figure g={g} height={100} />
      </span>
      <H>{seo.name}</H>
      <p>Effect: {info.effectLabel}</p>
      <span className={`tag ${info.kind}`}>{KIND_TAG[info.kind]}</span>
    </a>
  )
}

function Crumbs({ items }: { items: { name: string; path?: string }[] }) {
  return (
    <nav className="crumbs wrap" aria-label="Breadcrumb">
      <ol>
        {items.map((c) => (
          <li key={c.name}>{c.path ? <a href={c.path}>{c.name}</a> : <span aria-current="page">{c.name}</span>}</li>
        ))}
      </ol>
    </nav>
  )
}

function breadcrumbLd(opts: SiteOptions, items: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, item: absolute(opts, c.path) })),
  }
}

function organizationLd() {
  return {
    '@type': 'Organization',
    '@id': `${SITE.brandUrl}/#organization`,
    name: SITE.brandLegal,
    alternateName: SITE.brand,
    url: SITE.brandUrl,
    logo: `${SITE.brandUrl}/apple-touch-icon.png`,
    sameAs: SITE.sameAs,
  }
}

// ---- Pages -------------------------------------------------------------

/**
 * Old app links (`/?guide=HEART`, `/?demo`) now live on /camera/. Netlify
 * redirects them server-side; this covers any the redirect rules miss.
 */
const LEGACY_REDIRECT = `<script>if(/[?&](guide|demo|layout)(=|&|$)/.test(location.search))location.replace('/camera/'+location.search)</script>`

function homePage(opts: SiteOptions): string {
  const title = 'Hand Sign Camera: Real-Time Hand Gesture Effects Online'
  const description =
    'Free browser camera that recognizes 16 hand signs, from the peace sign to heart hands, and turns each into a live visual effect. Private, on-device, no install.'
  const oneHand = GUIDE_ORDER.filter((g) => GESTURES[g].kind !== 'two-hand')
  const twoHand = GUIDE_ORDER.filter((g) => GESTURES[g].kind === 'two-hand')

  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@graph': [
        organizationLd(),
        {
          '@type': 'WebSite',
          '@id': absolute(opts, '/#website'),
          url: absolute(opts, '/'),
          name: SITE.name,
          inLanguage: SITE.lang,
          publisher: { '@id': `${SITE.brandUrl}/#organization` },
        },
        {
          '@type': 'WebApplication',
          '@id': absolute(opts, '/#app'),
          name: SITE.name,
          url: absolute(opts, PATHS.camera),
          description,
          applicationCategory: 'MultimediaApplication',
          operatingSystem: 'Any (web browser)',
          browserRequirements: 'Requires a camera and a modern browser with WebAssembly.',
          isAccessibleForFree: true,
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'IDR' },
          featureList: [
            '16 hand gestures including two-hand gestures',
            'A distinct visual effect for every gesture',
            'Tracks two hands at once',
            'On-device processing, video never leaves the device',
            'Works offline after the first visit',
            'Video recording of the effects',
          ],
          screenshot: absolute(opts, PATHS.og('home')),
          publisher: { '@id': `${SITE.brandUrl}/#organization` },
        },
        {
          '@type': 'FAQPage',
          mainEntity: HOME_FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
        },
      ],
    },
  ]

  const body = (
    <Shell current="home">
      <div className="wrap hero">
        <div>
          <p className="eyebrow">Free · In your browser · Private</p>
          <h1>Hand gesture camera with real-time effects</h1>
          <p className="lead">
            Show a hand sign to your camera and watch it come alive. Hand Sign Camera recognizes 16 gestures, from a
            simple thumbs up to two-hand heart hands, and gives every one its own visual effect.
          </p>
          <div className="actions">
            <a className="btn btn-primary" href={PATHS.camera}>
              Open the camera
            </a>
            <a className="btn btn-ghost" href={PATHS.gestures}>
              See all 16 gestures
            </a>
          </div>
        </div>
        <div className="hero-art">
          <Figure g={Gesture.HEART} height={240} />
        </div>
      </div>

      <section id="how-it-works" aria-labelledby="how">
        <div className="wrap">
          <h2 id="how">How it works</h2>
          <p>Everything happens live in the browser tab. No account, no download, no upload.</p>
          <ol className="steps">
            <li>
              <h3>Allow the camera</h3>
              <p>Open the camera page and allow access. The hand tracking model loads once and is cached.</p>
            </li>
            <li>
              <h3>Make a hand sign</h3>
              <p>21 points on each hand are tracked and matched against the shape of every gesture, many times a second.</p>
            </li>
            <li>
              <h3>Watch the effect</h3>
              <p>Each gesture triggers its own effect, drawn on top of your video. Record a clip to keep it.</p>
            </li>
          </ol>
        </div>
      </section>

      <section aria-labelledby="gestures">
        <div className="wrap">
          <h2 id="gestures">16 hand gestures, 16 effects</h2>
          <p>
            Every card leads to a step-by-step guide: how to make the sign, what it means, and how the camera tells it
            apart from similar ones.
          </p>
          <ul className="grid">
            {[...oneHand, ...twoHand].map((g) => (
              <li key={g}>
                <GestureCard g={g} />
              </li>
            ))}
          </ul>
          <p className="center">
            <a href={PATHS.gestures}>Open the full gesture guide</a>
          </p>
        </div>
      </section>

      <section aria-labelledby="features">
        <div className="wrap">
          <h2 id="features">Why people use it</h2>
          <div className="features">
            <div className="feature">
              <Icon d="M7 11V6.5a1.5 1.5 0 0 1 3 0V11M10 10V4.5a1.5 1.5 0 0 1 3 0V10M13 10V5.5a1.5 1.5 0 0 1 3 0V11M16 11V8.5a1.5 1.5 0 0 1 3 0V14a7 7 0 0 1-7 7h-.5a6 6 0 0 1-4.9-2.6L4 14.5a1.5 1.5 0 0 1 2.4-1.8L7 13.5V11" />
              <h3>Two hands at once</h3>
              <p>
                Each hand gets its own gesture and effect, and <a href={PATHS.gesture(Gesture.HEART)}>heart hands</a>{' '}
                or a <a href={PATHS.gesture(Gesture.DOUBLE_PALM)}>double palm</a> join both hands into one.
              </p>
            </div>
            <div className="feature">
              <Icon d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6zM9 12l2 2 4-4" />
              <h3>Private by design</h3>
              <p>
                Recognition runs on your device. Your video is never uploaded. <a href={PATHS.privacy}>Read how</a>.
              </p>
            </div>
            <div className="feature">
              <Icon d="M5 12.5a7 7 0 0 1 14 0M8.5 15.5a3.5 3.5 0 0 1 7 0M12 19h.01M3 3l18 18" />
              <h3>Works offline</h3>
              <p>After the first visit the app and model are cached, so it keeps working without a connection.</p>
            </div>
            <div className="feature">
              <Icon d="M12 12m-7 0a7 7 0 1 0 14 0a7 7 0 1 0-14 0M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0" />
              <h3>Record clips</h3>
              <p>Capture the camera view with the effects as a video file, saved straight to your device.</p>
            </div>
            <div className="feature">
              <Icon d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 5l-3 14" />
              <h3>Code view on desktop</h3>
              <p>On a computer, the camera sits in a code editor layout with the live source, landmarks and tracker log.</p>
            </div>
            <div className="feature">
              <Icon d="M7 5v14l12-7z" />
              <h3>Demo without a camera</h3>
              <p>
                No webcam? <a href={`${PATHS.camera}?demo`}>Watch the demo</a>: animated hands run through the same
                recognizer and effects.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="faq">
        <div className="wrap">
          <h2 id="faq">Frequently asked questions</h2>
          <div className="faq">
            {HOME_FAQ.map((f, i) => (
              <details key={f.q} open={i === 0}>
                <summary>
                  <h3 style={{ margin: 0, fontSize: 'inherit' }}>{f.q}</h3>
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="about">
        <div className="wrap center">
          <h2 id="about">Made by Vanillate Studio</h2>
          <p style={{ margin: '0 auto 20px' }}>
            Hand Sign Camera is built by <a href={SITE.brandUrl}>Vanillate Studio</a>, an Indonesian studio making
            digital products for communities and social experiences. See it in the{' '}
            <a href={SITE.productUrl}>Vanillate product catalog</a>, or try it now: it takes a few seconds to start.
          </p>
          <a className="btn btn-primary" href={PATHS.camera}>
            Open the camera
          </a>
        </div>
      </section>
    </Shell>
  )

  return page(
    opts,
    { path: PATHS.home, title, description, ogImage: PATHS.og('home'), ogImageAlt: 'Hand Sign Camera: hand gestures with live effects', jsonLd },
    body,
    LEGACY_REDIRECT,
  )
}

function gesturesPage(opts: SiteOptions): string {
  const title = 'Hand Gestures Guide: 16 Hand Signs and What They Do'
  const description =
    'Learn 16 hand gestures with diagrams: peace sign, thumbs up, OK, rock on, I love you, heart hands and more. How to make each one and what it means.'
  const groups: { id: string; heading: string; text: string; items: GuideGesture[] }[] = [
    {
      id: 'one-hand',
      heading: 'One-hand gestures',
      text: 'Thirteen hand signs you make with a single hand. Show one with each hand to run two effects at once.',
      items: GUIDE_ORDER.filter((g) => GESTURES[g].kind === 'static'),
    },
    {
      id: 'motion',
      heading: 'Motion gesture',
      text: 'Recognized from how your hand moves, not only its shape.',
      items: GUIDE_ORDER.filter((g) => GESTURES[g].kind === 'motion'),
    },
    {
      id: 'two-hand',
      heading: 'Two-hand gestures',
      text: 'These need both hands together in the frame.',
      items: GUIDE_ORDER.filter((g) => GESTURES[g].kind === 'two-hand'),
    },
  ]
  const counting = GUIDE_ORDER.filter((g) => GESTURES[g].number !== undefined).sort(
    (a, b) => (GESTURES[a].number ?? 0) - (GESTURES[b].number ?? 0),
  )
  const crumbs = [
    { name: 'Home', path: PATHS.home },
    { name: 'Gestures', path: PATHS.gestures },
  ]
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          url: absolute(opts, PATHS.gestures),
          name: title,
          description,
          isPartOf: { '@id': absolute(opts, '/#website') },
          mainEntity: {
            '@type': 'ItemList',
            itemListElement: GUIDE_ORDER.map((g, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              name: GESTURE_SEO[g].name,
              url: absolute(opts, PATHS.gesture(g)),
            })),
          },
        },
        breadcrumbLd(opts, crumbs),
      ],
    },
  ]

  const body = (
    <Shell current="gestures">
      <Crumbs items={[{ name: 'Home', path: PATHS.home }, { name: 'Gestures' }]} />
      <div className="wrap" style={{ paddingTop: 16 }}>
        <h1>Hand gestures guide</h1>
        <p className="lead">
          Sixteen hand signs with clear diagrams: how to make each one, what it means, and the effect it triggers in
          Hand Sign Camera. Each diagram shows the 21 points the camera tracks on a hand.
        </p>
      </div>
      {groups.map((grp) => (
        <section key={grp.id} aria-labelledby={grp.id}>
          <div className="wrap">
            <h2 id={grp.id}>{grp.heading}</h2>
            <p>{grp.text}</p>
            <ul className="grid">
              {grp.items.map((g) => (
                <li key={g}>
                  <GestureCard g={g} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      ))}
      <section aria-labelledby="counting">
        <div className="wrap">
          <h2 id="counting">Counting on your fingers</h2>
          <p>Five of the gestures double as numbers, so you can count from one to ten with two hands.</p>
          <ul className="counting">
            {counting.map((g) => (
              <li key={g}>
                <a href={PATHS.gesture(g)}>
                  <b>{GESTURES[g].number}</b>
                  {GESTURE_SEO[g].name}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section>
        <div className="wrap center">
          <h2>Try them live</h2>
          <p style={{ margin: '0 auto 20px' }}>Open the camera and make any of these signs to see its effect.</p>
          <a className="btn btn-primary" href={PATHS.camera}>
            Open the camera
          </a>
        </div>
      </section>
    </Shell>
  )
  return page(opts, { path: PATHS.gestures, title, description, ogImage: PATHS.og('gestures'), ogImageAlt: 'Diagrams of 16 hand gestures', jsonLd }, body)
}

function gesturePage(opts: SiteOptions, g: GuideGesture): string {
  const info = GESTURES[g]
  const seo = GESTURE_SEO[g]
  const i = GUIDE_ORDER.indexOf(g)
  const prev = GUIDE_ORDER[(i + GUIDE_ORDER.length - 1) % GUIDE_ORDER.length]
  const next = GUIDE_ORDER[(i + 1) % GUIDE_ORDER.length]
  const path = PATHS.gesture(g)
  const variants = SCRIPTS[g].map((s) => s.name)
  const crumbs = [
    { name: 'Home', path: PATHS.home },
    { name: 'Gestures', path: PATHS.gestures },
    { name: seo.name, path },
  ]
  const howToName = `How to make the ${seo.name}${/sign|gesture|hands/i.test(seo.name) ? '' : ' gesture'}`
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'HowTo',
          name: howToName,
          description: seo.description,
          image: absolute(opts, PATHS.og(seo.slug)),
          step: info.howTo.map((text, n) => ({ '@type': 'HowToStep', position: n + 1, text })),
          url: absolute(opts, path),
          inLanguage: SITE.lang,
        },
        breadcrumbLd(opts, crumbs),
      ],
    },
  ]

  const body = (
    <Shell current="gestures">
      <Crumbs items={[{ name: 'Home', path: PATHS.home }, { name: 'Gestures', path: PATHS.gestures }, { name: seo.name }]} />
      <div className="wrap article">
        <article>
          <h1>{seo.h1}</h1>
          <p className="lead">{seo.intro}</p>
          <div className="m-fig" aria-hidden="true">
            <HandSprite g={g} height={150} label={`${seo.name} diagram`} />
          </div>
          <p className="actions">
            <a className="btn btn-primary" href={PATHS.camera}>
              Try it on camera
            </a>
            <a className="btn btn-ghost" href={`${PATHS.camera}?guide=${g}`}>
              See it animated
            </a>
          </p>

          <h2>{howToName}</h2>
          <ol>
            {info.howTo.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>

          <h2>What it means</h2>
          <p>{seo.meaning}</p>

          <h2>How the camera recognizes it</h2>
          <p>{seo.recognition}</p>

          <h2>Effect: {info.effectLabel}</h2>
          <p>{seo.effect}</p>

          <h2>Tips for reliable detection</h2>
          <ul>
            {seo.tips.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>

          <h2>Animated variations</h2>
          <p>The in-app guide demonstrates the {seo.name} in {variants.length} animations, including versions with both hands:</p>
          <ul className="chips">
            {variants.map((v) => (
              <li key={v}>{v}</li>
            ))}
          </ul>

          <h2>Related gestures</h2>
          <ul className="grid">
            {seo.related.map((r) => (
              <li key={r}>
                <GestureCard g={r} />
              </li>
            ))}
          </ul>

          <nav className="pager" aria-label="More gestures">
            <a href={PATHS.gesture(prev)} rel="prev">
              <small>Previous</small>
              {GESTURE_SEO[prev].name}
            </a>
            <a href={PATHS.gesture(next)} rel="next" style={{ textAlign: 'right' }}>
              <small>Next</small>
              {GESTURE_SEO[next].name}
            </a>
          </nav>
        </article>

        <aside className="aside" aria-label={`${seo.name} diagram`}>
          <figure className="figure">
            <Figure g={g} height={220} />
            <figcaption>
              {seo.name} diagram: highlighted fingers form the sign; the dots are the 21 tracked hand points.
            </figcaption>
          </figure>
          <dl className="facts">
            <dt>Also known as</dt>
            <dd>{seo.aka.join(', ')}</dd>
            <dt>Hands</dt>
            <dd>{KIND_TAG[info.kind]}</dd>
            {info.number !== undefined && (
              <>
                <dt>Counts as</dt>
                <dd>Number {info.number}</dd>
              </>
            )}
            <dt>Effect</dt>
            <dd>{info.effectLabel}</dd>
          </dl>
        </aside>
      </div>
    </Shell>
  )

  return page(
    opts,
    {
      path,
      title: seo.title,
      description: seo.description,
      ogImage: PATHS.og(seo.slug),
      ogImageAlt: `${seo.name} hand gesture diagram`,
      ogType: 'article',
      jsonLd,
    },
    body,
  )
}

function privacyPage(opts: SiteOptions): string {
  const title = 'Privacy: How Hand Sign Camera Handles Your Camera'
  const description =
    'Hand Sign Camera processes your camera on your device. No video is uploaded or stored on a server. What is downloaded, cached and saved locally.'
  const crumbs = [
    { name: 'Home', path: PATHS.home },
    { name: 'Privacy', path: PATHS.privacy },
  ]
  const body = (
    <Shell current="privacy">
      <Crumbs items={[{ name: 'Home', path: PATHS.home }, { name: 'Privacy' }]} />
      <div className="wrap prose">
        <h1>Privacy</h1>
        <p className="lead">
          Hand Sign Camera is built so your camera stays yours. Here is exactly what happens when you use it.
        </p>
        <h2>Your video stays on your device</h2>
        <p>
          Hand tracking and gesture recognition run inside your browser. Camera frames are processed in memory and are
          never uploaded, stored on a server or shared.
        </p>
        <h2>What is downloaded</h2>
        <p>
          The app downloads its code and the hand tracking runtime from this website, and the hand landmark model file
          from Google&apos;s public model storage. These are program files; nothing about you is sent with them. Your
          browser caches them so later visits work offline.
        </p>
        <h2>Recordings</h2>
        <p>
          When you record a clip, the video is created in your browser and saved directly to your device as a file. It
          is not uploaded anywhere.
        </p>
        <h2>Stored preferences</h2>
        <p>
          The app remembers a few settings in your browser&apos;s local storage: whether you finished the tutorial and
          which desktop panels you prefer. You can clear them any time by clearing this site&apos;s data.
        </p>
        <h2>No accounts or tracking scripts</h2>
        <p>There is no sign-up, and the app includes no advertising or analytics scripts.</p>
        <h2>Questions</h2>
        <p>
          Hand Sign Camera is made by <a href={SITE.brandUrl}>Vanillate Studio</a>. For questions, use the{' '}
          <a href={`${SITE.brandUrl}/support`}>Vanillate support center</a>.
        </p>
        <p>
          <a className="btn btn-primary" href={PATHS.camera}>
            Open the camera
          </a>
        </p>
      </div>
    </Shell>
  )
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@graph': [
        { '@type': 'WebPage', url: absolute(opts, PATHS.privacy), name: title, description, isPartOf: { '@id': absolute(opts, '/#website') } },
        breadcrumbLd(opts, crumbs),
      ],
    },
  ]
  return page(opts, { path: PATHS.privacy, title, description, ogImage: PATHS.og('home'), ogImageAlt: 'Hand Sign Camera', jsonLd }, body)
}

function notFoundPage(opts: SiteOptions): string {
  const body = (
    <Shell current={null}>
      <div className="wrap nf">
        <h1>Page not found</h1>
        <p className="lead" style={{ margin: '0 auto 24px' }}>
          This page doesn&apos;t exist. Try one of these instead:
        </p>
        <p className="actions" style={{ justifyContent: 'center' }}>
          <a className="btn btn-primary" href={PATHS.camera}>
            Open the camera
          </a>
          <a className="btn btn-ghost" href={PATHS.gestures}>
            Gesture guide
          </a>
          <a className="btn btn-ghost" href={PATHS.home}>
            Home
          </a>
        </p>
      </div>
    </Shell>
  )
  return page(opts, { path: '/404.html', title: 'Page not found', description: 'This page does not exist.', ogImage: PATHS.og('home'), ogImageAlt: 'Hand Sign Camera', noindex: true }, body)
}

// ---- Crawl files -------------------------------------------------------

/** Indexable URLs, in sitemap order. */
export function indexablePaths(): string[] {
  return [PATHS.home, PATHS.gestures, ...GUIDE_ORDER.map((g) => PATHS.gesture(g)), PATHS.camera, PATHS.privacy]
}

function sitemap(opts: SiteOptions): string {
  const urls = indexablePaths()
    .map((p) => `  <url>\n    <loc>${absolute(opts, p)}</loc>\n    <lastmod>${opts.buildDate}</lastmod>\n  </url>`)
    .join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

function robots(opts: SiteOptions): string {
  if (!opts.production) return `# Preview build: not for indexing\nUser-agent: *\nDisallow: /\n`
  return `User-agent: *\nAllow: /\n\nSitemap: ${absolute(opts, '/sitemap.xml')}\n`
}

/** llms.txt: a plain summary for AI assistants and answer engines. */
function llms(opts: SiteOptions): string {
  const lines = [
    `# ${SITE.name}`,
    '',
    `> A free web app by ${SITE.brandLegal} that recognizes 16 hand gestures through the camera in real time and turns each into its own visual effect. It runs entirely in the browser: video never leaves the device.`,
    '',
    '## Pages',
    '',
    `- [Home](${absolute(opts, PATHS.home)}): what the app does, how it works, FAQ`,
    `- [Open the camera](${absolute(opts, PATHS.camera)}): the app itself (camera permission required; add ?demo for a camera-free demo)`,
    `- [Gesture guide](${absolute(opts, PATHS.gestures)}): all 16 hand signs`,
    `- [Privacy](${absolute(opts, PATHS.privacy)}): on-device processing, what is downloaded and stored`,
    '',
    '## Gestures',
    '',
    ...GUIDE_ORDER.map((g) => `- [${GESTURE_SEO[g].name}](${absolute(opts, PATHS.gesture(g))}): ${GESTURE_SEO[g].intro} Effect: ${GESTURES[g].effectLabel}.`),
    '',
  ]
  return lines.join('\n')
}

// ---- Entry ---------------------------------------------------------------

export interface SiteFile {
  /** Output path relative to the site root, e.g. `gestures/fist/index.html`. */
  file: string
  content: string
}

export function renderSite(opts: SiteOptions): SiteFile[] {
  return [
    { file: 'index.html', content: homePage(opts) },
    { file: 'gestures/index.html', content: gesturesPage(opts) },
    ...GUIDE_ORDER.map((g) => ({ file: `gestures/${GESTURE_SEO[g].slug}/index.html`, content: gesturePage(opts, g) })),
    { file: 'privacy/index.html', content: privacyPage(opts) },
    { file: '404.html', content: notFoundPage(opts) },
    { file: 'sitemap.xml', content: sitemap(opts) },
    { file: 'robots.txt', content: robots(opts) },
    { file: 'llms.txt', content: llms(opts) },
  ]
}

/** Map a request path (dev server) to a generated file name. */
export function fileForPath(pathname: string): string | null {
  const p = pathname.replace(/\/index\.html$/, '/')
  if (p === '/') return 'index.html'
  if (/^\/(sitemap\.xml|robots\.txt|llms\.txt|404\.html)$/.test(p)) return p.slice(1)
  const m = p.match(/^\/((?:gestures(?:\/[a-z0-9-]+)?)|privacy)\/?$/)
  return m ? `${m[1]}/index.html` : null
}

// ---- Open Graph image templates (rendered to JPEG by scripts/og-images.mjs) ----

export function ogTemplate(name: string): string | null {
  const g = GUIDE_ORDER.find((x) => GESTURE_SEO[x].slug === name)
  const title = g ? GESTURE_SEO[g].h1 : name === 'gestures' ? 'Hand Gestures Guide' : 'Hand gesture camera with real-time effects'
  const sub = g
    ? `Effect: ${GESTURES[g].effectLabel} · ${KIND_TAG[GESTURES[g].kind]}`
    : name === 'gestures'
      ? '16 hand signs · how to make them · what they do'
      : 'Free · runs in your browser · private'
  const figs: GuideGesture[] = g ? [g] : name === 'gestures' ? [Gesture.PEACE, Gesture.ILY, Gesture.OK, Gesture.THUMBS_UP] : [Gesture.HEART]
  const art = renderToStaticMarkup(
    <div className="og-art">
      {figs.map((f) => (
        <Figure key={f} g={f} height={figs.length > 1 ? 250 : GESTURES[f].kind === 'two-hand' ? 330 : 400} />
      ))}
    </div>,
  )
  return `<!doctype html><html><head><meta charset="utf-8"><style>${SITE_CSS}
html,body{width:1200px;height:630px;overflow:hidden}
body{display:grid;grid-template-columns:1fr auto;align-items:center;gap:30px;padding:60px 64px;background:radial-gradient(circle at 78% 50%,rgba(0,229,255,.18),transparent 55%),#071014}
.og-brand{display:flex;align-items:center;gap:12px;font-size:26px;font-weight:700;margin-bottom:36px}
.og-brand .logo-mark{width:44px;height:44px;border-radius:12px}
.og-title{font-size:${title.length > 30 ? 58 : 66}px;line-height:1.08;letter-spacing:-.02em;margin:0 0 22px;max-width:640px}
.og-sub{font-size:26px;color:#9bb6be;margin:0}
.og-url{margin-top:40px;font-size:22px;color:#00e5ff}
.og-art{display:flex;flex-wrap:wrap;justify-content:center;align-items:center;gap:6px;max-width:${figs.length > 1 ? 440 : 520}px}
</style></head><body><div><div class="og-brand"><span class="logo-mark">${renderToStaticMarkup(<Logo />).replace('width="18" height="18"', 'width="26" height="26"')}</span>${SITE.name}</div><h1 class="og-title">${esc(title)}</h1><p class="og-sub">${esc(sub)}</p><p class="og-url">by ${SITE.brand}</p></div>${art}</body></html>`
}
