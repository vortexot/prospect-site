import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { MQ } from '../core/env'
import { useI18n } from '../i18n'

const IMAGES = ['/services/websites.webp', '/showcase/clinic-2-sm.webp', '/services/systems.svg', '/showcase/arch-2-sm.webp']

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
        gsap.from(row.querySelector('.svc-desc'), { y: 40, autoAlpha: 0, duration: 0.7, ease: 'power3.out', scrollTrigger: { trigger: row, start: 'top 70%' } })
      })
    mm.add(MQ.immersive, () => rows(9))
    // phones: the same reveal, with a smaller drift so long words never leave the screen
    mm.add(MQ.touchMotion, () => rows(4))
    return () => mm.revert()
  }, [])

  return (
    <section className="svc" id="services" ref={root} tabIndex={-1} aria-labelledby="svc-title">
      <header className="svc-head">
        <h2 id="svc-title">{t.services.title}</h2>
        <p>{t.services.intro}</p>
      </header>
      {t.services.items.map((it, i) => (
        <article className={`svc-row svc-row--${i}`} key={i}>
          <figure className="svc-plate" aria-hidden="true">
            <img src={IMAGES[i]} alt="" loading="lazy" decoding="async" />
            <span className="svc-shutter" />
          </figure>
          <h3 className="svc-title" data-cursor={`lens:${IMAGES[i]}`} style={{ ['--img' as string]: `url("${IMAGES[i]}")` }}>
            {it.title.map((l, j) => (
              <span className="svc-line" key={j}>
                {l}
              </span>
            ))}
          </h3>
          <p className="svc-desc">{it.desc}</p>
        </article>
      ))}
    </section>
  )
}
