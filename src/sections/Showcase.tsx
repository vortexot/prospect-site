import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { clamp01, easeInOut, finePointer, MQ, reducedMotion, warmImages } from '../core/env'
import { S } from '../core/sceneState'
import { anchor, scrollToY, setAnchor } from '../core/scroll'
import { useI18n } from '../i18n'
import { TRANSITIONS } from '../showcase/transitions'
import { MOBILE_WORLDS } from '../showcase/MobileWorlds'
import { WORLDS, WORLD_HEADLINES } from '../showcase/Worlds'

/** progress units: 1 for the frame opening + 7 transitions + a short tail */
const UNITS = 8.6
const COUNT = WORLDS.length
/** scroll distance of one progress unit, in viewport heights */
const UNIT_VH = 0.62
/** below this width the concepts use their own mobile compositions */
const NARROW = '(max-width: 899px)'
/** progress at which world k is fully on screen and at rest */
const holdAt = (k: number) => (k === 0 ? 1 : k + 0.9)
/** progress of transition k (world k → k+1) */
const tr = (p: number, k: number) => clamp01((p - 1 - k - 0.2) / 0.6)

/** Scrolls only the index row (never the page) so that an entry sits in its middle. */
function centre(li: HTMLLIElement) {
  const ol = li.parentElement!
  if (ol.scrollWidth <= ol.clientWidth) return
  ol.scrollTo({ left: li.offsetLeft - (ol.clientWidth - li.offsetWidth) / 2, behavior: reducedMotion ? 'instant' : 'smooth' })
}

export function Showcase() {
  const { t, lang } = useI18n()
  const root = useRef<HTMLElement>(null)
  const frame = useRef<HTMLDivElement>(null)
  const tilt = useRef<HTMLDivElement>(null)
  const viewport = useRef<HTMLDivElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const worlds = useRef<HTMLDivElement[]>([])
  const marks = useRef<HTMLLIElement[]>([])
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)
  const goRef = useRef<(k: number) => void>(() => {})
  const list = useRef<HTMLOListElement>(null)
  const [narrow, setNarrow] = useState(() => window.matchMedia(NARROW).matches)
  const worldSet = narrow ? MOBILE_WORLDS : WORLDS
  const tx = (pt: string, en: string) => (lang === 'en' ? en : pt)

  useEffect(() => {
    const mq = window.matchMedia(NARROW)
    const sync = () => setNarrow(mq.matches)
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // on narrow screens the index is one swipeable row: keep the current entry in view
  useEffect(() => {
    const li = marks.current[active]
    if (li && !list.current!.contains(document.activeElement)) centre(li)
  }, [active])

  // artboard scale: the stage (1440×900, or 1000×1100 on upright phones) fills the frame
  useEffect(() => {
    const vp = viewport.current!
    const ro = new ResizeObserver(([e]) => stage.current!.style.setProperty('--s', String(e.contentRect.width / stage.current!.offsetWidth)))
    ro.observe(vp)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    const el = root.current!
    const render = (p: number) => {
      for (let i = 0; i < COUNT; i++) {
        const w = worlds.current[i]
        const vis = i === 0 ? 1 : tr(p, i - 1)
        const cov = i === COUNT - 1 ? 0 : tr(p, i)
        if (vis <= 0 || cov >= 1) {
          if (w.style.visibility !== 'hidden') w.style.visibility = 'hidden'
          continue
        }
        const sIn = vis < 1 ? TRANSITIONS[i - 1].in(vis) : null
        const sOut = cov > 0 ? TRANSITIONS[i].out(cov) : null
        w.style.visibility = 'visible'
        w.style.clipPath = sIn?.clip ?? 'none'
        w.style.transform = [sIn?.transform, sOut?.transform].filter(Boolean).join(' ') || 'none'
        w.style.transformOrigin = sOut?.origin ?? sIn?.origin ?? '50% 50%'
        w.style.setProperty('--shade', String(sOut?.shade ?? 0))
        const r = i === 0 ? easeInOut(clamp01((p - 0.35) / 0.65)) : vis
        w.style.setProperty('--r1', easeInOut(clamp01((r - 0.3) / 0.5)).toFixed(3))
        w.style.setProperty('--r2', easeInOut(clamp01((r - 0.45) / 0.45)).toFixed(3))
        w.style.setProperty('--r3', easeInOut(clamp01((r - 0.6) / 0.4)).toFixed(3))
      }
      let idx = 0
      for (let k = 0; k < COUNT - 1; k++) {
        const v = tr(p, k)
        if (v >= 0.5) idx = k + 1
        marks.current[k + 1]?.style.setProperty('--prog', v.toFixed(3))
      }
      marks.current[0]?.style.setProperty('--prog', '1')
      if (idx !== activeRef.current) {
        activeRef.current = idx
        setActive(idx)
      }
    }

    const mm = gsap.matchMedia()
    // images and concept typefaces are only requested when the section gets close
    const warm = ScrollTrigger.create({
      trigger: el,
      start: 'top 150%',
      once: true,
      onEnter: () => {
        el.classList.add('is-warm')
        requestAnimationFrame(() => warmImages(el))
      },
    })

    // ---------- pinned, scroll-scrubbed (desktop and phone) ----------
    mm.add(MQ.immersive, () => {
      const unit = () => window.innerHeight * UNIT_VH
      const side = el.querySelector<HTMLElement>('.sc-side')!
      const box = frame.current!
      const lean = tilt.current!
      const intro = (p: number) => {
        const e = easeInOut(clamp01((p - 0.12) / 0.88))
        frame.current!.style.transform = `scale(${(0.42 + 0.58 * e).toFixed(4)})`
        frame.current!.style.opacity = clamp01((p - 0.08) / 0.4).toFixed(3)
        side.style.opacity = clamp01((p - 0.45) / 0.45).toFixed(3)
        side.style.transform = `translateY(${((1 - clamp01((p - 0.45) / 0.45)) * 30).toFixed(1)}px)`
      }
      const pin = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: () => `+=${unit() * UNITS}`,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (s) => {
          const p = s.progress * UNITS
          S.explode = 0.45 + 0.55 * clamp01(p)
          S.hush = s.isActive ? clamp01(p) : 0
          intro(p)
          render(p)
        },
        onToggle: (s) => {
          if (!s.isActive) S.hush = 0
        },
      })
      intro(0)
      render(0)

      /** scroll position where world k is on screen and at rest */
      const yOf = (k: number) => pin.start + (holdAt(Math.max(0, Math.min(COUNT - 1, k))) / UNITS) * (pin.end - pin.start)
      goRef.current = (k) => scrollToY(yOf(k), 1.6)
      // links to #work land where the frame and its index are already visible
      const removeAnchor = setAnchor('work', () => Math.ceil(yOf(0)))

      // the controls are transparent until the scene opens: focusing one scrolls to it
      const onFocus = (e: FocusEvent) => {
        const li = (e.target as HTMLElement).closest('.sc-ind li')
        const k = li ? marks.current.indexOf(li as HTMLLIElement) : activeRef.current
        if (li) centre(li as HTMLLIElement)
        requestAnimationFrame(() => {
          const visibleFrom = pin.start + (0.97 / UNITS) * (pin.end - pin.start)
          if (window.scrollY < visibleFrom || window.scrollY > pin.end) scrollToY(yOf(k), 0, true)
        })
      }
      el.addEventListener('focusin', onFocus)

      // touch: a sideways swipe on the frame jumps between worlds
      let sx = 0
      let sy = 0
      const vp = viewport.current!
      const down = (e: PointerEvent) => {
        sx = e.clientX
        sy = e.clientY
      }
      const up = (e: PointerEvent) => {
        if (e.pointerType === 'mouse') return
        const dx = e.clientX - sx
        if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(e.clientY - sy)) goRef.current(activeRef.current + (dx < 0 ? 1 : -1))
      }
      vp.addEventListener('pointerdown', down)
      vp.addEventListener('pointerup', up)

      // idle autoplay: advance to the next world when the visitor stops scrolling inside the pin
      let lastInput = performance.now()
      let busy = false
      const touch = () => (lastInput = performance.now())
      const events = ['wheel', 'keydown', 'pointerdown', 'touchmove'] as const
      events.forEach((ev) => window.addEventListener(ev, touch, { passive: true }))
      const timer = window.setInterval(() => {
        // never move the page under someone who is using the keyboard here
        if (!pin.isActive || busy || document.hidden || el.querySelector(':focus-visible')) return
        const p = pin.progress * UNITS
        if (p < 0.98 || performance.now() - lastInput < 4600) return
        const next = activeRef.current + 1
        if (next >= COUNT) return
        busy = true
        scrollToY(pin.start + (holdAt(next) / UNITS) * (pin.end - pin.start), 2)
        window.setTimeout(() => {
          busy = false
          lastInput = performance.now()
        }, 2100)
      }, 400)

      // the frame leans toward the cursor
      const rx = gsap.quickTo(tilt.current!, 'rotationX', { duration: 0.9, ease: 'power3.out' })
      const ry = gsap.quickTo(tilt.current!, 'rotationY', { duration: 0.9, ease: 'power3.out' })
      gsap.set(tilt.current!, { transformPerspective: 1800 })
      const onMove = (e: PointerEvent) => {
        if (!finePointer) return
        ry((e.clientX / innerWidth - 0.5) * 6)
        rx(-(e.clientY / innerHeight - 0.5) * 4)
      }
      el.addEventListener('pointermove', onMove)

      return () => {
        removeAnchor()
        el.removeEventListener('focusin', onFocus)
        pin.kill()
        window.clearInterval(timer)
        events.forEach((ev) => window.removeEventListener(ev, touch))
        el.removeEventListener('pointermove', onMove)
        vp.removeEventListener('pointerdown', down)
        vp.removeEventListener('pointerup', up)
        ;[box, side].forEach((n) => n.removeAttribute('style'))
        gsap.set(lean, { clearProps: 'all' })
      }
    })

    // ---------- reduced motion: static frame with controls, no pin ----------
    mm.add(MQ.compact, () => {
      const state = { p: holdAt(0) }
      render(state.p)
      const explode = reducedMotion
        ? ScrollTrigger.create({ trigger: el, start: 'top 60%', end: 'max', onToggle: (s) => (S.explode = s.isActive ? 1 : 0) })
        : ScrollTrigger.create({ trigger: el, start: 'top bottom', end: 'top 15%', onUpdate: (s) => (S.explode = s.progress) })

      let tween: gsap.core.Tween | null = null
      goRef.current = (k) => {
        const to = holdAt(((k % COUNT) + COUNT) % COUNT)
        tween?.kill()
        tween = gsap.to(state, {
          p: to,
          duration: reducedMotion ? 0 : Math.min(2.2, 0.9 + Math.abs(to - state.p) * 0.18),
          ease: 'power2.inOut',
          onUpdate: () => render(state.p),
        })
      }

      let inView = false
      const io = new IntersectionObserver(([e]) => (inView = e.isIntersecting), { threshold: 0.4 })
      io.observe(viewport.current!)
      const timer = reducedMotion ? 0 : window.setInterval(() => inView && !document.hidden && goRef.current(activeRef.current + 1), 4800)

      // swipe
      let sx = 0
      const vp = viewport.current!
      const down = (e: PointerEvent) => (sx = e.clientX)
      const up = (e: PointerEvent) => {
        const dx = e.clientX - sx
        if (Math.abs(dx) > 45) goRef.current(activeRef.current + (dx < 0 ? 1 : -1))
      }
      vp.addEventListener('pointerdown', down)
      vp.addEventListener('pointerup', up)
      return () => {
        tween?.kill()
        explode.kill()
        io.disconnect()
        window.clearInterval(timer)
        vp.removeEventListener('pointerdown', down)
        vp.removeEventListener('pointerup', up)
      }
    })

    return () => {
      warm.kill()
      mm.revert()
    }
  }, [])

  const label = `${String(active + 1).padStart(2, '0')} / ${String(COUNT).padStart(2, '0')}`

  return (
    <section className="sc" id="work" ref={root} tabIndex={-1} aria-labelledby="sc-title">
      <a className="skip-link" {...anchor('about')}>
        {t.showcase.skip}
      </a>
      <div className="sc-side">
        <h2 className="sc-title" id="sc-title">
          {t.showcase.title}
        </h2>
        <p className="sc-intro">{t.showcase.intro}</p>
        <ol className="sc-ind" ref={list}>
          {t.showcase.niches.map((n, i) => (
            <li key={i} ref={(li) => void (marks.current[i] = li!)} className={i === active ? 'is-active' : ''}>
              <button type="button" aria-current={i === active ? 'true' : undefined} onClick={() => goRef.current(i)}>
                <span className="sc-ind-n">{String(i + 1).padStart(2, '0')}</span>
                <span className="sc-ind-name">{n}</span>
                <i aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
        <p className="sc-note">{t.showcase.note}</p>
      </div>

      <div className="sc-frame" ref={frame}>
        <div className="sc-tilt" ref={tilt}>
          <div className="sc-cap" aria-hidden="true">
            <span>
              {t.showcase.concept} · {t.showcase.niches[active]}
            </span>
            <span>{label}</span>
          </div>
          <div className="sc-viewport" ref={viewport}>
            <div className={`sc-stage ${narrow ? 'is-fluid' : ''}`} ref={stage} aria-hidden="true">
              {worldSet.map((W, i) => (
                <div className="sc-world" key={i} ref={(d) => void (worlds.current[i] = d!)} style={i ? { visibility: 'hidden' } : undefined}>
                  <W tx={tx} />
                </div>
              ))}
            </div>
          </div>
          <span className="sc-corner sc-corner--tl" aria-hidden="true" />
          <span className="sc-corner sc-corner--tr" aria-hidden="true" />
          <span className="sc-corner sc-corner--bl" aria-hidden="true" />
          <span className="sc-corner sc-corner--br" aria-hidden="true" />
        </div>
        <div className="sc-ctrl">
          <button type="button" onClick={() => goRef.current(active - 1)} aria-label={t.showcase.prev}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <span aria-live="polite">{t.showcase.niches[active]}</span>
          <button type="button" onClick={() => goRef.current(active + 1)} aria-label={t.showcase.next}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      <ul className="sr-only">
        {t.showcase.niches.map((n, i) => (
          <li key={i}>
            {n}: {WORLD_HEADLINES[lang][i]}
          </li>
        ))}
      </ul>
    </section>
  )
}
