import { clamp01, easeInOut } from '../core/env'

/**
 * Seven transitions, one language: every reveal happens inside the frame,
 * on the same timing curve, but each one cuts the image differently.
 * All functions take raw progress t (0..1) and ease internally.
 */
export type InStyle = { clip?: string; transform?: string; origin?: string }
export type OutStyle = { transform?: string; origin?: string; shade?: number }
export type Transition = { in: (t: number) => InStyle; out: (t: number) => OutStyle }

const pc = (v: number) => `${(v * 100).toFixed(2)}%`

/** 01 → 02: architectural blinds, six columns dropping in sequence */
const blinds: Transition = {
  in: (t) => {
    const n = 6
    const pts = ['0% 0%', '100% 0%']
    for (let j = n - 1; j >= 0; j--) {
      const h = easeInOut(clamp01(t * 1.5 - j * 0.1))
      pts.push(`${pc((j + 1) / n)} ${pc(h)}`, `${pc(j / n)} ${pc(h)}`)
    }
    return { clip: `polygon(${pts.join(',')})` }
  },
  out: (t) => ({ transform: `scale(${1 - easeInOut(t) * 0.06})`, shade: easeInOut(t) * 0.6 }),
}

/** 02 → 03: horizontal displacement with a slight shear */
const displace: Transition = {
  in: (t) => {
    const e = easeInOut(t)
    return { transform: `translateX(${((1 - e) * 100).toFixed(2)}%) skewX(${((1 - e) * -7).toFixed(2)}deg)`, origin: '0% 100%' }
  },
  out: (t) => {
    const e = easeInOut(t)
    return { transform: `translateX(${(-e * 32).toFixed(2)}%)`, shade: e * 0.7 }
  },
}

/** 03 → 04: iris opening from the plate's position */
const iris: Transition = {
  in: (t) => {
    const e = easeInOut(t)
    return { clip: `circle(${(e * 125).toFixed(2)}% at 78% 48%)`, transform: `scale(${(1.12 - e * 0.12).toFixed(4)})` }
  },
  out: (t) => ({ transform: `scale(${1 + easeInOut(t) * 0.14})`, shade: easeInOut(t) * 0.5 }),
}

/** 04 → 05: liquid surface rising from below */
const liquid: Transition = {
  in: (t) => {
    const e = easeInOut(t)
    const level = 1.1 - e * 1.22
    const amp = 0.06 * Math.sin(Math.PI * e)
    const pts = ['0% 100%', '100% 100%']
    for (let x = 1; x >= -0.001; x -= 0.05) {
      const y = level + amp * Math.sin(x * 9 + e * 7) + amp * 0.5 * Math.sin(x * 17 - e * 5)
      pts.push(`${pc(Math.max(0, x))} ${pc(y)}`)
    }
    return { clip: `polygon(${pts.join(',')})` }
  },
  out: (t) => ({ transform: `translateY(${(-easeInOut(t) * 10).toFixed(2)}%)`, shade: easeInOut(t) * 0.55 }),
}

/** 05 → 06: perspective turn, like a cube face folding away */
const turn: Transition = {
  in: (t) => {
    const e = easeInOut(t)
    return { transform: `rotateY(${((1 - e) * -72).toFixed(2)}deg)`, origin: '100% 50%' }
  },
  out: (t) => {
    const e = easeInOut(t)
    return { transform: `rotateY(${(e * 72).toFixed(2)}deg)`, origin: '0% 50%', shade: e * 0.8 }
  },
}

/** 06 → 07: fragmentation, eight bands sliding in from the right */
const shutter: Transition = {
  in: (t) => {
    const n = 8
    const pts = ['100% 0%', '100% 100%']
    for (let i = n - 1; i >= 0; i--) {
      const w = easeInOut(clamp01(t * 1.6 - i * 0.075))
      pts.push(`${pc(1 - w)} ${pc((i + 1) / n)}`, `${pc(1 - w)} ${pc(i / n)}`)
    }
    return { clip: `polygon(${pts.join(',')})` }
  },
  out: (t) => ({ transform: `translateX(${(-easeInOut(t) * 7).toFixed(2)}%)`, shade: easeInOut(t) * 0.65 }),
}

/** 07 → 08: the image expands out of a centred window */
const expand: Transition = {
  in: (t) => {
    const e = easeInOut(t)
    return {
      clip: `inset(${pc((1 - e) * 0.4)} ${pc((1 - e) * 0.36)} round ${((1 - e) * 28).toFixed(1)}px)`,
      transform: `scale(${(1.2 - e * 0.2).toFixed(4)})`,
    }
  },
  out: (t) => ({ transform: `scale(${1 + easeInOut(t) * 0.08})`, shade: easeInOut(t) * 0.7 }),
}

export const TRANSITIONS: Transition[] = [blinds, displace, iris, liquid, turn, shutter, expand]
