import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
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
  if (lenis) locked ? lenis.stop() : lenis.start()
}

export function scrollToY(y: number, duration = 1.5) {
  if (lenis) lenis.scrollTo(y, { duration, easing: (t) => 1 - Math.pow(1 - t, 3.2) })
  else window.scrollTo({ top: y, behavior: reducedMotion ? 'auto' : 'smooth' })
}

export function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (lenis) lenis.scrollTo(el, { duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 3.5) })
  else el.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' })
  el.focus({ preventScroll: true })
}
