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
}
