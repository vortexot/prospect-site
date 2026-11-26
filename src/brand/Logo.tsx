import { MARK_BODY, MARK_TIP, WORD_OFFSET, WORD_PATH, toPath } from './logoPaths'

export const MARK_BODY_D = toPath(MARK_BODY)
export const MARK_TIP_D = toPath(MARK_TIP)
export const MARK_D = MARK_BODY_D + MARK_TIP_D
/** The hollow inside the star (body contour points 8–15). */
export const MARK_HOLE_D = toPath(MARK_BODY.slice(8, 16))

export function Mark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 234 254" aria-hidden="true" focusable="false">
      <path d={MARK_D} fill="currentColor" />
    </svg>
  )
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 8 760 122" aria-hidden="true" focusable="false">
      <path d={WORD_PATH} fill="currentColor" fillRule="evenodd" />
    </svg>
  )
}

export function Lockup({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1012 254" role="img" aria-label="Prospect">
      <path d={MARK_D} fill="currentColor" />
      <path d={WORD_PATH} fill="currentColor" fillRule="evenodd" transform={`translate(${WORD_OFFSET[0]} ${WORD_OFFSET[1]})`} />
    </svg>
  )
}
