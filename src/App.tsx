import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Mark } from './brand/Logo'
import { Cursor } from './components/Cursor'
import { Nav } from './components/Nav'
import { Preloader } from './components/Preloader'
import { glSupported, universeModule } from './core/earlyUniverse'
import { finePointer, lowPower, reducedMotion } from './core/env'
import { S } from './core/sceneState'
import { anchor, initScroll, lockScroll, scrollToSection, sectionFromHash } from './core/scroll'
import { LangProvider, useI18n } from './i18n'
import { initLiquid } from './liquid'
import { About } from './sections/About'
import { Faq } from './sections/Faq'
import { Finale, Footer } from './sections/Finale'
import { Hero } from './sections/Hero'
import { Process } from './sections/Process'
import { Services } from './sections/Services'
import { Showcase } from './sections/Showcase'
import type { Universe } from './webgl/Universe'

/** a deep link lands on its section, even though the intro is in front of the page */
function jumpToHash() {
  const id = sectionFromHash(location.hash)
  if (id) scrollToSection(id, { instant: true, push: false })
}

function Site() {
  const { t, lang } = useI18n()
  const canvas = useRef<HTMLCanvasElement>(null)
  const [fallback, setFallback] = useState(!glSupported)
  /** the intro plays on every visit */
  const [loading, setLoading] = useState(true)
  const [boot] = useState(() => {
    let resolveGl: () => void = () => {}
    const glReady = new Promise<void>((r) => (resolveGl = r))
    // only what the first screen needs: the site's own font and the 3D scene.
    // Showcase images and concept fonts load later, while the visitor reads the hero.
    return {
      resolveGl: () => resolveGl(),
      tasks: [document.fonts.load('600 1em "Archivo Variable"'), glReady],
    }
  })

  const reveal = () => {
    document.documentElement.classList.add('is-revealed')
    window.dispatchEvent(new Event('prospect:reveal'))
    gsap.to(S, { assemble: 1, duration: reducedMotion ? 0 : 2.8, ease: 'power3.out' })
  }
  /** nothing behind the intro is focusable or read aloud while it is on screen */
  const behindIntro = (inert: boolean) => document.querySelectorAll<HTMLElement>('main, .nav, .foot, .skip-link').forEach((n) => (n.inert = inert))
  const done = () => {
    setLoading(false)
    behindIntro(false)
    lockScroll(false)
    ScrollTrigger.refresh()
    jumpToHash()
  }

  // runs after every section has mounted (and built its triggers)
  useEffect(() => {
    initScroll()
    if (reducedMotion) S.assemble = 1
    lockScroll(true)
    behindIntro(true)

    window.addEventListener('hashchange', jumpToHash)

    // deep link: the destination is only known once fonts, images and pins are in place
    let cancelled = false
    if (location.hash) {
      history.scrollRestoration = 'manual'
      const loaded = new Promise<void>((r) => (document.readyState === 'complete' ? r() : window.addEventListener('load', () => r(), { once: true })))
      Promise.all([document.fonts.ready, loaded]).then(() =>
        requestAnimationFrame(() => {
          if (cancelled) return
          ScrollTrigger.refresh()
          jumpToHash()
        }),
      )
    }
    return () => {
      cancelled = true
      window.removeEventListener('hashchange', jumpToHash)
    }
    // once, on the first mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // another language means other text lengths: measure the pins again
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh())
    return () => cancelAnimationFrame(id)
  }, [lang])

  // liquid distortion on images, following the cursor (or a moving finger)
  useEffect(() => {
    if (reducedMotion || !glSupported) return
    return initLiquid()
  }, [])

  // the WebGL universe lives behind the whole page. Layout effect: it starts before
  // the sections build their scroll triggers, not after.
  useLayoutEffect(() => {
    const c = canvas.current!
    if (!glSupported || !universeModule) {
      boot.resolveGl()
      return
    }
    let u = null as Universe | null
    let cancelled = false
    // three.js arrives in its own chunk (requested by main.tsx before React renders)
    universeModule
      .then(async (mod) => {
        if (cancelled) return
        performance.mark('prospect:gl-start')
        u = new mod.Universe(c, { lowPower, reduced: reducedMotion, pointer: finePointer })
        performance.mark('prospect:gl-built')
        await u.warmup()
        performance.mark('prospect:gl-ready')
        if (!cancelled) u.start()
      })
      .catch((err) => {
        console.warn('[prospect] WebGL failed, showing the static fallback.', err)
        setFallback(true)
      })
      .finally(() => boot.resolveGl())
    const onLost = (e: Event) => {
      e.preventDefault()
      u?.stop()
      setFallback(true)
    }
    c.addEventListener('webglcontextlost', onLost)
    return () => {
      cancelled = true
      c.removeEventListener('webglcontextlost', onLost)
      u?.dispose()
    }
  }, [boot])

  // push the debris back while the reading-heavy sections are on screen
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: '#about',
      start: 'top 75%',
      endTrigger: '#process',
      end: 'top 85%',
      onToggle: (s) => gsap.to(S, { dim: s.isActive ? 1 : 0, duration: 1.4, ease: 'power2.inOut', overwrite: 'auto' }),
    })
    return () => st.kill()
  }, [])

  return (
    <>
      <a className="skip-link" {...anchor('work')}>
        {t.meta.skip}
      </a>
      <canvas ref={canvas} className={`gl ${fallback ? 'is-off' : ''}`} aria-hidden="true" />
      {fallback && (
        <div className="gl-fallback" aria-hidden="true">
          <Mark className="gl-fallback-mark" />
        </div>
      )}
      <div className="grain" aria-hidden="true" />
      <Nav />
      <main id="main">
        <Hero />
        <Showcase />
        <About />
        <Services />
        <Process />
        <Faq />
        <Finale />
      </main>
      <Footer />
      <Cursor />
      {loading && <Preloader tasks={boot.tasks} onReveal={reveal} onDone={done} />}
    </>
  )
}

export default function App() {
  return (
    <LangProvider>
      <Site />
    </LangProvider>
  )
}
