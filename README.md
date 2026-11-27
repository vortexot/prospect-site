# Prospect — website

React + TypeScript + Vite, GSAP/ScrollTrigger with Lenis, Three.js.

```
npm install
npm run dev       # local development
npm run build     # type-check + production build into dist/
npm run lint      # oxlint
npm run preview   # serve dist/ locally
```

## Before deploying

Edit `site.config.json`:

- `siteUrl` — the final domain, e.g. `https://example.com`. When empty, the build
  skips `sitemap.xml` and absolute canonical / Open Graph URLs (it warns you).
- `whatsapp` / `whatsappDisplay` — the number every WhatsApp button opens.

## Content the business still has to provide

All of it lives in `site.config.json`. **Never fill these with made-up values.** An empty
field is hidden on the published site; the dev server (or adding `?pendencias` to the
address) shows a marked placeholder in its place.

| field | shape |
|---|---|
| `email` | `"…"` |
| `social` | `[{ "label": "Instagram", "url": "https://…" }]` |
| `team` | `[{ "name": "…", "role": { "pt": "…", "en": "…" } }]` |
| `timeline`, `priceRange` | `{ "pt": "…", "en": "…" }` — adds a FAQ entry |

Deliverables per service are in `src/i18n.tsx` (empty for "Digital solutions").

## Languages, links and analytics

- `/` is Portuguese, `/en` is English (the build writes `en/index.html`).
- Section links: `#work` (the concept showcase) `#about` `#services` `#process` `#faq` `#contact`
  (Portuguese spellings such as `#trabalho` and `#contato` also work).
- WhatsApp clicks are queued as `{ event: 'whatsapp_click', placement, lang }` on
  `window.dataLayer`. Nothing is sent until an analytics tool is chosen; adding one also
  means updating the Content-Security-Policy in `vercel.json` and `privacidade.html`.

`dist/` is fully static. `404.html` is served automatically for unknown paths on
Vercel and Netlify. `vercel.json` sets the security headers and the immutable cache for
`/assets` (the local preview sends the same security headers).

## Where things live

| | |
|---|---|
| `src/webgl/Universe.ts` | the 3D environment (star tower, debris, frames, particles) |
| `src/core/sceneState.ts` | the numbers scroll animations write and the 3D scene reads |
| `src/sections/*` | one file per section |
| `src/showcase/Worlds.tsx` + `worlds.css` | the eight concept websites (1440×900 artboards) |
| `src/showcase/MobileWorlds.tsx` | their compositions for screens under 900 px |
| `src/showcase/transitions.ts` | the seven transitions between concepts |
| `src/i18n.tsx` | all Portuguese and English copy |
| `src/brand/logoPaths.ts` | the logo, traced from the official lockup |

## Assets and licences

- Showcase photography: Unsplash (Unsplash License), converted to grayscale WebP.
- Service photography (`public/services/`), Unsplash License, cropped to 16:10 and
  converted to grayscale WebP:
  [sites](https://unsplash.com/photos/JVSgcV8_vb4),
  [landing pages](https://unsplash.com/photos/nT4WsKUoLo4),
  [systems](https://unsplash.com/photos/DuHKoV44prg),
  [visual identity](https://unsplash.com/photos/eVpZxkNY3bw),
  [marketing](https://unsplash.com/photos/5VR6Na2F9MA),
  [ads](https://unsplash.com/photos/3knq8J-cAnU),
  [digital solutions](https://unsplash.com/photos/MJZ4q4v1kdw).
- Fonts: Archivo (site), plus Big Shoulders Display, Italiana, Anton, Bodoni Moda,
  Tenor Sans, Michroma and Instrument Serif inside the concepts — all SIL OFL via Fontsource.

The eight showcase brands are fictional and labelled as concepts on the page.
