import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { clamp01, easeInOut, finePointer, lerp, MQ, warmImages } from '../core/env'
import { useI18n } from '../i18n'
import { Roll } from '../components/Nav'

const URL = 'https://evo-reformas.vercel.app/'
/** screenshots of the live site placed in depth; z in px, x/y/w in viewport units (m* = phone) */
const PLANES = [
  { img: 'evo-1', x: 15, y: 2, z: 0, w: 'min(56vw, 96svh)', mx: 0, my: -14, mw: 'min(94vw, 62svh)' },
  { img: 'evo-2', x: 15, y: 2, z: -950, w: 'min(56vw, 96svh)', mx: 0, my: -14, mw: 'min(94vw, 62svh)' },
  { img: 'evo-3', x: 15, y: 2, z: -1900, w: 'min(56vw, 96svh)', mx: 0, my: -14, mw: 'min(94vw, 62svh)' },
  { img: 'evo-mobile', x: 15, y: 1, z: -2750, w: 'min(17.5vw, 30svh)', mx: 0, my: -14, mw: 'min(52vw, 22svh)' },
  { img: 'evo-4', x: 17, y: -10, z: -3600, w: 'min(42vw, 58svh)', mx: 0, my: -3, mw: 'min(88vw, 44svh)' },
]

/** Camera distance for a scroll position: it rests on each screenshot, then flies to the next. */
function travelAt(p: number) {
  const u = clamp01((p - 0.02) / 0.9) * (PLANES.length - 1)
  const k = Math.min(Math.floor(u), PLANES.length - 2)
  const f = easeInOut(clamp01((u - k - 0.25) / 0.5))
  return lerp(-PLANES[k].z, -PLANES[k + 1].z, f)
}

export function Work() {
  const { t, wa } = useI18n()
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = root.current!
    const mm = gsap.matchMedia()
    const warm = ScrollTrigger.create({ trigger: el, start: 'top 250%', once: true, onEnter: () => warmImages(el) })
    mm.add(MQ.immersive, () => {
      const space = el.querySelector<HTMLElement>('.work-space')!
      const tiltEl = el.querySelector<HTMLElement>('.work-tilt')!
      const planes = gsap.utils.toArray<HTMLElement>('.work-plane', el)
      const next = el.querySelector<HTMLElement>('.work-next')!
      const place = (p: number) => {
        const travel = travelAt(p)
        space.style.transform = `translate3d(0,0,${travel.toFixed(1)}px)`
        planes.forEach((pl, i) => {
          const z = PLANES[i].z + travel
          // one screenshot is clear at a time: the next fades up as the current one leaves
          const o = clamp01((z + 850) / 500) * (1 - clamp01((z - 30) / 260))
          pl.style.opacity = o.toFixed(3)
          pl.style.visibility = o < 0.01 ? 'hidden' : 'visible'
        })
        const n = clamp01((p - 0.86) / 0.12)
        next.style.opacity = n.toFixed(3)
        next.style.transform = `translateY(${((1 - n) * 30).toFixed(1)}px)`
        next.style.pointerEvents = n > 0.5 ? 'auto' : 'none'
      }
      place(0)
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: () => `+=${window.innerHeight * 2.6}`,
        pin: true,
        anticipatePin: 1,
        onUpdate: (s) => place(s.progress),
      })
      const rx = gsap.quickTo(tiltEl, 'rotationX', { duration: 1, ease: 'power3.out' })
      const ry = gsap.quickTo(tiltEl, 'rotationY', { duration: 1, ease: 'power3.out' })
      const onMove = (e: PointerEvent) => {
        if (!finePointer) return
        ry((e.clientX / innerWidth - 0.5) * 9)
        rx(-(e.clientY / innerHeight - 0.5) * 6)
      }
      el.addEventListener('pointermove', onMove)
      gsap.from(el.querySelectorAll('.work-info > *'), { y: 30, autoAlpha: 0, duration: 0.8, stagger: 0.07, ease: 'power3.out', scrollTrigger: { trigger: el, start: 'top 60%' } })
      return () => {
        st.kill()
        el.removeEventListener('pointermove', onMove)
        ;[space, next, ...planes].forEach((n) => n.removeAttribute('style'))
        gsap.set(tiltEl, { clearProps: 'all' })
      }
    })
    return () => {
      warm.kill()
      mm.revert()
    }
  }, [])

  return (
    <section className="work" id="work" ref={root} tabIndex={-1} aria-labelledby="work-title">
      <div className="work-stage">
        <div className="work-tilt">
          <div className="work-space">
            {PLANES.map((p, i) => (
              <a
                key={p.img}
                className={`work-plane work-plane--${i}`}
                href={URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  ['--x' as string]: `${p.x}vw`,
                  ['--y' as string]: `${p.y}vh`,
                  ['--z' as string]: `${p.z}px`,
                  ['--w' as string]: p.w,
                  ['--mx' as string]: `${p.mx}vw`,
                  ['--my' as string]: `${p.my}svh`,
                  ['--mw' as string]: p.mw,
                }}
              >
                <img src={`/work/${p.img}.webp`} alt={t.work.alt[i]} loading="lazy" decoding="async" draggable={false} data-liquid="" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="work-info">
        <h2 className="work-kicker" id="work-title">
          {t.work.title}
        </h2>
        <p className="work-live">
          <i aria-hidden="true" />
          {t.work.live} — evo-reformas.vercel.app
        </p>
        <h3 className="work-name">{t.work.name}</h3>
        <p className="work-kind">{t.work.kind}</p>
        <p className="work-scope">{t.work.scope}</p>
        <a className="btn btn--solid" href={URL} target="_blank" rel="noopener noreferrer" data-magnetic="0.3">
          <Roll text={t.work.visit} />
          <span className="sr-only"> ({t.external})</span>
        </a>
      </div>

      <div className="work-next">
        <p>{t.work.next}</p>
        <a className="btn btn--line" href={wa} target="_blank" rel="noopener noreferrer" data-magnetic="0.3">
          <Roll text={t.work.cta} />
          <span className="sr-only"> (WhatsApp, {t.external})</span>
        </a>
      </div>
    </section>
  )
}
