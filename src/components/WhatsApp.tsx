import { track } from '../core/track'
import { useI18n, waUrl } from '../i18n'
import { Roll } from './Roll'

export function WhatsAppIcon() {
  return (
    <svg className="wa-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M3.2 20.8l1.3-4.6a8.9 8.9 0 1 1 3.4 3.3z" />
      <path d="M9 7.9c.3-.3.8-.3 1 .1l.9 2c.1.3 0 .5-.2.8l-.5.6c.8 1.6 2 2.7 3.600 3.500l.6-.7c.2-.3.500-.3.800-.2l1.900.9c.3.100.400.400.300.700-.3 1.200-1.400 1.900-2.600 1.800-3.700-.4-7.200-3.900-7.500-7.400-.100-.8.500-1.600 1.700-2.100z" />
    </svg>
  )
}

type Props = {
  /** where on the page the click happened (sent with the analytics event) */
  placement: string
  /** visible text */
  label: string
  className?: string
  magnetic?: number
}

/** Every link that opens WhatsApp: same icon, same message, same measurement. */
export function WaLink({ placement, label, className = 'btn btn--solid', magnetic }: Props) {
  const { t, lang } = useI18n()
  return (
    <a
      className={className}
      href={waUrl(t.wa.message)}
      target="_blank"
      rel="noopener noreferrer"
      data-magnetic={magnetic}
      data-wa={placement}
      onClick={() => track('whatsapp_click', { placement, lang })}
    >
      <WhatsAppIcon />
      <Roll text={label} />
      <span className="sr-only"> ({t.wa.opens})</span>
    </a>
  )
}
