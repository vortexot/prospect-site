import '@fontsource-variable/archivo/standard.css'
import './styles/notfound.css'
import { MARK_BODY, MARK_TIP, toPath } from './brand/logoPaths'

// The star, broken into wedges that drift with the pointer.
const host = document.querySelector<HTMLElement>('.nf-shards')!
const N = 6
const cx = 117
const cy = 140
const d = toPath(MARK_BODY) + toPath(MARK_TIP)
const clips: string[] = []
const groups: string[] = []
for (let k = 0; k < N; k++) {
  const a0 = (k / N) * Math.PI * 2 + 0.4
  const a1 = ((k + 1) / N) * Math.PI * 2 + 0.4
  const pt = (a: number) => `${cx + Math.cos(a) * 400} ${cy + Math.sin(a) * 400}`
  clips.push(`<clipPath id="c${k}"><path d="M${cx} ${cy}L${pt(a0)}L${pt((a0 + a1) / 2)}L${pt(a1)}Z"/></clipPath>`)
  groups.push(`<g class="nf-shard" data-a="${((a0 + a1) / 2).toFixed(3)}"><g clip-path="url(#c${k})"><path d="${d}"/></g></g>`)
}
host.innerHTML = `<svg viewBox="0 0 234 254"><defs>${clips.join('')}</defs>${groups.join('')}</svg>`
const shards = [...host.querySelectorAll<SVGGElement>('.nf-shard')]
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
let tx = 0
let ty = 0
let x = 0
let y = 0
const t0 = performance.now()
addEventListener('pointermove', (e) => {
  tx = e.clientX / innerWidth - 0.5
  ty = e.clientY / innerHeight - 0.5
})
const frame = (now: number) => {
  x += (tx - x) * 0.06
  y += (ty - y) * 0.06
  const t = reduced ? 0 : (now - t0) / 1000
  shards.forEach((g, i) => {
    const a = Number(g.dataset.a)
    const r = 18 + Math.sin(t * 0.6 + i) * 6 + Math.hypot(x, y) * 40
    g.setAttribute('transform', `translate(${Math.cos(a) * r + x * (10 + i * 4)} ${Math.sin(a) * r + y * (10 + i * 4)}) rotate(${Math.sin(t * 0.3 + i) * 6 + x * 12} ${cx} ${cy})`)
  })
  if (!reduced) requestAnimationFrame(frame)
}
requestAnimationFrame(frame)
