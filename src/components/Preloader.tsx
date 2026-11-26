import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { MARK_BODY_D, MARK_D, MARK_HOLE_D, MARK_TIP_D } from '../brand/Logo'
import { clamp01, easeOut, reducedMotion } from '../core/env'
import { useI18n } from '../i18n'

const SHARDS = 7
const CX = 117
const CY = 140
const shards = Array.from({ length: SHARDS }, (_, k) => {
  const a0 = (k / SHARDS) * Math.PI * 2 + 0.35
  const a1 = ((k + 1) / SHARDS) * Math.PI * 2 + 0.35
  const am = (a0 + a1) / 2
  const pt = (a: number) => `${CX + Math.cos(a) * 420} ${CY + Math.sin(a) * 420}`
  return {
    clip: `M${CX} ${CY}L${pt(a0)}L${pt(am)}L${pt(a1)}Z`,
    dx: Math.cos(am) * (60 + (k % 3) * 22),
    dy: Math.sin(am) * (60 + (k % 2) * 30),
    rot: ((k * 37) % 50) - 25,
  }
})
// Hole centre in mark coordinates (used as the origin for "passing through" the symbol).
const HOLE_ORIGIN = '113 142'
const VEIL_D = `M-30000 -30000H30234V30254H-30000Z${MARK_HOLE_D}`

type Props = { tasks: Promise<unknown>[]; onReveal: () => void; onDone: () => void }

export function Preloader({ tasks, onReveal, onDone }: Props) {
  const { t } = useI18n()
  const root = useRef<HTMLDivElement>(null)
  const [showSkip, setShowSkip] = useState(false)
  const exit = useRef<(fast: boolean) => void>(() => {})

  useEffect(() => {
    const el = root.current!
    const q = gsap.utils.selector(el)
    const shardEls = [...el.querySelectorAll<SVGGElement>('.pl-shard')]
    const num = el.querySelector<HTMLElement>('.pl-num')!
    const bar = el.querySelector<HTMLElement>('.pl-bar i')!
    const outline = el.querySelector<SVGPathElement>('.pl-outline')!
    const sweep = el.querySelector<SVGRectElement>('.pl-sweep')!

    let target = 0
    let shown = 0
    let finished = false
    let done = 0
    const start = performance.now()
    // short choreography; never hold the visitor more than ~3.5 s for slow devices
    const minTime = reducedMotion ? 200 : 1150
    tasks.forEach((p) =>
      Promise.race([p, new Promise((r) => setTimeout(r, 3500))])
        .catch(() => {})
        .then(() => {
          done++
          target = done / tasks.length
        }),
    )

    const sweepTween = reducedMotion ? null : gsap.fromTo(sweep, { attr: { x: -160 } }, { attr: { x: 300 }, duration: 1.8, ease: 'power2.inOut', repeat: -1, repeatDelay: 0.5 })
    const skipTimer = setTimeout(() => !finished && setShowSkip(true), 2000)

    const paint = (v: number) => {
      num.textContent = String(Math.round(v * 100)).padStart(3, '0')
      bar.style.transform = `scaleX(${v})`
      outline.style.strokeDashoffset = String(1 - clamp01(v * 1.7))
      outline.style.opacity = String(1 - clamp01((v - 0.75) / 0.25) * 0.85)
      shardEls.forEach((g, k) => {
        const e = reducedMotion ? 1 : easeOut(clamp01(v * 1.3 - k * 0.045))
        const s = shards[k]
        g.setAttribute('transform', `translate(${s.dx * (1 - e)} ${s.dy * (1 - e)}) rotate(${s.rot * (1 - e)} ${CX} ${CY})`)
        g.style.opacity = String(0.12 + 0.88 * e)
      })
    }

    const tick = () => {
      const cap = Math.min(target, (performance.now() - start) / minTime)
      shown += (cap - shown) * 0.14
      if (cap >= 1 && shown > 0.985) shown = 1
      paint(shown)
      if (shown === 1 && !finished) exit.current(false)
    }
    gsap.ticker.add(tick)

    exit.current = (fast: boolean) => {
      if (finished) return
      finished = true
      gsap.ticker.remove(tick)
      sweepTween?.kill()
      clearTimeout(skipTimer)
      setShowSkip(false)
      paint(1)
      if (reducedMotion || fast) {
        onReveal()
        gsap.to(el, { autoAlpha: 0, duration: 0.45, ease: 'power2.out', onComplete: onDone })
        return
      }
      const tl = gsap.timeline({ onComplete: onDone })
      tl.to(q('.pl-meta'), { autoAlpha: 0, y: 8, duration: 0.3, ease: 'power2.in' })
        .to(q('.pl-hair'), { scale: 0, duration: 0.4, ease: 'power3.in' }, 0)
        .fromTo(sweep, { attr: { x: -160 } }, { attr: { x: 300 }, duration: 0.4, ease: 'power2.inOut' }, 0)
        .to(q('.pl-mark-fill'), { opacity: 1, duration: 0.2, ease: 'power1.out' }, 0.15)
        .add(onReveal, 0.3)
        .to(q('.pl-zoom'), { scale: 95, svgOrigin: HOLE_ORIGIN, duration: 1.05, ease: 'expo.in' }, 0.3)
        .set(el, { autoAlpha: 0 })
    }

    return () => {
      gsap.ticker.remove(tick)
      sweepTween?.kill()
      clearTimeout(skipTimer)
    }
    // tasks are created once by the parent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="pl" ref={root} role="status" aria-label={t.loader.loading}>
      <span className="pl-hair pl-hair--x" aria-hidden="true" />
      <span className="pl-hair pl-hair--y" aria-hidden="true" />
      <svg className="pl-svg" viewBox="0 0 234 254" aria-hidden="true">
        <defs>
          <clipPath id="pl-mark-clip">
            <path d={MARK_BODY_D} />
            <path d={MARK_TIP_D} />
          </clipPath>
          <linearGradient id="pl-grad" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.95" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          {shards.map((s, k) => (
            <clipPath id={`pl-c${k}`} key={k}>
              <path d={s.clip} />
            </clipPath>
          ))}
        </defs>
        <g className="pl-zoom">
          <path className="pl-veil" d={VEIL_D} fillRule="evenodd" />
          {shards.map((_, k) => (
            <g className="pl-shard" key={k}>
              <g clipPath={`url(#pl-c${k})`}>
                <path d={MARK_D} className="pl-mark" />
              </g>
            </g>
          ))}
          <path d={MARK_D} className="pl-mark-fill" />
          <g clipPath="url(#pl-mark-clip)">
            <rect className="pl-sweep" x="-160" y="-20" width="90" height="300" fill="url(#pl-grad)" transform="skewX(-18)" />
          </g>
          <path d={MARK_D} className="pl-outline" pathLength={1} />
        </g>
      </svg>
      <div className="pl-meta" aria-hidden="true">
        <span className="pl-bar">
          <i />
        </span>
        <span className="pl-num">000</span>
      </div>
      {showSkip && (
        <button className="pl-skip" type="button" onClick={() => exit.current(true)}>
          {t.loader.skip}
        </button>
      )}
    </div>
  )
}
