import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import site from './site.config.json' with { type: 'json' }

const base = (process.env.SITE_URL || site.siteUrl || '').replace(/\/$/, '')

// Fills absolute URLs (canonical, Open Graph) and emits robots.txt + sitemap.xml.
// Set "siteUrl" in site.config.json (or SITE_URL) before deploying.
function seo(): Plugin {
  return {
    name: 'prospect-seo',
    transformIndexHtml(html) {
      if (!base) return html.replace(/<!--abs-->[\s\S]*?<!--\/abs-->/g, '').replaceAll('%SITE_URL%', '')
      return html.replace(/<!--\/?abs-->/g, '').replaceAll('%SITE_URL%', base)
    },
    generateBundle() {
      const robots = ['User-agent: *', 'Allow: /', base ? `Sitemap: ${base}/sitemap.xml` : ''].join('\n')
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robots.trim() + '\n' })
      if (!base) {
        this.warn('siteUrl is empty in site.config.json: sitemap.xml and absolute Open Graph URLs were skipped.')
        return
      }
      const today = new Date().toISOString().slice(0, 10)
      this.emitFile({
        type: 'asset',
        fileName: 'sitemap.xml',
        source: `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${base}/</loc><lastmod>${today}</lastmod><priority>1.0</priority></url>\n</urlset>\n`,
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), seo()],
  build: {
    target: 'es2022',
    rollupOptions: {
      input: { main: 'index.html', notFound: '404.html' },
    },
  },
})
