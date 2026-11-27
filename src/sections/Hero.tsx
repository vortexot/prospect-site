import { Fragment, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { finePointer, isNarrow, MQ, reducedMotion } from '../core/env'
import { S, toBox } from '../core/sceneState'
import { anchor, scrollToY } from '../core/scroll'
import { useI18n } from '../i18n'
import { Roll } from '../components/Roll'
import { WaLink } from '../components/WhatsApp'

/** Splits a line into words (kept together) and characters (animated individually). */
function SplitLine({ text }: { text: string }) {
  return (
    <>
      {text.split(' ').map((w, wi, all) => (
        <Fragment key={wi}>
          <span className="h-w">
            {[...w].map((c, ci) => (
              <span className="h-ch" key={ci}>
                {c}
              </span>
            ))}
          </span>
          {wi < all.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </>
  )
}

export function Hero() {
  const { t, lang } = useI18n()
  const root = useRef<HTMLElement>(null)

  // entrance + scroll-out
  useEffect(() => {
    const el = root.current!
    const ctx = gsap.context(() => {
      if (!document.documentElement.classList.contains('is-revealed')) {
        gsap.set('.h-line-in', { yPercent: 118 })
        // opacity only (never visibility): the buttons stay reachable by keyboard
        gsap.set(['.hero-label', '.hero-side > *', '.hero-foot'], { opacity: 0, y: 22 })
      }
      const mm = gsap.matchMedia()
      mm.add(MQ.immersive, () => {
        const tl = gsap
          .timeline({ scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true } })
          .to('.hero-title', { yPercent: -38, ease: 'none' }, 0)
          .to('.hero-title', { opacity: 0, ease: 'power1.in' }, 0.15)
          .to('.hero-label', { y: -60, opacity: 0, ease: 'none' }, 0)
        // whatever would scroll across the 3D tower fades out before it gets there
        tl.to('.hero-foot', { opacity: 0, duration: 0.08, ease: 'none' }, 0)
        if (isNarrow()) tl.to('.hero-side', { opacity: 0, duration: 0.09, ease: 'none' }, 0)
        else tl.to('.hero-side', { y: -90, opacity: 0, ease: 'none' }, 0)
      })
      // the tower starts breaking apart as the visitor leaves the first screen
      ScrollTrigger.create({ trigger: el, start: 'top top', end: 'bottom top', onUpdate: (s) => (S.explode = s.progress * 0.45) })
    }, el)

    const reveal = () =>
      ctx.add(() => {
        const chars = gsap.utils.toArray<HTMLElement>('.h-ch', el)
        gsap
          .timeline({ defaults: { ease: 'expo.out' } })
          .to('.h-line-in', { yPercent: 0, duration: reducedMotion ? 0 : 1.5, stagger: 0.11 })
          .fromTo(chars, { '--wd': 62 }, { '--wd': 100, duration: reducedMotion ? 0 : 1.8, stagger: { each: 0.014 }, ease: 'power3.out' }, 0)
          .to('.hero-label', { opacity: 1, y: 0, duration: 0.9 }, 0.25)
          .to('.hero-side > *', { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.55)
          .to('.hero-foot', { opacity: 1, y: 0, duration: 0.9 }, 0.9)
      })
    if (document.documentElement.classList.contains('is-revealed')) reveal()
    else window.addEventListener('prospect:reveal', reveal, { once: true })
    return () => {
      window.removeEventListener('prospect:reveal', reveal)
      ctx.revert()
    }
  }, [])

  // tell the 3D scene where the empty space is, so the tower never sits behind text
  useEffect(() => {
    const el = root.current!
    const measure = () => {
      if (window.scrollY > 24) return // the title is mid scroll-out: keep the last box
      const base = el.getBoundingClientRect().top
      const title = el.querySelector<HTMLElement>('.hero-title')!.getBoundingClientRect()
      const side = el.querySelector<HTMLElement>('.hero-side')!.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight
      if (vw >= 900) {
        // desktop: the column right of the text
        const textRight = Math.max(side.right, ...[...el.querySelectorAll('.h-w')].map((w) => w.getBoundingClientRect().right))
        S.heroBox = toBox(textRight + 32, 112, vw - 24, vh - 52)
      } else {
        // phone: the band between the headline and the supporting text
        S.heroBox = toBox(0, title.bottom - base + 4, vw, side.top - base - 4)
      }
      // very narrow screens leave little free room: dim the sculpture so the title reads
      S.faint = vw < 380 ? 1 : 0
    }
    const ro = new ResizeObserver(measure)
    el.querySelectorAll('.hero-title, .hero-side').forEach((n) => ro.observe(n))
    window.addEventListener('resize', measure)
    // arriving by a deep link, the first measurement happens when the top comes into view
    window.addEventListener('scroll', measure, { passive: true })
    document.fonts.ready.then(measure)
    // the headline settles (width animation) a moment after the reveal
    const later = [600, 2200, 4200].map((ms) => window.setTimeout(measure, ms))
    window.addEventListener('prospect:reveal', () => later.push(window.setTimeout(measure, 2100)), { once: true })
    measure()
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure)
      later.forEach(clearTimeout)
    }
  }, [lang])

  // the buttons fade out as the page scrolls: focusing one brings them back into view
  useEffect(() => {
    const side = root.current!.querySelector<HTMLElement>('.hero-side')!
    const onFocus = () => {
      if (window.scrollY > 24) requestAnimationFrame(() => scrollToY(0, 0, true))
    }
    side.addEventListener('focusin', onFocus)
    return () => side.removeEventListener('focusin', onFocus)
  }, [])

  // characters lean away from the cursor (width + lift), with their own easing
  useEffect(() => {
    if (!finePointer || reducedMotion) return
    const el = root.current!
    const chars = gsap.utils.toArray<HTMLElement>('.h-ch', el)
    const near = chars.map(() => 0)
    const target = chars.map(() => 0)
    let mx = -9999
    let my = -9999
    let raf = 0
    const loop = () => {
      raf = 0
      let moving = false
      const rects = chars.map((c) => c.getBoundingClientRect())
      rects.forEach((r, i) => {
        const dx = mx - (r.left + r.width / 2)
        const dy = my - (r.top + r.height / 2)
        target[i] = Math.max(0, 1 - Math.hypot(dx, dy * 1.3) / 170)
      })
      chars.forEach((c, i) => {
        const v = near[i] + (target[i] - near[i]) * 0.14
        if (Math.abs(v - near[i]) > 0.001) moving = true
        near[i] = v
        c.style.setProperty('--near', v.toFixed(3))
      })
      if (moving) raf = requestAnimationFrame(loop)
    }
    const onMove = (e: PointerEvent) => {
      mx = e.clientX
      my = e.clientY
      if (!raf) raf = requestAnimationFrame(loop)
    }
    const onLeave = () => {
      mx = my = -9999
      if (!raf) raf = requestAnimationFrame(loop)
    }
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [lang])

  // drag to spin the tower, with inertia on release. Works with mouse and finger.
  useEffect(() => {
    const el = root.current!
    let down = false
    let lastX = 0
    let vel = 0
    let lastT = 0
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('a, button')) return
      down = true
      lastX = e.clientX
      lastT = performance.now()
      vel = 0
      gsap.killTweensOf(S, 'spin')
      el.classList.add('is-dragging')
    }
    const onMove = (e: PointerEvent) => {
      if (!down) return
      const now = performance.now()
      const dx = e.clientX - lastX
      S.spin += dx * 0.0065
      vel = (dx * 0.0065) / Math.max(1, now - lastT)
      lastX = e.clientX
      lastT = now
    }
    const onUp = () => {
      if (!down) return
      down = false
      el.classList.remove('is-dragging')
      if (!reducedMotion) gsap.to(S, { spin: S.spin + vel * 520, duration: 1.8, ease: 'power3.out' })
    }
    el.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [])

  return (
    <section className="hero" id="top" ref={root} tabIndex={-1} aria-labelledby="hero-title" data-cursor={`label:${t.cursor.drag}`}>
      <p className="hero-label" data-cursor="">
        {t.hero.label}
      </p>
      <h1 className="hero-title" id="hero-title" data-cursor="">
        {t.hero.title.map((line, i) => (
          <Fragment key={i}>
            <span className="h-line">
              <span className="h-line-in">
                <SplitLine text={line} />
              </span>
            </span>{' '}
          </Fragment>
        ))}
      </h1>
      <div className="hero-side">
        <p className="hero-sub" data-cursor="">
          {t.hero.sub}
        </p>
        <div className="hero-ctas">
          <WaLink placement="hero" label={t.hero.start} magnetic={0.3} />
          <a className="btn btn--line" {...anchor('work')} data-magnetic="0.3">
            <Roll text={t.hero.explore} />
          </a>
        </div>
      </div>
      <div className="hero-foot" aria-hidden="true">
        <span className="hero-scroll">
          <i />
          {t.hero.scroll}
        </span>
        {finePointer && <span className="hero-hint">{t.hero.hint}</span>}
      </div>
    </section>
  )
}
