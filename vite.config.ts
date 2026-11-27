import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import site from './site.config.json' with { type: 'json' }
import vercel from './vercel.json' with { type: 'json' }

const base = (process.env.SITE_URL || site.siteUrl || '').replace(/\/$/, '')

/** Head and no-script text of the English page, as [Portuguese in index.html, English]. */
const ENGLISH: [string, string][] = [
  ['<html lang="pt-BR">', '<html lang="en">'],
  ['Prospect — Estúdio digital independente | Sites, marketing e identidade visual', 'Prospect — Independent digital studio | Websites, marketing and visual identity'],
  [
    'Não sabe por onde começar? A Prospect ajuda a tirar sua empresa do papel: identidade visual, site, marketing e anúncios.',
    "Don't know where to start? Prospect helps get your business off the ground: visual identity, website, marketing and ads.",
  ],
  ['content="pt_BR"', 'content="en_US"'],
  ['<meta property="og:locale:alternate" content="en_US" />', '<meta property="og:locale:alternate" content="pt_BR" />'],
  ['content="Prospect — Estúdio digital independente"', 'content="Prospect — Independent digital studio"'],
  [
    'Não sabe por onde começar? A gente ajuda a tirar sua empresa do papel, da identidade visual ao site, marketing e anúncios.',
    "Don't know where to start? We help get your business off the ground, from visual identity to website, marketing and ads.",
  ],
  ['Logotipo da Prospect em branco sobre fundo preto', 'Prospect logo in white on a black background'],
  ['content="Sites, sistemas, identidade visual, marketing e anúncios."', 'content="Websites, systems, visual identity, marketing and ads."'],
  ['Estúdio digital independente: sites, sistemas, identidade visual, marketing e anúncios.', 'Independent digital studio: websites, systems, visual identity, marketing and ads.'],
  ['Prospect — estúdio digital independente</h1>', 'Prospect — independent digital studio</h1>'],
  [
    'Não sabe por onde começar? A gente ajuda a tirar sua empresa do papel: criação, identidade visual, sites, landing pages, sistemas, marketing e anúncios.',
    "Don't know where to start? We help get your business off the ground: creation, visual identity, websites, landing pages, systems, marketing and ads.",
  ],
  ['Fale com a Prospect no WhatsApp: ', 'Message Prospect on WhatsApp: '],
]

// Fills absolute URLs (canonical, Open Graph, JSON-LD), preloads the site font, writes the
// English page at /en and emits robots.txt + sitemap.xml.
// Set "siteUrl" in site.config.json (or SITE_URL) before deploying.
function seo(): Plugin {
  let outDir = 'dist'
  return {
    name: 'prospect-seo',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        let out = base ? html.replace(/<!--\/?abs-->/g, '') : html.replace(/<!--abs-->[\s\S]*?<!--\/abs-->/g, '')
        out = out.replaceAll('%SITE_URL%', base)
        // business e-mail and social profiles join the structured data once they exist
        out = out.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/, (_, open: string, json: string, close: string) => {
          const data = JSON.parse(json)
          const social = (site.social as { url: string }[]).map((s) => s.url)
          if (social.length) data.sameAs = social
          if (site.email) data.email = site.email
          return open + JSON.stringify(data) + close
        })
        const font = Object.keys(ctx.bundle ?? {}).find((f) => /archivo-latin-standard-normal.*\.woff2$/.test(f))
        if (!font || !out.includes('id="root"')) return out
        return { html: out, tags: [{ tag: 'link', attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `/${font}`, crossorigin: '' }, injectTo: 'head' }] }
      },
    },
    generateBundle() {
      const robots = ['User-agent: *', 'Allow: /', base ? `Sitemap: ${base}/sitemap.xml` : ''].join('\n')
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots.trim() + '\n' })
      if (!base) {
        this.warn('siteUrl is empty in site.config.json: sitemap.xml and absolute Open Graph URLs were skipped.')
        return
      }
      const today = new Date().toISOString().slice(0, 10)
      const url = (path: string, priority: string) => `  <url><loc>${base}${path}</loc><lastmod>${today}</lastmod><priority>${priority}</priority></url>`
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[url('/', '1.0'), url('/en', '0.9'), url('/privacidade', '0.2')].join('\n')}\n</urlset>\n`,
      })
    },
    closeBundle() {
      let html = readFileSync(join(outDir, 'index.html'), 'utf8')
      // the page's own address first, so the alternate links below stay as they are
      html = html.replace(`<link rel="canonical" href="${base}/"`, `<link rel="canonical" href="${base}/en"`)
      html = html.replace(`<meta property="og:url" content="${base}/"`, `<meta property="og:url" content="${base}/en"`)
      for (const [pt, en] of ENGLISH) {
        if (!html.includes(pt)) throw new Error(`/en: text not found in index.html: ${pt}`)
        html = html.replaceAll(pt, en)
      }
      mkdirSync(join(outDir, 'en'), { recursive: true })
      writeFileSync(join(outDir, 'en', 'index.html'), html)
    },
  }
}

export default defineConfig({
  plugins: [react(), seo()],
  build: {
    target: 'es2022',
    rollupOptions: {
      input: { main: 'index.html', notFound: '404.html', privacy: 'privacidade.html' },
    },
  },
  // the local preview sends the same security headers as production
  preview: { headers: Object.fromEntries(vercel.headers[0].headers.map((h) => [h.key, h.value])) },
})
