import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { clamp01, MQ, reducedMotion } from '../core/env'
import { S, toBox } from '../core/sceneState'
import { useI18n } from '../i18n'

/** One structure, four states: fragments → geometry → construction → light. */
export function Process() {
  const { t } = useI18n()
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const activeRef = useRef(0)

  // tell the 3D scene where the empty space is (offsets ignore the steps' entrance transforms)
  useEffect(() => {
    const el = root.current!
    const measure = () => {
      const q = (s: string) => el.querySelector<HTMLElement>(s)!
      const steps = q('.proc-steps')
      const items = [...el.querySelectorAll<HTMLElement>('.proc-step')]
      const vw = window.innerWidth
      const vh = window.innerHeight
      if (vw >= 900) {
        const textRight = q('.proc-inner').offsetLeft + steps.offsetLeft + steps.offsetWidth
        const trackTop = q('.proc-track').offsetTop
        S.procBox = toBox(textRight + 32, 76, vw - 24, (trackTop || vh) - 12)
      } else {
        const textTop = steps.offsetTop + Math.min(...items.map((s) => s.offsetTop))
        S.procBox = toBox(0, q('.proc-title').offsetTop + q('.proc-title').offsetHeight + 4, vw, textTop - 8)
      }
    }
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    el.querySelectorAll('.proc-step').forEach((s) => ro.observe(s))
    window.addEventListener('resize', measure)
    document.fonts.ready.then(measure)
    measure()
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measure)
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
    })
    const mm = gsap.matchMedia()
    mm.add(MQ.immersive, () => {
      const bar = el.querySelector<HTMLElement>('.proc-bar i')!
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: () => `+=${window.innerHeight * 2.4}`,
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
    mm.add(MQ.compact, () => {
      const triggers = gsap.utils.toArray<HTMLElement>('.proc-step', el).map((step, i) =>
        ScrollTrigger.create({
          trigger: step,
          start: 'top 65%',
          end: 'bottom 35%',
          onToggle: (s) => {
            if (!s.isActive) return
            setIdx(i)
            gsap.to(S, { stage: i, duration: reducedMotion ? 0 : 1.4, ease: 'power2.inOut', overwrite: 'auto' })
          },
        }),
      )
      return () => triggers.forEach((tr) => tr.kill())
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
        <ol className="proc-steps">
          {t.process.steps.map((s, i) => (
            <li className={`proc-step ${i === active ? 'is-active' : ''}`} key={i} aria-current={i === active ? 'step' : undefined}>
              <span className="proc-num" aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="proc-name">{s.name}</h3>
              <p className="proc-desc">{s.desc}</p>
            </li>
          ))}
        </ol>
        <div className="proc-track" aria-hidden="true">
          <div className="proc-bar">
            <i />
          </div>
          <ol>
            {t.process.steps.map((s, i) => (
              <li key={i} className={i <= active ? 'is-on' : ''}>
                {s.form}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}
