import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { clamp01, finePointer, MQ, warmImages } from '../core/env'
import { useI18n } from '../i18n'
import { Roll } from '../components/Nav'

const URL = 'https://evo-reformas.vercel.app/'
/** screenshots of the live site placed in depth; z in px, x/y in viewport units */
const PLANES = [
  { img: 'evo-1', x: 8, y: -3, z: 0, w: 50 },
  { img: 'evo-2', x: 24, y: 9, z: -950, w: 40 },
  { img: 'evo-3', x: 2, y: 4, z: -1900, w: 44 },
  { img: 'evo-mobile', x: 26, y: -2, z: -2750, w: 15 },
  { img: 'evo-4', x: 10, y: 1, z: -3600, w: 46 },
]
const TRAVEL = 3900

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
        const travel = p * TRAVEL - 250
        space.style.transform = `translate3d(0,0,${travel.toFixed(1)}px)`
        planes.forEach((pl, i) => {
          const z = PLANES[i].z + travel
          const o = clamp01((z + 3300) / 1300) * (1 - clamp01((z - 260) / 420))
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
                tabIndex={-1}
                aria-hidden="true"
                data-cursor={`label:${t.cursor.visit}`}
                style={{ ['--x' as string]: `${p.x}vw`, ['--y' as string]: `${p.y}vh`, ['--z' as string]: `${p.z}px`, ['--w' as string]: `${p.w}vw` }}
              >
                <img src={`/work/${p.img}.webp`} alt={t.work.alt[i]} loading="lazy" decoding="async" draggable={false} />
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
