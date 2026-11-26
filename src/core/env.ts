const mq = (q: string) => window.matchMedia(q).matches

export const reducedMotion = mq('(prefers-reduced-motion: reduce)')
export const finePointer = mq('(hover: hover) and (pointer: fine)')
/**
 * Lower-cost 3D for phones, tablets, touch-first and low-memory devices.
 * Weak desktops are handled at runtime by Universe's adaptive resolution.
 */
export const lowPower =
  !finePointer || mq('(max-width: 899px)') || ((navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8) <= 2

/** gsap.matchMedia conditions shared by every section. */
export const MQ = {
  immersive: '(min-width: 900px) and (prefers-reduced-motion: no-preference)',
  compact: '(max-width: 899px), (prefers-reduced-motion: reduce)',
  /** phones and tablets that accept motion: scroll-linked, transform/opacity only, no pinning */
  touchMotion: '(max-width: 899px) and (prefers-reduced-motion: no-preference)',
}

export function hasWebGL() {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/**
 * Fetch and decode a section's images before it scrolls into view, so the first
 * frame that shows them never stalls on a large image decode.
 */
export function warmImages(root: Element) {
  root.querySelectorAll('img').forEach((img) => {
    img.loading = 'eager'
    img.decode?.().catch(() => {})
  })
}

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v)
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
export const easeOut = (t: number) => 1 - Math.pow(1 - t, 4)
export const easeIn = (t: number) => t * t * t
