import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { MouseEvent } from 'react'
import { finePointer, reducedMotion } from './env'

gsap.registerPlugin(ScrollTrigger)
// phone browsers resize the viewport when the address bar collapses; don't recompute pins for that
ScrollTrigger.config({ ignoreMobileResize: true })

export let lenis: Lenis | null = null

/** One scroll system: Lenis drives the GSAP ticker, ScrollTrigger listens to Lenis. */
export function initScroll() {
  if (lenis || reducedMotion || !finePointer) return
  lenis = new Lenis({ lerp: 0.095, wheelMultiplier: 0.95 })
  lenis.on('scroll', ScrollTrigger.update)
  gsap.ticker.add((time) => lenis?.raf(time * 1000))
  gsap.ticker.lagSmoothing(0)
}

export function lockScroll(locked: boolean) {
  document.documentElement.classList.toggle('is-locked', locked)
  if (locked) lenis?.stop()
  else lenis?.start()
}

export function scrollToY(y: number, duration = 1.5, instant = false) {
  if (lenis) {
    // pins change the page height: make sure Lenis knows the current limit
    lenis.resize()
    lenis.scrollTo(y, instant ? { immediate: true, force: true } : { duration, easing: (t) => 1 - Math.pow(1 - t, 3.2) })
  } else window.scrollTo({ top: y, behavior: instant || reducedMotion ? 'instant' : 'smooth' })
}

/** Portuguese spellings accepted in shared links, e.g. /#trabalho. */
const ALIASES: Record<string, string> = {
  inicio: 'top',
  trabalho: 'work',
  trabalhos: 'work',
  vitrine: 'work',
  showcase: 'work',
  sobre: 'about',
  servicos: 'services',
  'serviços': 'services',
  processo: 'process',
  perguntas: 'faq',
  contato: 'contact',
}

export function sectionFromHash(hash: string) {
  let raw = hash.replace(/^#/, '')
  try {
    raw = decodeURIComponent(raw)
  } catch {
    return null
  }
  const id = ALIASES[raw.toLowerCase()] ?? raw.toLowerCase()
  return id && document.getElementById(id) ? id : null
}

/** Sections whose readable state is not at their top (pinned scenes) register where it is. */
const anchors = new Map<string, () => number>()
export function setAnchor(id: string, y: () => number) {
  anchors.set(id, y)
  return () => void anchors.delete(id)
}

function sectionY(id: string, el: HTMLElement) {
  if (id === 'top') return 0
  const custom = anchors.get(id)
  if (custom) return custom()
  // a pinned section moves with the viewport: its spacer holds the real position
  const box = el.parentElement?.classList.contains('pin-spacer') ? el.parentElement : el
  return Math.ceil(box.getBoundingClientRect().top + window.scrollY)
}

export function scrollToSection(id: string, { instant = false, push = true } = {}) {
  const el = document.getElementById(id)
  if (!el) return
  if (push) {
    const hash = id === 'top' ? '' : `#${id}`
    if (location.hash !== hash) history.pushState(null, '', location.pathname + location.search + hash)
  }
  scrollToY(sectionY(id, el), 1.8, instant)
  el.focus({ preventScroll: true })
}

/** Props for an in-page link: a real href, smooth scroll, and the hash kept in the URL. */
export const anchor = (id: string) => ({
  href: `#${id}`,
  onClick: (e: MouseEvent) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    scrollToSection(id)
  },
})
