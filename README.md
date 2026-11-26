# Prospect — website

React + TypeScript + Vite, GSAP/ScrollTrigger with Lenis, Three.js.

```
npm install
npm run dev       # local development
npm run build     # type-check + production build into dist/
npm run preview   # serve dist/ locally
```

## Before deploying

Edit `site.config.json`:

- `siteUrl` — the final domain, e.g. `https://example.com`. When empty, the build
  skips `sitemap.xml` and absolute canonical / Open Graph URLs (it warns you).
- `whatsapp` / `whatsappDisplay` — the number every "Start a project" button opens.

`dist/` is fully static. `404.html` is served automatically for unknown paths on
Vercel and Netlify.

## Where things live

| | |
|---|---|
| `src/webgl/Universe.ts` | the 3D environment (star tower, debris, frames, particles) |
| `src/core/sceneState.ts` | the numbers scroll animations write and the 3D scene reads |
| `src/sections/*` | one file per section |
| `src/showcase/Worlds.tsx` + `worlds.css` | the eight concept websites (1440×900 artboards) |
| `src/showcase/transitions.ts` | the seven transitions between concepts |
| `src/i18n.tsx` | all Portuguese and English copy |
| `src/brand/logoPaths.ts` | the logo, traced from the official lockup |

## Assets and licences

- Showcase photography: Unsplash (Unsplash License), converted to grayscale WebP.
- Work section: screenshots of the live EVO Reformas site.
- Fonts: Archivo (site), plus Big Shoulders Display, Italiana, Anton, Bodoni Moda,
  Tenor Sans, Michroma and Instrument Serif inside the concepts — all SIL OFL via Fontsource.

The eight showcase brands are fictional and labelled as concepts on the page.
