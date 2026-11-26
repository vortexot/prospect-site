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
import { initScroll, lockScroll, scrollToSection } from './core/scroll'
import { LangProvider, useI18n } from './i18n'
import { About } from './sections/About'
import { Finale, Footer } from './sections/Finale'
import { Hero } from './sections/Hero'
import { Process } from './sections/Process'
import { Services } from './sections/Services'
import { Showcase } from './sections/Showcase'
import { Work } from './sections/Work'
import type { Universe } from './webgl/Universe'

function Site() {
  const { t } = useI18n()
  const canvas = useRef<HTMLCanvasElement>(null)
  const [fallback, setFallback] = useState(!glSupported)
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

  useEffect(() => {
    initScroll()
    lockScroll(true)
    if (reducedMotion) S.assemble = 1
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
  }, [boot, glSupported])

  // push the debris back while the reading-heavy sections are on screen
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: '#about',
      start: 'top 75%',
      endTrigger: '#work',
      end: 'bottom 40%',
      onToggle: (s) => gsap.to(S, { dim: s.isActive ? 1 : 0, duration: 1.4, ease: 'power2.inOut', overwrite: 'auto' }),
    })
    return () => st.kill()
  }, [])

  const reveal = () => {
    document.documentElement.classList.add('is-revealed')
    window.dispatchEvent(new Event('prospect:reveal'))
    gsap.to(S, { assemble: 1, duration: reducedMotion ? 0 : 2.8, ease: 'power3.out' })
  }
  const done = () => {
    setLoading(false)
    lockScroll(false)
    ScrollTrigger.refresh()
  }

  return (
    <>
      <a
        className="skip-link"
        href="#showcase"
        onClick={(e) => {
          e.preventDefault()
          scrollToSection('showcase')
        }}
      >
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
        <Work />
        <Process />
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
