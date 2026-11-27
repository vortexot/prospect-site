import { SHOW_PENDING } from '../content'
import { useI18n } from '../i18n'

/** Marked placeholder for content the business still has to provide. Preview only. */
export function Pending({ what }: { what: string }) {
  const { t } = useI18n()
  if (!SHOW_PENDING) return null
  return (
    <p className="pending" data-pending="">
      [{t.pending.tag}] {what}
    </p>
  )
}
