import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { finePointer, reducedMotion } from '../core/env'

/**
 * A complement to the native cursor, never a replacement: a lagging ring, a small
 * label that sits beside the pointer (never on top of what it points at), and
 * magnetic pull on [data-magnetic]. Desktop pointers only.
 *
 * data-cursor values: "link" | "label:Text"
 */
export function Cursor() {
  const ring = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    if (!finePointer) return
    document.documentElement.classList.add('has-cursor')
    const r = ring.current!
    const lab = label.current!
    const pos = { x: innerWidth / 2, y: innerHeight / 2 }
    const ringPos = { ...pos }
    let mode = ''
    let visible = false
    let magnet: HTMLElement | null = null
    const k = reducedMotion ? 1 : 0.2

    const setMode = (m: string) => {
      if (m === mode) return
      mode = m
      r.className = 'cur-ring'
      lab.textContent = ''
      if (m === 'link') r.classList.add('is-link')
      else if (m.startsWith('label:')) {
        r.classList.add('is-label')
        lab.textContent = m.slice(6)
      }
    }

    const readTarget = (under: Element | null) => {
      const target = under?.closest<HTMLElement>('[data-cursor], a, button, [role="button"], input, select, textarea')
      if (!target) setMode('')
      // an empty data-cursor means "plain cursor here" (used on text blocks)
      else if (target.dataset.cursor !== undefined) setMode(target.dataset.cursor)
      else if (/^(INPUT|SELECT|TEXTAREA)$/.test(target.tagName)) setMode('')
      else setMode('link')
    }
    // the page moves under a still pointer while scrolling: re-read what is beneath it
    let scrollRaf = 0
    const onScroll = () => {
      if (!visible || scrollRaf) return
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = 0
        readTarget(document.elementFromPoint(pos.x, pos.y))
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      pos.x = e.clientX
      pos.y = e.clientY
      if (!visible) {
        visible = true
        ringPos.x = pos.x
        ringPos.y = pos.y
        document.documentElement.classList.add('cursor-in')
      }
      readTarget(e.target as Element | null)

      const m = (e.target as Element | null)?.closest?.<HTMLElement>('[data-magnetic]') ?? null
      if (m !== magnet) {
        if (magnet) gsap.to(magnet, { x: 0, y: 0, duration: 0.6, ease: 'power3.out' })
        magnet = m
      }
      if (magnet && !reducedMotion) {
        const b = magnet.getBoundingClientRect()
        // gentle pull: buttons must never slide over their neighbours
        const strength = (Number(magnet.dataset.magnetic) || 0.3) * 0.45
        gsap.to(magnet, {
          x: (pos.x - (b.left + b.width / 2)) * strength,
          y: (pos.y - (b.top + b.height / 2)) * strength,
          duration: 0.35,
          ease: 'power3.out',
          overwrite: 'auto',
        })
      }
    }
    const onLeave = () => {
      visible = false
      document.documentElement.classList.remove('cursor-in')
    }
    const onDown = () => r.classList.add('is-down')
    const onUp = () => r.classList.remove('is-down')

    const tick = () => {
      ringPos.x += (pos.x - ringPos.x) * k
      ringPos.y += (pos.y - ringPos.y) * k
      r.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`
    }
    gsap.ticker.add(tick)
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('pointerdown', onDown)
    window.addEventListener('pointerup', onUp)
    return () => {
      gsap.ticker.remove(tick)
      cancelAnimationFrame(scrollRaf)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointerup', onUp)
      document.documentElement.classList.remove('has-cursor', 'cursor-in')
    }
  }, [])

  if (!finePointer) return null
  return (
    <div className="cur" aria-hidden="true">
      <div className="cur-ring" ref={ring}>
        <span ref={label} />
      </div>
    </div>
  )
}
