/** Inlined into every content page: no render-blocking stylesheet request. */
export const SITE_CSS = `
:root{--bg:#071014;--panel:#0c171c;--line:rgba(255,255,255,.08);--text:#e6f4f7;--muted:#9bb6be;--dim:#6f8f98;--accent:#00e5ff;--accent-ink:#03262f;--pink:#ff7aa2;--violet:#a78bfa;--hand-accent:#00e5ff;--hand-dim:rgba(180,220,230,.3);--hand-success:#34d399;color-scheme:dark}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--text);font:16px/1.65 system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif;-webkit-font-smoothing:antialiased}
a{color:var(--accent);text-underline-offset:3px}
a:hover{color:#7df3ff}
img,svg{max-width:100%}
.hand{fill:none;stroke-linecap:round;overflow:visible}
.hand .hb{stroke:var(--hand-dim);stroke-width:4}
.hand .hj{stroke:var(--hand-dim);stroke-width:9}
.hand .hl .hb{stroke:var(--hand-accent);stroke-width:6}
.hand .hl .hj{stroke:var(--hand-accent);stroke-width:10}
.hand .hl{filter:drop-shadow(0 0 5px rgba(0,229,255,.75))}
.hand .hg{fill:rgba(255,92,138,.2);stroke:#ff5c8a;stroke-width:2}
.wrap{width:100%;max-width:1120px;margin:0 auto;padding:0 16px}
.skip{position:absolute;left:-999px;top:8px;background:var(--accent);color:var(--accent-ink);padding:8px 12px;border-radius:8px;z-index:10}
.skip:focus{left:8px}
header.site{position:sticky;top:0;z-index:5;background:rgba(7,16,20,.86);backdrop-filter:blur(10px);border-bottom:1px solid var(--line)}
header.site .wrap{display:flex;align-items:center;gap:20px;height:60px}
.logo{white-space:nowrap;display:flex;align-items:center;gap:10px;color:var(--text);text-decoration:none;font-weight:700;letter-spacing:.01em}
.logo-mark{display:grid;place-items:center;width:30px;height:30px;border-radius:8px;background:linear-gradient(135deg,#00e5ff,#7c3aed);color:#03262f}
nav.main{display:flex;gap:4px;margin-left:auto;align-items:center}
nav.main a{color:var(--muted);text-decoration:none;padding:6px 10px;border-radius:8px;font-size:15px}
nav.main a:hover,nav.main a[aria-current=page]{color:var(--text);background:rgba(255,255,255,.05)}
.btn{display:inline-flex;align-items:center;gap:8px;padding:12px 20px;border-radius:12px;font-weight:600;text-decoration:none;border:1px solid transparent;transition:filter .2s,background .2s}
.btn-primary{background:var(--accent);color:var(--accent-ink)}
.btn-primary:hover{filter:brightness(1.08);color:var(--accent-ink)}
.btn-ghost{border-color:rgba(0,229,255,.4);color:var(--text)}
.btn-ghost:hover{background:rgba(0,229,255,.08);color:var(--text)}
nav.main .btn{padding:8px 14px;margin-left:6px;color:var(--accent-ink);white-space:nowrap}
main{display:block}
.hero{padding-top:56px;padding-bottom:40px;display:grid;grid-template-columns:1.1fr .9fr;gap:40px;align-items:center}
.eyebrow{margin:0 0 10px;color:var(--accent);font-size:13px;font-weight:600;letter-spacing:.12em;text-transform:uppercase}
h1{font-size:clamp(2rem,4.4vw,3.2rem);line-height:1.12;margin:0 0 16px;letter-spacing:-.02em}
h2{font-size:clamp(1.45rem,2.6vw,2rem);line-height:1.2;margin:0 0 14px;letter-spacing:-.01em}
h3{font-size:1.1rem;line-height:1.3;margin:0 0 6px}
.lead{font-size:1.15rem;color:var(--muted);margin:0 0 24px;max-width:60ch}
.actions{display:flex;flex-wrap:wrap;gap:12px}
.hero-art{display:flex;justify-content:center;align-items:center;min-height:260px;border-radius:24px;background:radial-gradient(circle at 50% 45%,rgba(0,229,255,.14),transparent 70%)}
section{padding:44px 0;border-top:1px solid var(--line)}
section>.wrap>p{max-width:72ch;color:var(--muted)}
.steps{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:20px;padding:0;list-style:none;counter-reset:s}
.steps li{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px;counter-increment:s}
.steps li::before{content:counter(s);display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:rgba(0,229,255,.12);color:var(--accent);font-weight:700;margin-bottom:12px}
.steps p,.feature p,.card p{margin:0;color:var(--muted);font-size:15px}
.grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-top:20px;padding:0;list-style:none}
.card{display:flex;flex-direction:column;gap:6px;height:100%;padding:16px;border-radius:16px;background:var(--panel);border:1px solid var(--line);color:var(--text);text-decoration:none;transition:border-color .2s,transform .2s}
.card:hover{border-color:rgba(0,229,255,.5);transform:translateY(-2px);color:var(--text)}
.card-fig{display:flex;justify-content:center;align-items:center;height:110px;margin-bottom:6px;border-radius:12px;background:radial-gradient(circle at 50% 50%,rgba(0,229,255,.08),transparent 72%)}
.card-fig svg{height:100px;width:auto}
.tag{align-self:flex-start;font-size:12px;padding:2px 9px;border-radius:999px;border:1px solid currentColor;color:var(--accent)}
.tag.two-hand{color:var(--pink)}
.tag.motion{color:#ffd23f}
.features{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-top:20px}
.feature{padding:20px;border-radius:16px;background:var(--panel);border:1px solid var(--line)}
.feature svg{color:var(--accent);margin-bottom:10px}
.faq{margin-top:16px;max-width:820px}
.faq details{border-bottom:1px solid var(--line);padding:14px 0}
.faq summary{cursor:pointer;font-weight:600;font-size:1.05rem;list-style:none;display:flex;justify-content:space-between;gap:12px}
.faq summary::-webkit-details-marker{display:none}
.faq summary::after{content:"+";color:var(--accent);font-size:1.3rem;line-height:1}
.faq details[open] summary::after{content:"\\2212"}
.faq p{margin:10px 0 0;color:var(--muted)}
.crumbs{font-size:14px;color:var(--dim);padding-top:24px}
.crumbs ol{list-style:none;display:flex;flex-wrap:wrap;gap:6px;margin:0;padding:0}
.crumbs li+li::before{content:"/";margin-right:6px;color:var(--dim)}
.crumbs a{color:var(--muted);text-decoration:none}
.crumbs a:hover{color:var(--text)}
.article{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:40px;padding-top:24px;padding-bottom:48px;align-items:start}
.article h2{margin-top:36px;font-size:1.5rem}
.article p,.article li{color:#c9dde2}
.article ol,.article ul{padding-left:22px}
.article li{margin:6px 0}
.article .chips,.article .grid{padding-left:0}
.article .grid li{margin:0}
.article .grid{grid-template-columns:repeat(3,1fr)}
.m-fig{display:none}
.aside{position:sticky;top:84px;display:flex;flex-direction:column;gap:14px}
.figure{margin:0;padding:18px;border-radius:20px;background:radial-gradient(circle at 50% 45%,rgba(0,229,255,.12),transparent 72%),var(--panel);border:1px solid var(--line);text-align:center}
.figure svg{width:auto;height:220px}
.figure figcaption{font-size:14px;color:var(--dim);margin-top:8px}
.facts{margin:0;padding:16px;border-radius:16px;background:var(--panel);border:1px solid var(--line);font-size:15px}
.facts dt{color:var(--dim);font-size:13px;text-transform:uppercase;letter-spacing:.06em}
.facts dd{margin:2px 0 12px}
.facts dd:last-child{margin-bottom:0}
.chips{display:flex;flex-wrap:wrap;gap:8px;padding:0;list-style:none}
.chips li{margin:0;padding:4px 12px;border-radius:999px;background:rgba(255,255,255,.05);border:1px solid var(--line);font-size:14px;color:var(--muted)}
.pager{display:flex;justify-content:space-between;gap:12px;margin-top:40px;padding-top:20px;border-top:1px solid var(--line)}
.pager a{text-decoration:none}
.pager small{display:block;color:var(--dim)}
.counting{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-top:16px;padding:0;list-style:none}
.counting a{display:flex;flex-direction:column;align-items:center;gap:4px;padding:12px;border-radius:14px;background:var(--panel);border:1px solid var(--line);text-decoration:none;color:var(--text)}
.counting b{font-size:1.6rem;color:var(--accent)}
.prose{max-width:760px;padding-top:32px;padding-bottom:56px}
.prose p,.prose li{color:#c9dde2}
.prose h2{margin-top:32px;font-size:1.4rem}
footer.site{border-top:1px solid var(--line);padding:36px 0 44px;color:var(--dim);font-size:14px}
footer.site .cols{display:grid;grid-template-columns:1.3fr 2fr 1fr;gap:28px}
footer.site h2{font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin:0 0 10px}
footer.site ul{list-style:none;margin:0;padding:0;columns:2;column-gap:20px}
footer.site .cols>div:last-child ul{columns:1}
footer.site li{margin:0 0 6px}
footer.site a{color:var(--muted);text-decoration:none}
footer.site a:hover{color:var(--text)}
footer.site p a,p a:not(.btn){text-decoration:underline}
.center{text-align:center}
section>.wrap>p.center,.center>p{margin-left:auto;margin-right:auto}
.nf{padding-top:80px;padding-bottom:80px;text-align:center}
@media (max-width:980px){.grid{grid-template-columns:repeat(3,1fr)}.features{grid-template-columns:repeat(2,1fr)}}
@media (max-width:860px){
.hero{grid-template-columns:1fr;padding-top:32px}
.hero-art{min-height:200px;order:-1}
.steps{grid-template-columns:1fr}
.article{grid-template-columns:1fr}
.article .grid{grid-template-columns:repeat(3,1fr)}
.m-fig{display:none}
.aside{position:static}
.aside .figure{display:none}
.m-fig{display:flex!important;justify-content:center;margin:0 0 20px;padding:12px;border-radius:16px;background:radial-gradient(circle at 50% 50%,rgba(0,229,255,.12),transparent 72%)}
footer.site .cols{grid-template-columns:1fr}
nav.main a:not(.btn){display:none}
header.site .wrap{gap:10px}
.logo{font-size:15px}
nav.main .btn{margin-left:0;padding:8px 12px}
}
@media (max-width:640px){.grid,.article .grid{grid-template-columns:1fr 1fr}.features{grid-template-columns:1fr}}
@media (max-width:420px){.counting{grid-template-columns:repeat(3,1fr)}.card-fig{height:90px}.card-fig svg{height:80px}}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
`
