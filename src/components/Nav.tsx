import { useEffect, useRef, useState, type MouseEvent } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Mark, Wordmark } from '../brand/Logo'
import { reducedMotion } from '../core/env'
import { lockScroll, scrollToSection } from '../core/scroll'
import { site, useI18n, type Lang } from '../i18n'

export const SECTIONS = ['work', 'services', 'about', 'contact'] as const

export function Roll({ text }: { text: string }) {
  return (
    <span className="roll" data-text={text}>
      <span>{text}</span>
    </span>
  )
}

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

export function Nav() {
  const { t, wa } = useI18n()
  const [open, setOpen] = useState(false)
  const header = useRef<HTMLElement>(null)
  const menu = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const tl = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 120,
      end: 'max',
      onToggle: (self) => header.current?.classList.toggle('is-compact', self.isActive),
    })
    return () => st.kill()
  }, [])

  useEffect(() => {
    const m = menu.current!
    const q = gsap.utils.selector(m)
    if (open) {
      lockScroll(true)
      m.hidden = false
      const b = button.current!.getBoundingClientRect()
      const at = `${b.left + b.width / 2}px ${b.top + b.height / 2}px`
      tl.current?.kill()
      tl.current = gsap
        .timeline()
        .fromTo(m, { clipPath: `circle(0% at ${at})` }, { clipPath: `circle(150% at ${at})`, duration: reducedMotion ? 0 : 0.9, ease: 'power4.inOut' })
        .fromTo(q('.menu-link-in'), { yPercent: 110 }, { yPercent: 0, duration: reducedMotion ? 0 : 0.9, stagger: 0.06, ease: 'expo.out' }, reducedMotion ? 0 : 0.35)
        .fromTo(q('.menu-foot > *'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.06 }, reducedMotion ? 0 : 0.55)
      ;(q('.menu-link')[0] as HTMLElement)?.focus({ preventScroll: true })
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') setOpen(false)
        if (e.key !== 'Tab') return
        const items = [button.current!, ...(q('a, button') as HTMLElement[])]
        const i = items.indexOf(document.activeElement as HTMLElement)
        const next = e.shiftKey ? (i <= 0 ? items.length - 1 : i - 1) : i === items.length - 1 ? 0 : i + 1
        items[next].focus()
        e.preventDefault()
      }
      window.addEventListener('keydown', onKey)
      return () => window.removeEventListener('keydown', onKey)
    }
    if (!m.hidden) {
      tl.current?.kill()
      tl.current = gsap.timeline({ onComplete: () => void (m.hidden = true) }).to(m, {
        clipPath: 'circle(0% at 100% 0%)',
        duration: reducedMotion ? 0 : 0.7,
        ease: 'power4.inOut',
      })
      lockScroll(false)
      button.current?.focus({ preventScroll: true })
    }
  }, [open])

  const go = (id: string) => (e: MouseEvent) => {
    e.preventDefault()
    if (open) {
      setOpen(false)
      setTimeout(() => scrollToSection(id), reducedMotion ? 0 : 450)
    } else scrollToSection(id)
  }

  return (
    <>
      <header className="nav" ref={header}>
        <a className="nav-logo" href="#top" onClick={go('top')} aria-label={t.nav.home} data-cursor="link">
          <Mark className="nav-mark" />
          <span className="nav-word-wrap">
            <Wordmark className="nav-word" />
          </span>
        </a>
        <nav className="nav-links" aria-label="Principal">
          {SECTIONS.map((id) => (
            <a key={id} href={`#${id}`} onClick={go(id)}>
              <Roll text={t.nav[id]} />
            </a>
          ))}
        </nav>
        <div className="nav-right">
          <LangToggle className="nav-lang" />
          <button ref={button} className="nav-menu" type="button" aria-expanded={open} aria-controls="menu" onClick={() => setOpen((o) => !o)} data-magnetic="0.25">
            <span className="nav-menu-text">{open ? t.nav.close : t.nav.menu}</span>
            <span className={`nav-burger ${open ? 'is-open' : ''}`} aria-hidden="true">
              <i />
              <i />
            </span>
          </button>
        </div>
      </header>

      <div className="menu" id="menu" ref={menu} hidden aria-label={t.nav.menu}>
        <Mark className="menu-mark" />
        <nav className="menu-nav" aria-label={t.nav.menu}>
          {SECTIONS.map((id) => (
            <a key={id} className="menu-link" href={`#${id}`} onClick={go(id)}>
              <span className="menu-link-in">{t.nav[id]}</span>
            </a>
          ))}
        </nav>
        <div className="menu-foot">
          <a href={wa} target="_blank" rel="noopener noreferrer">
            WhatsApp {site.whatsappDisplay}
            <span className="sr-only"> ({t.external})</span>
          </a>
          <LangToggle />
        </div>
      </div>
    </>
  )
}
