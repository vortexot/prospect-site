import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { MQ } from '../core/env'
import { useI18n } from '../i18n'

/** Manifesto: words light up as the reader scrolls through them. */
export function About() {
  const { t, lang } = useI18n()
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = root.current!
    const mm = gsap.matchMedia()
    mm.add(MQ.immersive, () => {
      gsap.fromTo(
        el.querySelectorAll('.ab-w'),
        { opacity: 0.14 },
        { opacity: 1, ease: 'none', stagger: 0.1, scrollTrigger: { trigger: el.querySelector('.ab-text'), start: 'top 78%', end: 'bottom 52%', scrub: true } },
      )
    })
    return () => mm.revert()
  }, [lang])

  return (
    <section className="ab" id="about" ref={root} tabIndex={-1} aria-labelledby="ab-title">
      <h2 className="ab-title" id="ab-title">
        {t.about.title}
      </h2>
      <p className="ab-text">
        {t.about.text.split(' ').map((w, i) => (
          <span className="ab-w" key={`${lang}-${i}`}>
            {w}{' '}
          </span>
        ))}
      </p>
    </section>
  )
}
