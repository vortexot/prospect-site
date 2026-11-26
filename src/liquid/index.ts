/**
 * Liquid hover distortion for any image marked with `data-liquid`
 * (on the <img> itself or on a wrapper).
 *
 * Two WebGL canvases are shared by the whole page: one follows the cursor while
 * the other lets the previous image settle. A canvas is laid inside the DOM next
 * to its image, so it inherits clipping, 3D transforms and stacking, and it is
 * removed as soon as the surface is at rest. Nothing runs while nothing moves.
 */
import gsap from 'gsap'
import { Membrane } from './membrane'
import { Surface } from './surface'

const STEP = 1000 / 60

export function initLiquid() {
  let surfaces: Surface[] = []
  let unavailable = false
  let current: Surface | null = null
  let running = false
  let carry = 0
  let scrollRaf = 0
  const pointer = { x: 0, y: 0, active: false }

  const pool = () => {
    if (!surfaces.length && !unavailable) {
      try {
        surfaces = [new Surface(), new Surface()]
      } catch (err) {
        unavailable = true // plain images remain
        console.warn('[prospect] liquid hover disabled:', err)
      }
    }
    return surfaces.filter((s) => !s.lost)
  }

  const imageAt = (x: number, y: number) => {
    const host = document.elementFromPoint(x, y)?.closest('[data-liquid]')
    if (!host) return null
    const img = host instanceof HTMLImageElement ? host : host.querySelector('img')
    return img && img.complete && img.naturalWidth > 0 && img.offsetWidth > 40 ? img : null
  }

  /** Pointer position inside the image, 0..1. offsetX respects 3D transforms. */
  const locate = (img: HTMLImageElement, e?: PointerEvent) => {
    if (e && e.target === img) return [e.offsetX / img.offsetWidth, e.offsetY / img.offsetHeight] as const
    const r = img.getBoundingClientRect()
    return [(pointer.x - r.left) / r.width, (pointer.y - r.top) / r.height] as const
  }

  const update = (e?: PointerEvent) => {
    const img = pointer.active ? imageAt(pointer.x, pointer.y) : null
    if (current && current.img !== img) {
      current.presence = 0 // let it recover on its own
      current = null
    }
    if (!img) return
    const [u, v] = locate(img, e)
    if (!current) {
      const free = pool()
      const next = free.find((s) => s.img === img) ?? free.find((s) => !s.img) ?? [...free].sort((a, b) => a.usedAt - b.usedAt)[0]
      if (!next) return
      if (next.img !== img) {
        const membrane = new Membrane(img.offsetWidth / img.offsetHeight)
        membrane.jump(u, v)
        try {
          next.attach(img, membrane)
        } catch (err) {
          console.warn('[prospect] liquid hover skipped an image:', err)
          next.release()
          return
        }
      }
      current = next
    }
    current.presence = 1
    current.usedAt = performance.now()
    current.membrane!.aim(u, v)
    if (!running) {
      running = true
      carry = STEP
      gsap.ticker.add(tick)
    }
  }

  const tick = (time: number, delta: number) => {
    carry += Math.min(delta, 100)
    const steps = Math.min(3, Math.floor(carry / STEP))
    carry = Math.min(carry - steps * STEP, STEP)
    let alive = 0
    for (const s of surfaces) {
      if (!s.img || !s.membrane) continue
      if (!s.img.isConnected) {
        s.release()
        continue
      }
      let energy = 1
      for (let i = 0; i < steps; i++) energy = s.membrane.step(s.presence)
      if (s.presence === 0 && steps > 0 && energy < 0.0016) {
        s.release() // fully recovered: the untouched image shows again
        continue
      }
      s.draw(time)
      alive++
    }
    if (!alive) {
      running = false
      gsap.ticker.remove(tick)
    }
  }

  const onPointer = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return // touch is handled below, so it also works while scrolling
    pointer.x = e.clientX
    pointer.y = e.clientY
    pointer.active = true
    update(e)
  }
  const onTouch = (e: TouchEvent) => {
    const t = e.touches[0]
    if (!t) return
    pointer.x = t.clientX
    pointer.y = t.clientY
    pointer.active = true
    update()
  }
  const onLeave = () => {
    pointer.active = false
    update()
  }
  // the page moves under a resting cursor: that is movement too
  const onScroll = () => {
    if (!pointer.active || scrollRaf) return
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0
      update()
    })
  }
  // only a width change means a new layout; height-only resizes (phone address bar
  // collapsing) must not cut the effect: the canvas re-reads its geometry anyway
  let width = window.innerWidth
  const onResize = () => {
    if (window.innerWidth === width) return
    width = window.innerWidth
    current = null
    surfaces.forEach((s) => s.release())
  }

  const passive = { passive: true } as const
  window.addEventListener('pointermove', onPointer, passive)
  window.addEventListener('touchstart', onTouch, passive)
  window.addEventListener('touchmove', onTouch, passive)
  window.addEventListener('touchend', onLeave, passive)
  window.addEventListener('touchcancel', onLeave, passive)
  window.addEventListener('scroll', onScroll, passive)
  window.addEventListener('resize', onResize)
  document.documentElement.addEventListener('pointerleave', onLeave)

  return () => {
    gsap.ticker.remove(tick)
    cancelAnimationFrame(scrollRaf)
    window.removeEventListener('pointermove', onPointer)
    window.removeEventListener('touchstart', onTouch)
    window.removeEventListener('touchmove', onTouch)
    window.removeEventListener('touchend', onLeave)
    window.removeEventListener('touchcancel', onLeave)
    window.removeEventListener('scroll', onScroll)
    window.removeEventListener('resize', onResize)
    document.documentElement.removeEventListener('pointerleave', onLeave)
    surfaces.forEach((s) => s.destroy())
    surfaces = []
  }
}
