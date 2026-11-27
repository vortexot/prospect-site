import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Pending } from '../components/Pending'
import { CONTENT } from '../content'
import { useI18n } from '../i18n'

/** Answers drawn only from what the studio already states; the rest waits for real content. */
export function Faq() {
  const { t, lang } = useI18n()
  const timeline = CONTENT.timeline[lang]
  const price = CONTENT.priceRange[lang]
  const items = [...t.faq.items, ...(timeline ? [{ q: t.faq.timeline, a: timeline }] : []), ...(price ? [{ q: t.faq.price, a: price }] : [])]

  return (
    <section className="faq" id="faq" tabIndex={-1} aria-labelledby="faq-title">
      <h2 id="faq-title">{t.faq.title}</h2>
      <div>
        {items.map((it) => (
          // opening an answer moves everything below it
          <details key={it.q} onToggle={() => ScrollTrigger.refresh()}>
            <summary>{it.q}</summary>
            <p>{it.a}</p>
          </details>
        ))}
        {!timeline && <Pending what={t.pending.timeline} />}
        {!price && <Pending what={t.pending.price} />}
      </div>
    </section>
  )
}
