/**
 * The single contract between the DOM (GSAP / ScrollTrigger) and the WebGL universe.
 * Sections write these numbers; the render loop reads them every frame.
 */
export const S = {
  /** pointer in normalized device coordinates, -1..1 */
  px: 0,
  py: 0,
  /** accumulated drag rotation of the tower (radians) */
  spin: 0,
  /** 0 → 1 the tower assembles itself when the preloader opens */
  assemble: 0,
  /** 0 = intact tower, 1 = fractured into debris (hero → showcase) */
  explode: 0,
  /** 0..1 pushes the debris back while reading-heavy sections are on screen */
  dim: 0,
  /** 0..1 how much the process section owns the structure */
  processMix: 0,
  /** 0..3 raw fragments → geometry → construction → light */
  stage: 0,
  /** 0..1 everything collapses into one point (final CTA) */
  converge: 0,
  /** index of the slice under the cursor, -1 when none */
  hovered: -1,
  /** 0..1 fades the whole 3D layer while the showcase frame and its index are read */
  hush: 0,
  /** 1 on very narrow screens, where the structure is darkened so the headline reads */
  faint: 0,
  /** 0..1 darkens the structure while the closing title is over it */
  cover: 0,
  /**
   * Free screen areas (centre and size as fractions of the viewport) where the structure
   * may be drawn. The DOM measures them so the 3D never sits behind text.
   */
  heroBox: { x: 0.74, y: 0.52, w: 0.46, h: 0.82 } as Box,
  procBox: { x: 0.73, y: 0.5, w: 0.44, h: 0.74 } as Box,
}

export type Box = { x: number; y: number; w: number; h: number }

/** Builds a Box from pixel edges inside the viewport. */
export function toBox(left: number, top: number, right: number, bottom: number): Box {
  const vw = window.innerWidth
  const vh = document.querySelector<HTMLElement>('.gl')?.clientHeight || window.innerHeight
  return { x: (left + right) / 2 / vw, y: (top + bottom) / 2 / vh, w: Math.max(0, right - left) / vw, h: Math.max(0, bottom - top) / vh }
}
