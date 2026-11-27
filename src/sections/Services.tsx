import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Pending } from '../components/Pending'
import { isNarrow, MQ } from '../core/env'
import { useI18n } from '../i18n'

/** One photograph per service (sources in the README) and the row composition it sits in. */
const IMAGES = [
  { name: 'sites', layout: 0 },
  { name: 'landing', layout: 1 },
  { name: 'systems', layout: 2 },
  { name: 'identity', layout: 0 },
  { name: 'marketing', layout: 2 },
  { name: 'ads', layout: 0 },
  { name: 'solutions', layout: 2 },
]

export function Services() {
  const { t } = useI18n()
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = root.current!
    const mm = gsap.matchMedia()
    const rows = (drift: number) =>
      gsap.utils.toArray<HTMLElement>('.svc-row', el).forEach((row, i) => {
        const dir = i % 2 ? -1 : 1
        // words travel through the row; alternate rows travel in opposite directions
        gsap.fromTo(
          row.querySelectorAll('.svc-line'),
          { xPercent: dir * drift },
          { xPercent: -dir * drift * 0.78, ease: 'none', stagger: 0.04, scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true } },
        )
        // the typeface narrows → widens once as the row arrives (a one-off tween, not
        // per scroll frame: re-laying out giant variable text every frame is costly)
        gsap.fromTo(row.querySelector('.svc-title'), { '--w': 62 }, { '--w': 100, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: row, start: 'top 75%', toggleActions: 'play none none reverse' } })
        // image revealed by a shutter that slides away: transform only, stays on the GPU
        const plate = row.querySelector<HTMLElement>('.svc-plate')!
        gsap.fromTo(plate.querySelector('.svc-shutter'), { scaleY: 1 }, { scaleY: 0, ease: 'none', scrollTrigger: { trigger: row, start: 'top 88%', end: 'top 30%', scrub: true } })
        gsap.fromTo(plate.querySelector('img'), { yPercent: -8, scale: 1.18 }, { yPercent: 8, scale: 1.18, ease: 'none', scrollTrigger: { trigger: row, start: 'top bottom', end: 'bottom top', scrub: true } })
        // the text slides into place without ever being hidden
        gsap.from(row.querySelector('.svc-info'), { y: 40, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: row, start: 'top 70%' } })
      })
    // small drift: the words move, but never leave the screen
    mm.add(MQ.immersive, () => rows(isNarrow() ? 2 : 2.5))
    return () => mm.revert()
  }, [])

  return (
    <section className="svc" id="services" ref={root} tabIndex={-1} aria-labelledby="svc-title">
      <header className="svc-head">
        <h2 id="svc-title">{t.services.title}</h2>
        <p>{t.services.intro}</p>
      </header>
      {t.services.items.map((it, i) => {
        // very long words get a smaller size so they never leave a narrow screen
        const long = it.title.some((word) => word.length > 8)
        const img = IMAGES[i]
        return (
          <article className={`svc-row svc-row--${img.layout} ${long ? 'svc-row--long' : ''}`} key={i}>
            <figure className="svc-plate" aria-hidden="true">
              <img
                src={`/services/${img.name}.webp`}
                srcSet={`/services/${img.name}-sm.webp 800w, /services/${img.name}.webp 1600w`}
                sizes="(min-width: 900px) 66vw, 100vw"
                width={1600}
                height={1000}
                alt=""
                loading="lazy"
                decoding="async"
                data-liquid=""
              />
              <span className="svc-shutter" />
            </figure>
            <h3 className="svc-title">
              {it.title.map((l, j) => (
                <span className="svc-line" key={j}>
                  {l}{' '}
                </span>
              ))}
            </h3>
            <div className="svc-info">
              <p className="svc-desc">{it.desc}</p>
              {it.deliverables.length > 0 ? (
                <>
                  <h4>{t.services.deliverables}</h4>
                  <ul>
                    {it.deliverables.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <Pending what={t.pending.deliverables} />
              )}
            </div>
          </article>
        )
      })}
    </section>
  )
}
