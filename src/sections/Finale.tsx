import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Lockup } from '../brand/Logo'
import { MQ, reducedMotion } from '../core/env'
import { S } from '../core/sceneState'
import { scrollToSection } from '../core/scroll'
import { site, useI18n } from '../i18n'
import { LangToggle, Roll, SECTIONS } from '../components/Nav'

export function Finale() {
  const { t, wa } = useI18n()
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = root.current!
    const mm = gsap.matchMedia()
    mm.add(MQ.immersive, () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top top', end: () => `+=${window.innerHeight * 1.7}`, pin: true, scrub: true, anticipatePin: 1 },
      })
      tl.to(S, { converge: 1, duration: 1, ease: 'none' }, 0)
        .fromTo('.fin-in', { yPercent: 115, '--fw': 62 }, { yPercent: 0, '--fw': 100, duration: 0.32, stagger: 0.07, ease: 'power3.out' }, 0.62)
        .fromTo(['.fin-sub', '.fin-cta'], { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.2, stagger: 0.05 }, 0.82)
        .to({}, { duration: 0.15 })
      return () => {
        S.converge = 0
      }
    }, el)
    mm.add(MQ.compact, () => {
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top 70%',
        end: 'max',
        onToggle: (s) => gsap.to(S, { converge: s.isActive ? 1 : 0, duration: reducedMotion ? 0 : 1.6, ease: 'power2.inOut', overwrite: 'auto' }),
      })
      return () => st.kill()
    })
    // the footer line grows out of the final point
    const line = ScrollTrigger.create({
      trigger: '.foot',
      start: 'top bottom',
      end: 'top 55%',
      onUpdate: (s) => document.querySelector<HTMLElement>('.foot-line')?.style.setProperty('--line', s.progress.toFixed(3)),
    })
    return () => {
      mm.revert()
      line.kill()
    }
  }, [])

  return (
    <section className="fin" id="contact" ref={root} tabIndex={-1} aria-labelledby="fin-title">
        <h2 className="fin-title" id="fin-title">
          {t.finale.title.map((l, i) => (
            <span className="fin-line" key={i}>
              <span className="fin-in">{l}</span>{' '}
            </span>
          ))}
        </h2>
        <p className="fin-sub">{t.finale.sub}</p>
        <a className="fin-cta btn btn--solid btn--big" href={wa} target="_blank" rel="noopener noreferrer" data-magnetic="0.35">
          <Roll text={t.finale.cta} />
          <span className="sr-only"> (WhatsApp, {t.external})</span>
        </a>
    </section>
  )
}

export function Footer() {
  const { t, wa } = useI18n()
  return (
      <footer className="foot">
        <span className="foot-line" aria-hidden="true" />
        <div className="foot-grid">
          <div className="foot-brand">
            <p>{t.footer.tagline}</p>
          </div>
          <div>
            <h2 className="foot-h">{t.footer.contact}</h2>
            <a className="foot-wa" href={wa} target="_blank" rel="noopener noreferrer">
              <Roll text={`${t.footer.whatsapp} ${site.whatsappDisplay}`} />
              <span className="sr-only"> ({t.external})</span>
            </a>
          </div>
          <nav aria-label={t.footer.explore}>
            <h2 className="foot-h">{t.footer.explore}</h2>
            <ul>
              {SECTIONS.map((id) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    onClick={(e) => {
                      e.preventDefault()
                      scrollToSection(id)
                    }}
                  >
                    <Roll text={t.nav[id]} />
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h2 className="foot-h">{t.nav.lang}</h2>
            <LangToggle />
          </div>
        </div>
        <Lockup className="foot-logo" />
        <div className="foot-bottom">
          <span>© 2026 Prospect. {t.footer.rights}</span>
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault()
              scrollToSection('top')
            }}
          >
            <Roll text={t.footer.top} />
          </a>
        </div>
      </footer>
  )
}
