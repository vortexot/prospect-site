import site from '../site.config.json'

type Localized = { pt: string; en: string }

/**
 * Real business content, edited in site.config.json. Never fill these with made-up
 * values: an empty field is hidden on the published site and shows up as a marked
 * placeholder on the dev server (or with ?pendencias in the address).
 */
export const CONTENT = site as {
  siteUrl: string
  whatsapp: string
  whatsappDisplay: string
  email: string
  /** e.g. { "label": "Instagram", "url": "https://…" } */
  social: { label: string; url: string }[]
  /** e.g. { "name": "…", "role": { "pt": "…", "en": "…" } } */
  team: { name: string; role: Localized }[]
  timeline: Localized
  priceRange: Localized
}

export const SHOW_PENDING = import.meta.env.DEV || new URLSearchParams(location.search).has('pendencias')
