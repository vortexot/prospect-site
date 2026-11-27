import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Lockup } from '../brand/Logo'
import { ContactLinks, LangToggle, SECTIONS } from '../components/Nav'
import { Roll } from '../components/Roll'
import { WaLink } from '../components/WhatsApp'
import { MQ, reducedMotion } from '../core/env'
import { S } from '../core/sceneState'
import { anchor } from '../core/scroll'
import { site, useI18n } from '../i18n'

/** how long the finale holds the screen, in viewport heights */
const PIN_VH = 1.1

/**
 * The closing call. The section holds the screen while the structure collapses into one
 * point. Title and button are visible from the first moment: they only move and widen.
 */
export function Finale() {
  const { t } = useI18n()
  const root = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = root.current!
    // the structure darkens as the section arrives, so the title reads over it
    const veil = ScrollTrigger.create({
      trigger: el,
      start: 'top bottom',
      end: 'top top',
      onUpdate: (s) => (S.cover = s.progress),
      onRefresh: (s) => (S.cover = s.progress),
    })
    const mm = gsap.matchMedia()
    mm.add(MQ.immersive, () => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: 'top top', end: () => `+=${window.innerHeight * PIN_VH}`, pin: true, scrub: true, anticipatePin: 1 },
      })
      // position and width only: nothing here is ever hidden
      tl.to(S, { converge: 1, duration: 0.55, ease: 'none' }, 0)
        .fromTo(el.querySelectorAll('.fin-in'), { '--fw': 80 }, { '--fw': 100, duration: 0.7, stagger: 0.08, ease: 'power2.out' }, 0)
        .fromTo(el.querySelectorAll('.fin-sub, .fin-cta'), { y: 26 }, { y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' }, 0.3)
        .to({}, { duration: 0.14 })
      return () => {
        S.converge = 0
      }
    }, el)
    // reduced motion: no scrubbing, the collapse simply settles once the section is reached
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
      veil.kill()
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
      <WaLink placement="finale" label={t.finale.cta} className="fin-cta btn btn--solid btn--big" magnetic={0.35} />
    </section>
  )
}

export function Footer() {
  const { t, lang } = useI18n()
  return (
    <footer className="foot">
      <span className="foot-line" aria-hidden="true" />
      <div className="foot-grid">
        <div className="foot-brand">
          <p>{t.footer.tagline}</p>
        </div>
        <div className="foot-contact">
          <h2 className="foot-h">{t.footer.contact}</h2>
          <WaLink placement="footer" className="text-link" label={`WhatsApp ${site.whatsappDisplay}`} />
          <ContactLinks />
        </div>
        <nav aria-label={t.footer.explore}>
          <h2 className="foot-h">{t.footer.explore}</h2>
          <ul>
            {SECTIONS.map((id) => (
              <li key={id}>
                <a {...anchor(id)}>
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
        <a href={lang === 'en' ? '/privacidade#english' : '/privacidade'}>
          <Roll text={t.footer.privacy} />
        </a>
        <a {...anchor('top')}>
          <Roll text={t.footer.top} />
        </a>
      </div>
    </footer>
  )
}
