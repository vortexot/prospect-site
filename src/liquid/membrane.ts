/**
 * The "flexible surface": a coarse grid of springs simulated on the CPU.
 * The cursor drags the cells around it, neighbours pull on each other (so the
 * motion spreads like a viscous fluid), and every cell eases back to rest.
 * Heavily damped on purpose: it should feel tactile, never like ripples.
 */
export const FEEL = {
  /** brush radius, as a fraction of the element's shorter side */
  radius: 0.24,
  /** how strongly cursor movement drags the surface */
  drag: 0.34,
  /** spring back to rest (higher = snappier recovery) */
  stiffness: 0.032,
  /** velocity kept per step (lower = thicker liquid) */
  damping: 0.865,
  /** pull between neighbouring cells */
  cohesion: 0.2,
  /** displacement limit, in element units */
  limit: 0.058,
  /** how quickly the brush follows the real cursor (weight) */
  follow: 0.2,
}

const LONG_SIDE = 56

export class Membrane {
  readonly cols: number
  readonly rows: number
  /** RGBA per cell: displacement x, displacement y, height, unused */
  readonly data: Float32Array
  private vel: Float32Array
  private prev: Float32Array
  private heightVel: Float32Array
  /** brush position (smoothed) and raw target, in element uv */
  x = 0.5
  y = 0.5
  private tx = 0.5
  private ty = 0.5
  private aspectX: number
  private aspectY: number

  constructor(aspect: number) {
    this.cols = aspect >= 1 ? LONG_SIDE : Math.max(20, Math.round(LONG_SIDE * aspect))
    this.rows = aspect >= 1 ? Math.max(20, Math.round(LONG_SIDE / aspect)) : LONG_SIDE
    const n = this.cols * this.rows
    this.data = new Float32Array(n * 4)
    this.prev = new Float32Array(n * 4)
    this.vel = new Float32Array(n * 2)
    this.heightVel = new Float32Array(n)
    this.aspectX = Math.max(aspect, 1)
    this.aspectY = Math.max(1 / aspect, 1)
  }

  /** Place the brush without dragging (pointer just arrived). */
  jump(u: number, v: number) {
    this.x = this.tx = u
    this.y = this.ty = v
  }

  aim(u: number, v: number) {
    this.tx = u
    this.ty = v
  }

  /**
   * One fixed 60 Hz step. `presence` is 1 while hovered, 0 after leaving.
   * Returns the remaining energy so the caller knows when the surface is at rest.
   */
  step(presence: number) {
    const { cols, rows, data, prev, vel, heightVel } = this
    const px = this.x
    const py = this.y
    this.x += (this.tx - this.x) * FEEL.follow
    this.y += (this.ty - this.y) * FEEL.follow
    const mx = this.x - px
    const my = this.y - py
    prev.set(data)
    const inv = 1 / (FEEL.radius * FEEL.radius)
    let energy = 0

    for (let r = 0; r < rows; r++) {
      const v = (r + 0.5) / rows
      for (let c = 0; c < cols; c++) {
        const i = r * cols + c
        const k = i * 4
        const u = (c + 0.5) / cols
        const ddx = (u - this.x) * this.aspectX
        const ddy = (v - this.y) * this.aspectY
        const w = Math.exp(-(ddx * ddx + ddy * ddy) * inv * 1.6)

        const left = c > 0 ? k - 4 : k
        const right = c < cols - 1 ? k + 4 : k
        const up = r > 0 ? k - cols * 4 : k
        const down = r < rows - 1 ? k + cols * 4 : k

        for (let a = 0; a < 2; a++) {
          const o = prev[k + a]
          const around = (prev[left + a] + prev[right + a] + prev[up + a] + prev[down + a]) * 0.25
          let s = vel[i * 2 + a]
          s += w * (a === 0 ? mx : my) * FEEL.drag * presence
          s += (around - o) * FEEL.cohesion - o * FEEL.stiffness
          s *= FEEL.damping
          let next = o + s
          if (next > FEEL.limit) next = FEEL.limit
          else if (next < -FEEL.limit) next = -FEEL.limit
          vel[i * 2 + a] = s
          data[k + a] = next
          energy = Math.max(energy, Math.abs(next), Math.abs(s) * 4)
        }

        // a soft swell under the cursor gives the surface depth
        const h = prev[k + 2]
        let hv = heightVel[i]
        hv += (w * presence - h) * 0.055
        hv *= 0.78
        heightVel[i] = hv
        data[k + 2] = h + hv
        if (presence === 0) energy = Math.max(energy, Math.abs(h + hv) * 0.05)
      }
    }
    return energy
  }

  reset() {
    this.data.fill(0)
    this.prev.fill(0)
    this.vel.fill(0)
    this.heightVel.fill(0)
  }
}
