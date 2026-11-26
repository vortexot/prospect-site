import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { finePointer, reducedMotion } from '../core/env'
import { S } from '../core/sceneState'

/**
 * One cohesive cursor: a dot, a lagging ring that becomes a label or a lens,
 * and magnetic pull on [data-magnetic] elements. Desktop pointers only.
 *
 * data-cursor values: "link" | "label:Text" | "lens:/image.webp"
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null)
  const ring = useRef<HTMLDivElement>(null)
  const label = useRef<HTMLSpanElement>(null)
  const lens = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!finePointer) return
    document.documentElement.classList.add('has-cursor')
    const d = dot.current!
    const r = ring.current!
    const l = lens.current!
    const lab = label.current!
    const pos = { x: innerWidth / 2, y: innerHeight / 2 }
    const ringPos = { ...pos }
    const lensPos = { ...pos }
    let mode = ''
    let visible = false
    let magnet: HTMLElement | null = null
    const k = reducedMotion ? 1 : 0.2

    const setMode = (m: string) => {
      if (m === mode) return
      mode = m
      r.className = 'cur-ring'
      l.classList.remove('is-on')
      lab.textContent = ''
      if (m === 'link') r.classList.add('is-link')
      else if (m.startsWith('label:')) {
        r.classList.add('is-label')
        lab.textContent = m.slice(6)
      } else if (m.startsWith('lens:')) {
        r.classList.add('is-hidden')
        l.style.backgroundImage = `url("${m.slice(5)}")`
        l.classList.add('is-on')
      }
    }

    const readTarget = (under: Element | null) => {
      const target = under?.closest<HTMLElement>('[data-cursor], a, button, [role="button"], input, select, textarea')
      if (!target) setMode('')
      else if (target.dataset.cursor) setMode(target.dataset.cursor)
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
        ringPos.x = lensPos.x = pos.x
        ringPos.y = lensPos.y = pos.y
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
        const strength = Number(magnet.dataset.magnetic) || 0.3
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
      lensPos.x += (pos.x - lensPos.x) * (reducedMotion ? 1 : 0.13)
      lensPos.y += (pos.y - lensPos.y) * (reducedMotion ? 1 : 0.13)
      d.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`
      r.style.transform = `translate3d(${ringPos.x}px, ${ringPos.y}px, 0)`
      l.style.transform = `translate3d(${lensPos.x}px, ${lensPos.y}px, 0)`
      r.classList.toggle('is-object', S.hovered >= 0 && mode.startsWith('label:'))
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
      <div className="cur-lens" ref={lens} />
      <div className="cur-ring" ref={ring}>
        <span ref={label} />
      </div>
      <div className="cur-dot" ref={dot} />
    </div>
  )
}
