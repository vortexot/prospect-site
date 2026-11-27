import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { clamp01, MQ } from '../core/env'
import { S, toBox } from '../core/sceneState'
import { useI18n } from '../i18n'

/** how long the section holds the screen, in viewport heights */
const PIN_VH = 2.4

/**
 * One structure, four states. With motion, the section holds the screen while the
 * scroll moves through the steps, and the four step names stay readable the whole
 * time. With reduced motion, the four steps are simply listed.
 */
export function Process() {
  const { t } = useI18n()
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)

  // tell the 3D scene where the empty space is
  useEffect(() => {
    const el = root.current!
    const q = (s: string) => el.querySelector<HTMLElement>(s)!
    const still = window.matchMedia(MQ.compact)
    const measure = () => {
      const vw = window.innerWidth
      const vh = window.innerHeight
      if (still.matches) {
        const r = q('.proc-stage').getBoundingClientRect()
        S.procBox = toBox(r.left, r.top, r.right, r.bottom)
        return
      }
      // once the section has scrolled past, the structure leaves with it (the pages that
      // follow are read in the clear) and comes back for its collapse once the finale
      // fills the screen
      const finale = document.getElementById('contact')!.getBoundingClientRect().top
      const lift = finale < vh * 0.2 ? 0 : Math.min(0, el.getBoundingClientRect().top)
      // offsets ignore the steps' entrance transforms
      const steps = q('.proc-steps')
      if (vw >= 900) {
        const textRight = q('.proc-inner').offsetLeft + steps.offsetLeft + steps.offsetWidth
        const trackTop = q('.proc-track').offsetTop
        S.procBox = toBox(textRight + 32, 100 + lift, vw - 24, (trackTop || vh) - 34 + lift)
      } else {
        const items = [...el.querySelectorAll<HTMLElement>('.proc-step')]
        const textTop = steps.offsetTop + Math.min(...items.map((s) => s.offsetTop))
        const title = q('.proc-title')
        S.procBox = toBox(0, title.offsetTop + title.offsetHeight + 4 + lift, vw, textTop - 8 + lift)
      }
    }
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    el.querySelectorAll('.proc-step').forEach((s) => ro.observe(s))
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, { passive: true })
    document.fonts.ready.then(measure)
    measure()
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure)
    }
  }, [t])

  useEffect(() => {
    const el = root.current!
    const setIdx = (i: number) => {
      if (i === activeRef.current) return
      activeRef.current = i
      setActive(i)
    }
    // the structure leaves the debris field and comes to this section
    const mix = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      end: 'top 10%',
      onUpdate: (s) => (S.processMix = s.progress),
      onRefresh: (s) => (S.processMix = s.progress),
    })
    const mm = gsap.matchMedia()
    mm.add(MQ.immersive, () => {
      const bar = el.querySelector<HTMLElement>('.proc-bar i')!
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: () => `+=${window.innerHeight * PIN_VH}`,
        pin: true,
        anticipatePin: 1,
        onUpdate: (s) => {
          const stage = clamp01(s.progress * 1.15 - 0.03) * 3
          S.stage = stage
          setIdx(Math.round(stage))
          bar.style.transform = `scaleX(${s.progress.toFixed(4)})`
        },
      })
      return () => {
        st.kill()
        bar.removeAttribute('style')
      }
    })
    // reduced motion: the finished structure, no state changes
    mm.add(MQ.compact, () => {
      S.stage = 3
    })
    return () => {
      mix.kill()
      mm.revert()
    }
  }, [])

  return (
    <section className="proc" id="process" ref={root} tabIndex={-1} aria-labelledby="proc-title">
      <div className="proc-inner">
        <h2 className="proc-title" id="proc-title">
          {t.process.title}
        </h2>
        <div className="proc-stage" aria-hidden="true" />
        <ol className="proc-steps">
          {t.process.steps.map((s, i) => (
            <li className={`proc-step ${i === active ? 'is-active' : ''}`} key={i}>
              <span className="proc-num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="proc-name">{s.name}</h3>
              <p className="proc-desc">{s.desc}</p>
            </li>
          ))}
        </ol>
        {/* repeats the step names for the eyes only: the list above already holds them */}
        <div className="proc-track" aria-hidden="true">
          <div className="proc-bar">
            <i />
          </div>
          <ol>
            {t.process.steps.map((s, i) => (
              <li key={i} className={i <= active ? 'is-on' : ''}>
                {s.name}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
