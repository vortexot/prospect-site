import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Mark, Wordmark } from '../brand/Logo'
import { CONTENT, SHOW_PENDING } from '../content'
import { reducedMotion } from '../core/env'
import { anchor, lockScroll, scrollToSection } from '../core/scroll'
import { site, useI18n, type Lang } from '../i18n'
import { Roll } from './Roll'
import { WaLink } from './WhatsApp'

/** Menu order = page order, with the work first. */
export const SECTIONS = ['work', 'about', 'services', 'contact'] as const

export function LangToggle({ className = '' }: { className?: string }) {
  const { lang, setLang, t } = useI18n()
  return (
    <div className={`lang ${className}`} role="group" aria-label={t.nav.lang}>
      {(['pt', 'en'] as Lang[]).map((l) => (
        <button key={l} type="button" aria-pressed={lang === l} onClick={() => setLang(l)} lang={l === 'pt' ? 'pt-BR' : 'en'}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

/** E-mail and social profiles, only when the business has provided them. */
export function ContactLinks() {
  const { t } = useI18n()
  const { email, social } = CONTENT
  return (
    <>
      {email && (
        <a className="contact-link" href={`mailto:${email}`}>
          {email}
        </a>
      )}
      {social.map((s) => (
        <a className="contact-link" key={s.url} href={s.url} target="_blank" rel="noopener noreferrer">
          {s.label}
          <span className="sr-only"> ({t.external})</span>
        </a>
      ))}
      {SHOW_PENDING && !email && (
        <span className="pending">
          [{t.pending.tag}] {t.pending.email}
        </span>
      )}
      {SHOW_PENDING && !social.length && (
        <span className="pending">
          [{t.pending.tag}] {t.pending.social}
        </span>
      )}
    </>
  )
}

export function Nav() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const header = useRef<HTMLElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)
  /** closing because a link was chosen: focus goes to the section, not back to the button */
  const navigating = useRef(false)

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 120,
      end: 'max',
      onToggle: (self) => header.current?.classList.toggle('is-compact', self.isActive),
    })
    // the menu button only exists on narrow screens
    const wide = window.matchMedia('(min-width: 900px)')
    const onWide = () => wide.matches && setOpen(false)
    wide.addEventListener('change', onWide)
    return () => {
      st.kill()
      wide.removeEventListener('change', onWide)
    }
  }, [])

  useEffect(() => {
    const m = menu.current!
    const q = gsap.utils.selector(m)
    // everything covered by the menu leaves the tab order and the accessibility tree
    const behind = (inert: boolean) => document.querySelectorAll<HTMLElement>('main, .foot, .skip-link').forEach((n) => (n.inert = inert))
    if (open) {
      lockScroll(true)
      behind(true)
      m.hidden = false
      const b = button.current!.getBoundingClientRect()
      const at = `${b.left + b.width / 2}px ${b.top + b.height / 2}px`
      tl.current?.kill()
      tl.current = gsap
        .timeline()
        .fromTo(m, { clipPath: `circle(0% at ${at})` }, { clipPath: `circle(150% at ${at})`, duration: reducedMotion ? 0 : 0.9, ease: 'power4.inOut' })
        .fromTo(q('.menu-link-in'), { yPercent: 110 }, { yPercent: 0, duration: reducedMotion ? 0 : 0.9, stagger: 0.06, ease: 'expo.out' }, reducedMotion ? 0 : 0.35)
        .fromTo(q('.menu-foot > *'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06 }, reducedMotion ? 0 : 0.55)
      ;(q('.menu-link')[0] as HTMLElement)?.focus({ preventScroll: true })
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
      window.addEventListener('keydown', onKey)
      return () => {
        window.removeEventListener('keydown', onKey)
        behind(false)
        lockScroll(false)
      }
    }
    if (!m.hidden) {
      tl.current?.kill()
      tl.current = gsap.timeline({ onComplete: () => void (m.hidden = true) }).to(m, {
        clipPath: 'circle(0% at 100% 0%)',
        duration: reducedMotion ? 0 : 0.7,
        ease: 'power4.inOut',
      })
      if (!navigating.current) button.current?.focus({ preventScroll: true })
      navigating.current = false
    }
  }, [open])

  const fromMenu = (id: string) => ({
    href: `#${id}`,
    onClick: (e: React.MouseEvent) => {
      e.preventDefault()
      navigating.current = true
      setOpen(false)
      setTimeout(() => scrollToSection(id), reducedMotion ? 0 : 450)
    },
  })

  return (
    <>
      <header className="nav" ref={header}>
        <a className="nav-logo" {...anchor('top')} aria-label={t.nav.home} data-cursor="link">
          <Mark className="nav-mark" />
          <span className="nav-word-wrap">
            <Wordmark className="nav-word" />
          </span>
        </a>
        <nav className="nav-links" aria-label={t.nav.main}>
          {SECTIONS.map((id) => (
            <a key={id} {...anchor(id)}>
              <Roll text={t.nav[id]} />
            </a>
          ))}
        </nav>
        <div className="nav-right">
          <LangToggle className="nav-lang" />
          <button ref={button} className="nav-menu" type="button" aria-expanded={open} aria-controls="menu" onClick={() => setOpen((o) => !o)}>
            <span className="nav-menu-text">{open ? t.nav.close : t.nav.menu}</span>
            <span className={`nav-burger ${open ? 'is-open' : ''}`} aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </header>

      <div className="menu" id="menu" ref={menu} hidden>
        <Mark className="menu-mark" />
        <nav className="menu-nav" aria-label={t.nav.menu}>
          {SECTIONS.map((id) => (
            <a key={id} className="menu-link" {...fromMenu(id)}>
              <span className="menu-link-in">{t.nav[id]}</span>
            </a>
          ))}
        </nav>
        <div className="menu-foot">
          <div className="menu-contact">
            <WaLink placement="menu" className="text-link" label={`WhatsApp ${site.whatsappDisplay}`} />
            <ContactLinks />
          </div>
          <LangToggle />
        </div>
      </div>
    </>
  )
}
