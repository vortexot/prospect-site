import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { Pending } from '../components/Pending'
import { CONTENT } from '../content'
import { MQ } from '../core/env'
import { useI18n } from '../i18n'

/** Manifesto: words light up as the reader scrolls through them. */
export function About() {
  const { t, lang } = useI18n()
  const { team } = CONTENT
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = root.current!
    const mm = gsap.matchMedia()
    const light = (start: string, end: string, stagger: number) =>
      gsap.fromTo(
        el.querySelectorAll('.ab-w'),
        // unread words stay above 4.5:1 contrast
        { opacity: 0.52 },
        { opacity: 1, ease: 'none', stagger, scrollTrigger: { trigger: el.querySelector('.ab-text'), start, end, scrub: true } },
      )
    mm.add(MQ.immersive, () => void light('top 78%', 'bottom 52%', 0.1))
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
      <div className="ab-team">
        {team.length > 0 ? (
          <>
            <h3>{t.about.team}</h3>
            <ul>
              {team.map((p) => (
                <li key={p.name}>
                  <strong>{p.name}</strong>
                  <span>{p.role[lang]}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <Pending what={t.pending.team} />
        )}
      </div>
    </section>
  )
}
